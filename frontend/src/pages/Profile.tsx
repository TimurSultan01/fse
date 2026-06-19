import { useState } from 'react';
import { usePilotName } from '../hooks/usePilotName';

export default function Profile() {
  const { pilotName, setPilotName } = usePilotName();
  const [draft, setDraft] = useState<string>(pilotName);
  const [saved, setSaved] = useState<boolean>(false);

  function save(): void {
    setPilotName(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="form-page">
      <h1>Profil</h1>
      <p>
        Da es in diesem Prototyp kein echtes Login gibt, wird dein Pilotinnen- oder Pilotenname
        lokal im Browser gespeichert. Dieser Name wird für Teilnahmen, Gruppen und Chat verwendet.
      </p>

      <div className="form-card">
        <label>
          Dein Name
          <input value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>

        <button onClick={save}>Profil speichern</button>

        {saved && <p className="message success">Name gespeichert.</p>}
      </div>
    </section>
  );
}
