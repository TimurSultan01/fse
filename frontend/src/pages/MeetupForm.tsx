import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';
import type { MeetupFormData } from '../types';

const today = () => new Date().toISOString().slice(0, 10);

const meetupSchema = z.object({
  title: z.string().trim().min(3, 'Der Titel muss mindestens 3 Zeichen haben.').max(120),
  spot: z.string().trim().min(2, 'Bitte gib einen Flugspot ein.').max(120),
  region: z.string().trim().min(2, 'Bitte gib eine Region ein.').max(80),
  date: z.string().min(1, 'Bitte gib ein Datum ein.')
    .refine((value) => value >= today(), 'Das Datum darf nicht in der Vergangenheit liegen.'),
  time: z.string().min(1, 'Bitte gib eine Uhrzeit ein.'),
  experience_level: z.string().min(1),
  max_participants: z.number({ message: 'Bitte gib eine Zahl ein.' }).int().min(1, 'Mindestens eine Person muss teilnehmen können.'),
  description: z.string().trim().min(10, 'Die Beschreibung muss mindestens 10 Zeichen haben.'),
});

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MeetupFormData>({
    resolver: zodResolver(meetupSchema),
    defaultValues: initialForm,
  });

  const meetupQuery = useQuery({
    queryKey: ['meetup', id],
    queryFn: () => api.getMeetup(id!),
    enabled: isEditMode,
  });

  const meetup = meetupQuery.data;
  const forbidden = meetup?.can_manage === false;

  useEffect(() => {
    if (meetup && meetup.can_manage !== false) {
      reset({
        title: meetup.title,
        spot: meetup.spot,
        region: meetup.region,
        date: meetup.date,
        time: meetup.time.slice(0, 5),
        experience_level: meetup.experience_level,
        max_participants: meetup.max_participants,
        description: meetup.description,
      });
    }
  }, [meetup, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: MeetupFormData) => (id ? api.updateMeetup(id, data) : api.createMeetup(data)),
    onSuccess(saved) {
      void queryClient.invalidateQueries({ queryKey: ['meetups'] });
      void queryClient.invalidateQueries({ queryKey: ['meetup', String(saved.id)] });
      toast(isEditMode ? 'Flugtreffen wurde gespeichert.' : 'Flugtreffen wurde erstellt.', 'success');
      navigate(`/flugtreffen/${saved.id}`);
    },
    onError(err) {
      toast(err instanceof Error ? err.message : 'Flugtreffen konnte nicht gespeichert werden.', 'error');
    },
  });

  function requestSave(data: MeetupFormData): void {
    requestConfirmation({
      title: isEditMode ? 'Änderungen speichern?' : 'Flugtreffen erstellen?',
      message: isEditMode
        ? 'Die Änderungen werden direkt für alle Teilnehmenden sichtbar.'
        : 'Das neue Flugtreffen wird öffentlich in der Übersicht angezeigt.',
      confirmLabel: isEditMode ? 'Speichern' : 'Erstellen',
      onConfirm: () => saveMutation.mutate(data),
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

      <form className="form-card" onSubmit={(event) => void handleSubmit(requestSave)(event)}>
        <label>
          Titel
          <input {...register('title')} />
          {errors.title && <small className="field-error">{errors.title.message}</small>}
        </label>

        <label>
          Flugspot
          <input {...register('spot')} />
          {errors.spot && <small className="field-error">{errors.spot.message}</small>}
        </label>

        <label>
          Region
          <input {...register('region')} />
          {errors.region && <small className="field-error">{errors.region.message}</small>}
        </label>

        <div className="two-columns">
          <label>
            Datum
            <input type="date" {...register('date')} />
            {errors.date && <small className="field-error">{errors.date.message}</small>}
          </label>

          <label>
            Uhrzeit
            <input type="time" {...register('time')} />
            {errors.time && <small className="field-error">{errors.time.message}</small>}
          </label>
        </div>

        <div className="two-columns">
          <label>
            Erfahrungslevel
            <select {...register('experience_level')}>
              <option>Einsteiger</option>
              <option>Fortgeschritten</option>
              <option>Alle Level</option>
            </select>
          </label>

          <label>
            Maximale Teilnehmerzahl
            <input type="number" min="1" {...register('max_participants', { valueAsNumber: true })} />
            {errors.max_participants && <small className="field-error">{errors.max_participants.message}</small>}
          </label>
        </div>

        <label>
          Beschreibung
          <textarea rows={5} {...register('description')} />
          {errors.description && <small className="field-error">{errors.description.message}</small>}
        </label>

        <button disabled={isSubmitting || saveMutation.isPending}>
          {isEditMode ? 'Änderungen speichern' : 'Flugtreffen speichern'}
        </button>
      </form>
    </section>
  );
}
