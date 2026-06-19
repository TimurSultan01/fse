import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';
import type { ChatMessage } from '../types';

type ChatBoxProps = {
  title?: string;
  groupId?: number;
  meetupId?: number;
};

export default function ChatBox({ title = 'Chat', groupId, meetupId }: ChatBoxProps) {
  const { user } = useAuth();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  async function loadMessages(): Promise<void> {
    try {
      setMessages(await api.getMessages({ group_id: groupId, meetup_id: meetupId }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMessages();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, meetupId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, 5000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, groupId, meetupId]);

  async function send(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');

    const finalText = text.trim();

    if (!user) {
      setError('Bitte melde dich zuerst an.');
      return;
    }

    if (!finalText) return;

    try {
      const created = await api.sendMessage(finalText, {
        group_id: groupId,
        meetup_id: meetupId,
      });
      setMessages((current) => [...current, created]);
      setText('');
      toast('Nachricht wurde gesendet.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast(err instanceof Error ? err.message : 'Nachricht konnte nicht gesendet werden.', 'error');
    }
  }

  async function deleteMessage(id: number): Promise<void> {
    try {
      await api.deleteMessage(id);
      setMessages((current) => current.filter((message) => message.id !== id));
      toast('Nachricht wurde gelöscht.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast(err instanceof Error ? err.message : 'Nachricht konnte nicht gelöscht werden.', 'error');
    }
  }

  function requestDeleteMessage(id: number): void {
    requestConfirmation({
      title: 'Nachricht löschen?',
      message: 'Diese Nachricht wird dauerhaft aus dem Chat entfernt.',
      confirmLabel: 'Löschen',
      tone: 'danger',
      onConfirm: () => void deleteMessage(id),
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

      <div className="chat-box">
        {messages.map((message) => (
          <article className="chat-message" key={message.id}>
            <div className="chat-header">
              <strong>{message.author}</strong>
              {(message.user_id === user?.id || message.author.toLowerCase() === user?.display_name.toLowerCase()) && (
                <button className="mini-danger" onClick={() => requestDeleteMessage(message.id)}>Löschen</button>
              )}
            </div>
            <p>{message.text}</p>
            {message.created_at && <small>{message.created_at}</small>}
          </article>
        ))}

        {messages.length === 0 && <p>Noch keine Nachrichten vorhanden.</p>}
      </div>

      <form className="chat-form" onSubmit={(event) => void send(event)}>
        <span className="chat-author">{user ? user.display_name : 'Nicht eingeloggt'}</span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Neue Nachricht"
          disabled={!user}
          required
        />
        <button disabled={!user}>Senden</button>
      </form>

      {error && <p className="message error">{error}</p>}
    </section>
  );
}
