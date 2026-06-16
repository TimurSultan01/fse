import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { MeetupFormData } from '../types';

const initialForm: MeetupFormData = {
  title: '',
  spot: '',
  region: '',
  date: '',
  time: '',
  experience_level: 'Einsteiger',
  max_participants: 6,
  description: '',
};

export default function NewMeetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState<MeetupFormData>(initialForm);
  const [error, setError] = useState<string>('');

  function updateForm(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === 'max_participants' ? Number(value) : value,
    }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');

    try {
      await api.createMeetup(form);
      navigate('/flugtreffen');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }

  return (
    <section className="form-page">
      <h1>Neues Flugtreffen erstellen</h1>

      <form className="form-card" onSubmit={(event) => void submitForm(event)}>
        <label>
          Titel
          <input name="title" value={form.title} onChange={updateForm} required />
        </label>

        <label>
          Flugspot
          <input name="spot" value={form.spot} onChange={updateForm} required />
        </label>

        <label>
          Region
          <input name="region" value={form.region} onChange={updateForm} required />
        </label>

        <div className="two-columns">
          <label>
            Datum
            <input type="date" name="date" value={form.date} onChange={updateForm} required />
          </label>

          <label>
            Uhrzeit
            <input type="time" name="time" value={form.time} onChange={updateForm} required />
          </label>
        </div>

        <div className="two-columns">
          <label>
            Erfahrungslevel
            <select name="experience_level" value={form.experience_level} onChange={updateForm}>
              <option>Einsteiger</option>
              <option>Fortgeschritten</option>
              <option>Alle Level</option>
            </select>
          </label>

          <label>
            Maximale Teilnehmerzahl
            <input
              type="number"
              min="1"
              name="max_participants"
              value={form.max_participants}
              onChange={updateForm}
              required
            />
          </label>
        </div>

        <label>
          Beschreibung
          <textarea
            name="description"
            value={form.description}
            onChange={updateForm}
            rows={5}
            required
          />
        </label>

        <button>Flugtreffen speichern</button>
        {error && <p className="message error">{error}</p>}
      </form>
    </section>
  );
}
