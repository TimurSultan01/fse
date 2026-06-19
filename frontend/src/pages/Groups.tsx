import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Group, GroupFormData } from '../types';

const emptyGroup: GroupFormData = {
  name: '',
  region: '',
  description: '',
};

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [form, setForm] = useState<GroupFormData>(emptyGroup);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  async function loadGroups(): Promise<void> {
    try {
      setGroups(await api.getGroups());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  useEffect(() => {
    void loadGroups();
  }, []);

  function updateForm(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function createGroup(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');

    try {
      await api.createGroup(form);
      setForm(emptyGroup);
      setShowForm(false);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Gruppen</h1>
          <p>Finde Community-Gruppen nach Region und Interesse oder erstelle eine neue Gruppe.</p>
        </div>
        <button onClick={() => setShowForm((value) => !value)}>
          {showForm ? 'Formular schließen' : 'Neue Gruppe'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={(event) => void createGroup(event)}>
          <label>
            Gruppenname
            <input name="name" value={form.name} onChange={updateForm} required />
          </label>

          <label>
            Region
            <input name="region" value={form.region} onChange={updateForm} required />
          </label>

          <label>
            Beschreibung
            <textarea name="description" value={form.description} onChange={updateForm} rows={4} required />
          </label>

          <button>Gruppe speichern</button>
        </form>
      )}

      {error && <p className="message error">{error}</p>}

      <div className="grid">
        {groups.map((group) => (
          <Link className="card" to={`/gruppen/${group.id}`} key={group.id}>
            <h2>{group.name}</h2>
            <p>{group.description}</p>
            <dl className="facts">
              <div><dt>Region</dt><dd>{group.region}</dd></div>
              <div><dt>Mitglieder</dt><dd>{group.member_count ?? 0}</dd></div>
            </dl>
          </Link>
        ))}
      </div>
    </section>
  );
}
