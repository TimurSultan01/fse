import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';

type ChatBoxProps = {
  title?: string;
  groupId?: number;
  meetupId?: number;
};

export default function ChatBox({ title = 'Chat', groupId, meetupId }: ChatBoxProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);
  const [text, setText] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const listRef = useRef<HTMLDivElement>(null);

  const queryKey = ['messages', { groupId: groupId ?? null, meetupId: meetupId ?? null }];

  const messagesQuery = useQuery({
    queryKey,
    queryFn: () => api.getMessages({ group_id: groupId, meetup_id: meetupId }),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (message: string) => api.sendMessage(message, { group_id: groupId, meetup_id: meetupId }),
    onSuccess() {
      setText('');
      void queryClient.invalidateQueries({ queryKey });
    },
    onError(err) {
      toast(err instanceof Error ? err.message : 'Nachricht konnte nicht gesendet werden.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteMessage(id),
    onSuccess() {
      toast('Nachricht wurde gelöscht.', 'success');
      void queryClient.invalidateQueries({ queryKey });
    },
    onError(err) {
      toast(err instanceof Error ? err.message : 'Nachricht konnte nicht gelöscht werden.', 'error');
    },
  });

  function send(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!user) {
      toast('Bitte melde dich zuerst an.', 'error');
      return;
    }

    const finalText = text.trim();
    if (!finalText) return;

    sendMutation.mutate(finalText);
  }

  function requestDeleteMessage(id: number): void {
    requestConfirmation({
      title: 'Nachricht löschen?',
      message: 'Diese Nachricht wird dauerhaft aus dem Chat entfernt.',
      confirmLabel: 'Löschen',
      tone: 'danger',
      onConfirm: () => deleteMutation.mutate(id),
    });
  }

  return (
    <section className="chat-section">
      <div className="page-title">
        <div>
          <h1>{title}</h1>
          <p>Nachrichten werden alle 5 Sekunden aktualisiert.</p>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(event) => setAutoRefresh(event.target.checked)}
          />
          Auto-Refresh
        </label>
      </div>

      <div className="chat-box" ref={listRef}>
        {messages.map((message) => (
          <article className="chat-message" key={message.id}>
            <div className="chat-header">
              <strong>{message.author}</strong>
              {message.user_id === user?.id && (
                <button className="mini-danger" onClick={() => requestDeleteMessage(message.id)}>Löschen</button>
              )}
            </div>
            <p>{message.text}</p>
            {message.created_at && <small>{message.created_at}</small>}
          </article>
        ))}

        {messages.length === 0 && <p className="chat-empty">Noch keine Nachrichten vorhanden.</p>}
      </div>

      <form className="chat-form" onSubmit={send}>
        <span className="chat-author">{user ? user.display_name : 'Nicht eingeloggt'}</span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Neue Nachricht"
          disabled={!user}
          required
        />
        <button disabled={!user || sendMutation.isPending}>Senden</button>
      </form>

      {messagesQuery.isError && (
        <p className="message error">
          {messagesQuery.error instanceof Error ? messagesQuery.error.message : 'Unbekannter Fehler'}
        </p>
      )}
    </section>
  );
}
