import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { usePilotName } from '../hooks/usePilotName';
import type { GroupDetail as GroupDetailType } from '../types';
import ChatBox from '../components/ChatBox';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { pilotName, setPilotName } = usePilotName();

  const [group, setGroup] = useState<GroupDetailType | null>(null);
  const [nameDraft, setNameDraft] = useState<string>(pilotName);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const joined = group?.members?.some(
    (member) => member.pilot_name.toLowerCase() === pilotName.toLowerCase()
  ) ?? false;

  async function loadGroup(): Promise<void> {
    if (!id) return;

    try {
      setGroup(await api.getGroup(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  useEffect(() => {
    void loadGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleMembership(): Promise<void> {
    if (!id) return;

    const finalName = nameDraft.trim();
    if (!finalName) {
      setError('Bitte gib deinen Namen ein.');
      return;
    }

    setPilotName(finalName);
    setMessage('');
    setError('');

    try {
      const updated = joined
        ? await api.leaveGroup(id, finalName)
        : await api.joinGroup(id, finalName);

      setGroup(updated);
      setMessage(joined ? 'Du bist aus der Gruppe ausgetreten.' : 'Du bist der Gruppe beigetreten.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  if (!group) {
    return error ? <p className="message error">{error}</p> : <p>Lade Gruppe...</p>;
  }

  return (
    <section>
      <article className="detail">
        <h1>{group.name}</h1>
        <p>{group.description}</p>

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
          <label>
            Dein Name
            <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
          </label>

          <button onClick={() => void toggleMembership()}>
            {joined ? 'Gruppe verlassen' : 'Gruppe beitreten'}
          </button>
        </div>

        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}
      </article>

      <ChatBox groupId={group.id} title={`Gruppenchat: ${group.name}`} />
    </section>
  );
}
