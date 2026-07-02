import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api';
import { geocode } from '../lib/geocode';
import { toast } from '../lib/toast';
import { useAuth } from '../hooks/useAuth';
import { useConfirmStore } from '../stores/useConfirmStore';
import MapPicker from '../components/MapPicker';
import WeatherPanel from '../components/WeatherPanel';
import { MEETUP_TAGS, WIND_DIRECTIONS, type MeetupFormData } from '../types';

const today = () => new Date().toISOString().slice(0, 10);

const meetupSchema = z.object({
  title: z.string().trim().min(3, 'Der Titel muss mindestens 3 Zeichen haben.').max(120),
  spot: z.string().trim().min(2, 'Bitte gib einen Flugspot ein.').max(120),
  region: z.string().trim().min(2, 'Bitte gib eine Region ein.').max(80),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  date: z.string().min(1, 'Bitte gib ein Datum ein.')
    .refine((value) => value >= today(), 'Das Datum darf nicht in der Vergangenheit liegen.'),
  time: z.string().min(1, 'Bitte gib eine Uhrzeit ein.'),
  end_time: z.string(),
  experience_level: z.string().min(1),
  takeoff_direction: z.string(),
  max_participants: z.number({ message: 'Bitte gib eine Zahl ein.' }).int().min(1, 'Mindestens eine Person muss teilnehmen können.'),
  description: z.string().trim().min(10, 'Die Beschreibung muss mindestens 10 Zeichen haben.'),
  tags: z.array(z.string()),
});

const initialForm: MeetupFormData = {
  title: '',
  spot: '',
  region: '',
  latitude: null,
  longitude: null,
  date: '',
  time: '',
  end_time: '',
  experience_level: 'Einsteiger',
  takeoff_direction: '',
  max_participants: 6,
  description: '',
  tags: [],
};

export default function MeetupForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);
  const queryClient = useQueryClient();
  const [geoQuery, setGeoQuery] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<MeetupFormData>({
    resolver: zodResolver(meetupSchema),
    defaultValues: initialForm,
  });

  const latitude = useWatch({ control, name: 'latitude' });
  const longitude = useWatch({ control, name: 'longitude' });
  const tags = useWatch({ control, name: 'tags' });
  const date = useWatch({ control, name: 'date' });
  const time = useWatch({ control, name: 'time' });

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
        latitude: meetup.latitude ?? null,
        longitude: meetup.longitude ?? null,
        date: meetup.date,
        time: meetup.time.slice(0, 5),
        end_time: meetup.end_time ? meetup.end_time.slice(0, 5) : '',
        experience_level: meetup.experience_level,
        takeoff_direction: meetup.takeoff_direction ?? '',
        max_participants: meetup.max_participants,
        description: meetup.description,
        tags: meetup.tags ?? [],
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

  async function searchLocation(): Promise<void> {
    const query = geoQuery.trim() || getValues('spot');
    if (!query) {
      toast('Bitte gib einen Ort oder Flugspot ein.', 'error');
      return;
    }

    setGeoLoading(true);
    try {
      const result = await geocode(query);
      if (!result) {
        toast('Kein Ort gefunden. Setze den Marker per Klick auf die Karte.', 'info');
        return;
      }
      setValue('latitude', Number(result.latitude.toFixed(6)));
      setValue('longitude', Number(result.longitude.toFixed(6)));
      toast('Ort gefunden und auf der Karte markiert.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ort konnte nicht gesucht werden.', 'error');
    } finally {
      setGeoLoading(false);
    }
  }

  function pickOnMap(lat: number, lng: number): void {
    setValue('latitude', Number(lat.toFixed(6)));
    setValue('longitude', Number(lng.toFixed(6)));
  }

  function toggleTag(tag: string): void {
    const next = tags.includes(tag) ? tags.filter((entry) => entry !== tag) : [...tags, tag];
    setValue('tags', next, { shouldDirty: true });
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

        <div className="map-field">
          <div className="map-field-head">
            <span>Standort auf der Karte</span>
            {latitude !== null && longitude !== null && (
              <small>{latitude.toFixed(4)}, {longitude.toFixed(4)}</small>
            )}
          </div>
          <div className="geocode-row">
            <input
              value={geoQuery}
              onChange={(event) => setGeoQuery(event.target.value)}
              placeholder="Ort suchen (z. B. Wasserkuppe)"
            />
            <button type="button" className="secondary-button" onClick={() => void searchLocation()} disabled={geoLoading}>
              {geoLoading ? 'Suche...' : 'Ort suchen'}
            </button>
          </div>
          <MapPicker latitude={latitude} longitude={longitude} onPick={pickOnMap} />
          <small className="map-hint">Klicke auf die Karte, um den Startplatz zu setzen.</small>
        </div>

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

          <label>
            Endzeit (optional)
            <input type="time" {...register('end_time')} />
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
            Startrichtung (optional)
            <select {...register('takeoff_direction')}>
              <option value="">Beliebig</option>
              {WIND_DIRECTIONS.map((direction) => (
                <option key={direction} value={direction}>{direction}</option>
              ))}
            </select>
          </label>

          <label>
            Maximale Teilnehmerzahl
            <input type="number" min="1" {...register('max_participants', { valueAsNumber: true })} />
            {errors.max_participants && <small className="field-error">{errors.max_participants.message}</small>}
          </label>
        </div>

        <fieldset className="tag-field">
          <legend>Kategorien</legend>
          <div className="tag-options">
            {MEETUP_TAGS.map((tag) => (
              <label key={tag} className={`tag-option ${tags.includes(tag) ? 'is-active' : ''}`}>
                <input
                  type="checkbox"
                  checked={tags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Beschreibung
          <textarea rows={5} {...register('description')} />
          {errors.description && <small className="field-error">{errors.description.message}</small>}
        </label>

        <WeatherPanel latitude={latitude} longitude={longitude} date={date} time={time} />

        <button disabled={isSubmitting || saveMutation.isPending}>
          {isEditMode ? 'Änderungen speichern' : 'Flugtreffen speichern'}
        </button>
      </form>
    </section>
  );
}
