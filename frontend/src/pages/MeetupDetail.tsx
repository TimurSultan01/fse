import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import type { MeetupDetail as MeetupDetailType } from '../types';

export default function MeetupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meetup, setMeetup] = useState<MeetupDetailType | null>(null);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const joined = meetup?.participants?.some(
    (participant) => participant.user_id === user?.id
      || participant.pilot_name.toLowerCase() === user?.display_name.toLowerCase()
  ) ?? false;
  const canManage = meetup?.can_manage === true;

  async function loadMeetup(): Promise<void> {
    if (!id) return;

    try {
      setMeetup(await api.getMeetup(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMeetup();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleParticipation(): Promise<void> {
    if (!id) return;
    if (!user) {
      setError('Bitte melde dich zuerst an.');
      return;
    }

    setMessage('');
    setError('');

    try {
      const updated = joined
        ? await api.leaveMeetup(id)
        : await api.joinMeetup(id);

      setMeetup(updated);
      setMessage(joined ? 'Teilnahme wurde zurückgenommen.' : 'Du nimmst jetzt am Flugtreffen teil.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  async function deleteMeetup(): Promise<void> {
    if (!id) return;

    const confirmed = window.confirm('Dieses Flugtreffen wirklich löschen?');
    if (!confirmed) return;

    try {
      await api.deleteMeetup(id);
      navigate('/flugtreffen');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  if (error && !meetup) {
    return <p className="message error">{error}</p>;
  }

  if (!meetup) {
    return <p>Lade Detailansicht...</p>;
  }

  const isFull = meetup.free_places <= 0 && !joined;

  return (
    <section>
      <button className="link-button" onClick={() => navigate(-1)}>Zurück</button>

      <article className="detail">
        <div className="card-header">
          <h1>{meetup.title}</h1>
          <span className={`badge ${meetup.status === 'voll' ? 'full' : ''}`}>
            {meetup.status}
          </span>
        </div>

        <p>{meetup.description}</p>

        <dl className="facts detail-facts">
          <div><dt>Flugspot</dt><dd>{meetup.spot}</dd></div>
          <div><dt>Region</dt><dd>{meetup.region}</dd></div>
          <div><dt>Datum und Uhrzeit</dt><dd>{meetup.date} um {meetup.time}</dd></div>
          <div><dt>Erfahrungslevel</dt><dd>{meetup.experience_level}</dd></div>
          <div><dt>Freie Plätze</dt><dd>{meetup.free_places}</dd></div>
        </dl>

        <h2>Teilnehmerliste</h2>
        {meetup.participants.length > 0 ? (
          <ul>
            {meetup.participants.map((participant) => (
              <li key={participant.id}>{participant.pilot_name}</li>
            ))}
          </ul>
        ) : (
          <p>Noch keine Teilnehmenden.</p>
        )}

        <div className="join-box">
          <div>
            <strong>{user ? user.display_name : 'Nicht eingeloggt'}</strong>
            <p>{user ? 'Deine Teilnahme wird mit deinem Account gespeichert.' : 'Melde dich an, um teilzunehmen.'}</p>
          </div>

          <button onClick={() => void toggleParticipation()} disabled={isFull || !user}>
            {joined ? 'Absagen' : 'Teilnehmen'}
          </button>
        </div>

        <div className="actions">
          {canManage && (
            <>
              <Link className="button secondary" to={`/flugtreffen/${meetup.id}/bearbeiten`}>Bearbeiten</Link>
              <button className="danger-button" onClick={() => void deleteMeetup()}>Löschen</button>
            </>
          )}
          <Link className="button secondary" to="/flugtreffen">Zurück zur Übersicht</Link>
        </div>

        {isFull && <p className="message error">Dieses Treffen ist voll.</p>}
        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}
      </article>
    </section>
  );
}
