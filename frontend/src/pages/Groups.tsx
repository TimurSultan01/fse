import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Group } from '../types';

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    api.getGroups()
      .then(setGroups)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      });
  }, []);

  return (
    <section>
      <h1>Gruppen</h1>
      <p>Finde Community-Gruppen nach Region und Interesse.</p>

      {error && <p className="message error">{error}</p>}

      <div className="grid">
        {groups.map((group) => (
          <article className="card" key={group.id}>
            <h2>{group.name}</h2>
            <p>{group.description}</p>
            <dl className="facts">
              <div><dt>Region</dt><dd>{group.region}</dd></div>
              <div><dt>Mitglieder</dt><dd>{group.members}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
