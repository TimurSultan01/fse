import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import { usePilotName } from '../hooks/usePilotName';
import type { ChatMessage } from '../types';

type ChatBoxProps = {
  title?: string;
  groupId?: number;
  meetupId?: number;
};

export default function ChatBox({ title = 'Chat', groupId, meetupId }: ChatBoxProps) {
  const { pilotName, setPilotName } = usePilotName();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [author, setAuthor] = useState<string>(pilotName);
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
    void loadMessages();
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

    const finalAuthor = author.trim();
    const finalText = text.trim();

    if (!finalAuthor || !finalText) return;

    try {
      setPilotName(finalAuthor);
      const created = await api.sendMessage(finalAuthor, finalText, {
        group_id: groupId,
        meetup_id: meetupId,
      });
      setMessages((current) => [...current, created]);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  async function deleteMessage(id: number): Promise<void> {
    try {
      await api.deleteMessage(id);
      setMessages((current) => current.filter((message) => message.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
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
              {message.author.toLowerCase() === author.trim().toLowerCase() && (
                <button className="mini-danger" onClick={() => void deleteMessage(message.id)}>Löschen</button>
              )}
            </div>
            <p>{message.text}</p>
            {message.created_at && <small>{message.created_at}</small>}
          </article>
        ))}

        {messages.length === 0 && <p>Noch keine Nachrichten vorhanden.</p>}
      </div>

      <form className="chat-form" onSubmit={(event) => void send(event)}>
        <input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Dein Name"
          required
        />
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Neue Nachricht"
          required
        />
        <button>Senden</button>
      </form>

      {error && <p className="message error">{error}</p>}
    </section>
  );
}
