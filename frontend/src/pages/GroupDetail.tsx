import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';
import type { GroupDetail as GroupDetailType, GroupFormData } from '../types';
import ChatBox from '../components/ChatBox';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);
  const queryClient = useQueryClient();

  const [group, setGroup] = useState<GroupDetailType | null>(null);
  const [form, setForm] = useState<GroupFormData>({ name: '', region: '', description: '' });
  const [editing, setEditing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const joined = group?.members?.some(
    (member) => member.user_id === user?.id
      || member.pilot_name.toLowerCase() === user?.display_name.toLowerCase()
  ) ?? false;
  const canManage = group?.can_manage === true;

  async function loadGroup(): Promise<void> {
    if (!id) return;

    try {
      const loadedGroup = await api.getGroup(id);
      setGroup(loadedGroup);
      setForm({
        name: loadedGroup.name,
        region: loadedGroup.region,
        description: loadedGroup.description,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadGroup();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function updateForm(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function saveGroup(): Promise<void> {
    if (!id) return;

    setMessage('');
    setError('');

    try {
      const updated = await api.updateGroup(id, form);
      setGroup(updated);
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      setEditing(false);
      setMessage('Gruppe wurde gespeichert.');
      toast('Gruppe wurde gespeichert.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast(err instanceof Error ? err.message : 'Gruppe konnte nicht gespeichert werden.', 'error');
    }
  }

  function requestSaveGroup(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    requestConfirmation({
      title: 'Gruppe speichern?',
      message: 'Die Änderungen werden für alle Mitglieder sichtbar.',
      confirmLabel: 'Speichern',
      onConfirm: () => void saveGroup(),
    });
  }

  async function deleteGroup(): Promise<void> {
    if (!id) return;

    try {
      await api.deleteGroup(id);
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast('Gruppe wurde gelöscht.', 'success');
      navigate('/gruppen');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast(err instanceof Error ? err.message : 'Gruppe konnte nicht gelöscht werden.', 'error');
    }
  }

  function requestDeleteGroup(): void {
    requestConfirmation({
      title: 'Gruppe löschen?',
      message: 'Diese Aktion entfernt die Gruppe, Mitgliedschaften und zugehörige Gruppenchats dauerhaft.',
      confirmLabel: 'Löschen',
      tone: 'danger',
      onConfirm: () => void deleteGroup(),
    });
  }

  async function toggleMembership(): Promise<void> {
    if (!id) return;
    if (!user) {
      setError('Bitte melde dich zuerst an.');
      return;
    }

    setMessage('');
    setError('');

    try {
      const updated = joined
        ? await api.leaveGroup(id)
        : await api.joinGroup(id);

      setGroup(updated);
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      setMessage(joined ? 'Du bist aus der Gruppe ausgetreten.' : 'Du bist der Gruppe beigetreten.');
      toast(joined ? 'Du bist aus der Gruppe ausgetreten.' : 'Du bist der Gruppe beigetreten.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast(err instanceof Error ? err.message : 'Mitgliedschaft konnte nicht geändert werden.', 'error');
    }
  }

  if (!group) {
    return error ? <p className="message error">{error}</p> : <p>Lade Gruppe...</p>;
  }

  return (
    <section>
      <article className="detail">
        {editing ? (
          <form className="inline-edit" onSubmit={requestSaveGroup}>
            <label>
              Gruppenname
              <input name="name" value={form.name} onChange={updateForm} minLength={3} maxLength={120} required />
            </label>

            <label>
              Region
              <input name="region" value={form.region} onChange={updateForm} maxLength={80} required />
            </label>

            <label>
              Beschreibung
              <textarea name="description" value={form.description} onChange={updateForm} rows={4} required />
            </label>

            <div className="actions">
              <button>Speichern</button>
              <button type="button" className="secondary-button" onClick={() => setEditing(false)}>Abbrechen</button>
            </div>
          </form>
        ) : (
          <>
            <h1>{group.name}</h1>
            <p>{group.description}</p>
          </>
        )}

        <dl className="facts detail-facts">
          <div><dt>Region</dt><dd>{group.region}</dd></div>
          <div><dt>Mitglieder</dt><dd>{group.member_count}</dd></div>
        </dl>

        <h2>Mitglieder</h2>
        {group.members.length > 0 ? (
          <ul>
            {group.members.map((member) => (
              <li key={member.id}>{member.pilot_name}</li>
            ))}
          </ul>
        ) : (
          <p>Noch keine Mitglieder.</p>
        )}

        <div className="join-box">
          <div>
            <strong>{user ? user.display_name : 'Nicht eingeloggt'}</strong>
            <p>{user ? 'Deine Mitgliedschaft wird mit deinem Account gespeichert.' : 'Melde dich an, um Gruppen beizutreten.'}</p>
          </div>

          <button onClick={() => void toggleMembership()} disabled={!user}>
            {joined ? 'Gruppe verlassen' : 'Gruppe beitreten'}
          </button>
        </div>

        {canManage && !editing && (
          <div className="actions">
            <button className="secondary-button" onClick={() => setEditing(true)}>Bearbeiten</button>
            <button className="danger-button" onClick={requestDeleteGroup}>Löschen</button>
          </div>
        )}

        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}
      </article>

      <ChatBox groupId={group.id} title={`Gruppenchat: ${group.name}`} />
    </section>
  );
}
