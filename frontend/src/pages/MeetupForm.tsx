import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';
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

export default function MeetupForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<MeetupFormData>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');
  const [forbidden, setForbidden] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    api.getMeetup(id)
      .then((meetup) => {
        if (meetup.can_manage === false) {
          setForbidden(true);
          return;
        }

        setForm({
          title: meetup.title,
          spot: meetup.spot,
          region: meetup.region,
          date: meetup.date,
          time: meetup.time.slice(0, 5),
          experience_level: meetup.experience_level,
          max_participants: meetup.max_participants,
          description: meetup.description,
        });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unbekannter Fehler'));
  }, [id]);

  function validate(data: MeetupFormData): Record<string, string> {
    const errors: Record<string, string> = {};
    const today = new Date().toISOString().slice(0, 10);

    if (data.title.trim().length < 3) errors.title = 'Der Titel muss mindestens 3 Zeichen haben.';
    if (data.spot.trim().length < 2) errors.spot = 'Bitte gib einen Flugspot ein.';
    if (data.region.trim().length < 2) errors.region = 'Bitte gib eine Region ein.';
    if (!data.date) errors.date = 'Bitte gib ein Datum ein.';
    if (data.date && data.date < today) errors.date = 'Das Datum darf nicht in der Vergangenheit liegen.';
    if (!data.time) errors.time = 'Bitte gib eine Uhrzeit ein.';
    if (data.max_participants < 1) errors.max_participants = 'Mindestens eine Person muss teilnehmen können.';
    if (data.description.trim().length < 10) errors.description = 'Die Beschreibung muss mindestens 10 Zeichen haben.';

    return errors;
  }

  function updateForm(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === 'max_participants' ? Number(value) : value,
    }));
  }

  async function saveMeetup(): Promise<void> {
    try {
      if (id) {
        await api.updateMeetup(id, form);
        void queryClient.invalidateQueries({ queryKey: ['meetups'] });
        toast('Flugtreffen wurde gespeichert.', 'success');
        navigate(`/flugtreffen/${id}`);
      } else {
        const created = await api.createMeetup(form);
        void queryClient.invalidateQueries({ queryKey: ['meetups'] });
        toast('Flugtreffen wurde erstellt.', 'success');
        navigate(`/flugtreffen/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast(err instanceof Error ? err.message : 'Flugtreffen konnte nicht gespeichert werden.', 'error');
    }
  }

  async function submitForm(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');

    const errors = validate(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    requestConfirmation({
      title: isEditMode ? 'Änderungen speichern?' : 'Flugtreffen erstellen?',
      message: isEditMode
        ? 'Die Änderungen werden direkt für alle Teilnehmenden sichtbar.'
        : 'Das neue Flugtreffen wird öffentlich in der Übersicht angezeigt.',
      confirmLabel: isEditMode ? 'Speichern' : 'Erstellen',
      onConfirm: () => void saveMeetup(),
    });
  }

  if (!loading && !user) {
    return (
      <section className="form-page">
        <h1>{isEditMode ? 'Flugtreffen bearbeiten' : 'Neues Flugtreffen erstellen'}</h1>
        <div className="form-card">
          <p>Bitte melde dich an, um Flugtreffen zu erstellen oder zu bearbeiten.</p>
          <Link className="button" to="/login">Einloggen</Link>
        </div>
      </section>
    );
  }

  if (forbidden) {
    return (
      <section className="form-page">
        <h1>Flugtreffen bearbeiten</h1>
        <div className="form-card">
          <p>Nur der Ersteller kann dieses Flugtreffen bearbeiten.</p>
          <Link className="button secondary" to={id ? `/flugtreffen/${id}` : '/flugtreffen'}>Zurück</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="form-page">
      <h1>{isEditMode ? 'Flugtreffen bearbeiten' : 'Neues Flugtreffen erstellen'}</h1>

      <form className="form-card" onSubmit={(event) => void submitForm(event)}>
        <label>
          Titel
          <input name="title" value={form.title} onChange={updateForm} required />
          {fieldErrors.title && <small className="field-error">{fieldErrors.title}</small>}
        </label>

        <label>
          Flugspot
          <input name="spot" value={form.spot} onChange={updateForm} required />
          {fieldErrors.spot && <small className="field-error">{fieldErrors.spot}</small>}
        </label>

        <label>
          Region
          <input name="region" value={form.region} onChange={updateForm} required />
          {fieldErrors.region && <small className="field-error">{fieldErrors.region}</small>}
        </label>

        <div className="two-columns">
          <label>
            Datum
            <input type="date" name="date" value={form.date} onChange={updateForm} required />
            {fieldErrors.date && <small className="field-error">{fieldErrors.date}</small>}
          </label>

          <label>
            Uhrzeit
            <input type="time" name="time" value={form.time} onChange={updateForm} required />
            {fieldErrors.time && <small className="field-error">{fieldErrors.time}</small>}
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
            {fieldErrors.max_participants && <small className="field-error">{fieldErrors.max_participants}</small>}
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
          {fieldErrors.description && <small className="field-error">{fieldErrors.description}</small>}
        </label>

        <button>{isEditMode ? 'Änderungen speichern' : 'Flugtreffen speichern'}</button>
        {error && <p className="message error">{error}</p>}
      </form>
    </section>
  );
}
