import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import type { ChatMessage } from '../types';

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [author, setAuthor] = useState<string>('Gastpilot');
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function loadMessages(): Promise<void> {
    try {
      setMessages(await api.getMessages());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  async function send(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');

    if (!text.trim()) return;

    try {
      const created = await api.sendMessage(author, text);
      setMessages((current) => [...current, created]);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  return (
    <section>
      <h1>Chat</h1>
      <p>Ein einfacher Gruppenchat für kurze Absprachen.</p>

      <div className="chat-box">
        {messages.map((message) => (
          <article className="chat-message" key={message.id}>
            <strong>{message.author}</strong>
            <p>{message.text}</p>
            {message.created_at && <small>{message.created_at}</small>}
          </article>
        ))}
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
