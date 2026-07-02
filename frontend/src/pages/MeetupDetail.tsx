import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';
import type { MeetupDetail as MeetupDetailType } from '../types';

export default function MeetupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);
  const queryClient = useQueryClient();

  const meetupQuery = useQuery({
    queryKey: ['meetup', id],
    queryFn: () => api.getMeetup(id!),
    enabled: Boolean(id),
  });

  const meetup = meetupQuery.data ?? null;
  const joined = meetup?.participants?.some((participant) => participant.user_id === user?.id) ?? false;
  const canManage = meetup?.can_manage === true;

  function syncCaches(updated: MeetupDetailType): void {
    queryClient.setQueryData(['meetup', id], updated);
    void queryClient.invalidateQueries({ queryKey: ['meetups'] });
  }

  const participationMutation = useMutation({
    mutationFn: () => (joined ? api.leaveMeetup(id!) : api.joinMeetup(id!)),
    onSuccess(updated) {
      syncCaches(updated);
      toast(joined ? 'Teilnahme wurde zurückgenommen.' : 'Du nimmst jetzt am Flugtreffen teil.', 'success');
    },
    onError(err) {
      toast(err instanceof Error ? err.message : 'Teilnahme konnte nicht geändert werden.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteMeetup(id!),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['meetups'] });
      queryClient.removeQueries({ queryKey: ['meetup', id] });
      toast('Flugtreffen wurde gelöscht.', 'success');
      navigate('/flugtreffen');
    },
    onError(err) {
      toast(err instanceof Error ? err.message : 'Flugtreffen konnte nicht gelöscht werden.', 'error');
    },
  });

  function toggleParticipation(): void {
    if (!user) {
      toast('Bitte melde dich zuerst an.', 'error');
      return;
    }
    participationMutation.mutate();
  }

  function requestDeleteMeetup(): void {
    requestConfirmation({
      title: 'Flugtreffen löschen?',
      message: 'Diese Aktion entfernt das Flugtreffen und alle zugehörigen Teilnahmen dauerhaft.',
      confirmLabel: 'Löschen',
      tone: 'danger',
      onConfirm: () => deleteMutation.mutate(),
    });
  }

  if (meetupQuery.isError) {
    return (
      <p className="message error">
        {meetupQuery.error instanceof Error ? meetupQuery.error.message : 'Unbekannter Fehler'}
      </p>
    );
  }

  if (!meetup) {
    return <p className="loading-note">Lade Detailansicht...</p>;
  }

  const isFull = meetup.free_places <= 0 && !joined;

  return (
    <section>
      <button className="link-button" onClick={() => navigate(-1)}>← Zurück</button>

      <article className="detail">
        <div className="card-header">
          <h1>{meetup.title}</h1>
          <span className={`badge ${meetup.status === 'voll' ? 'full' : ''}`}>
            {meetup.status}
          </span>
        </div>

        <p className="detail-lead">{meetup.description}</p>

        <dl className="facts detail-facts">
          <div><dt>Flugspot</dt><dd>{meetup.spot}</dd></div>
          <div><dt>Region</dt><dd>{meetup.region}</dd></div>
          <div><dt>Datum und Uhrzeit</dt><dd>{meetup.date} um {meetup.time}</dd></div>
          <div><dt>Erfahrungslevel</dt><dd>{meetup.experience_level}</dd></div>
          <div><dt>Freie Plätze</dt><dd>{meetup.free_places}</dd></div>
        </dl>

        <h2>Teilnehmerliste</h2>
        {meetup.participants.length > 0 ? (
          <ul className="compact-list">
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

          <button
            onClick={toggleParticipation}
            disabled={isFull || !user || participationMutation.isPending}
          >
            {joined ? 'Absagen' : 'Teilnehmen'}
          </button>
        </div>

        <div className="actions">
          {canManage && (
            <>
              <Link className="button secondary" to={`/flugtreffen/${meetup.id}/bearbeiten`}>Bearbeiten</Link>
              <button className="danger-button" onClick={requestDeleteMeetup} disabled={deleteMutation.isPending}>
                Löschen
              </button>
            </>
          )}
          <Link className="button secondary" to="/flugtreffen">Zurück zur Übersicht</Link>
        </div>

        {isFull && <p className="message error">Dieses Treffen ist voll.</p>}
      </article>
    </section>
  );
}
