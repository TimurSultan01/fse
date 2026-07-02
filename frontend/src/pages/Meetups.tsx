import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { closestCenter, DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import Fuse from 'fuse.js';
import { api } from '../api';
import { formatDate, formatTime } from '../lib/datetime';
import SortableCard from '../components/SortableCard';
import FavoriteButton from '../components/FavoriteButton';
import MeetupMap from '../components/MeetupMap';
import { useAuth } from '../hooks/useAuth';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { MEETUP_TAGS, type FilterOptions, type Meetup, type MeetupFilters } from '../types';

export default function Meetups() {
  const { user } = useAuth();
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const [filters, setFilters] = useState<MeetupFilters>({
    search: '',
    region: '',
    level: '',
    date_from: '',
    sort: '',
    tag: '',
  });
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [cardOrder, setCardOrder] = useState<number[]>([]);

  const queryFilters = useMemo(() => ({
    region: filters.region,
    level: filters.level,
    date_from: filters.date_from,
    sort: filters.sort,
  }), [filters.date_from, filters.level, filters.region, filters.sort]);

  const meetupsQuery = useQuery({
    queryKey: ['meetups', queryFilters],
    queryFn: () => api.getMeetups(queryFilters),
  });

  const filterOptionsQuery = useQuery<FilterOptions>({
    queryKey: ['meetup-filters'],
    queryFn: () => api.getMeetupFilters(),
  });

  const meetups = useMemo(() => meetupsQuery.data ?? [], [meetupsQuery.data]);
  const filterOptions = filterOptionsQuery.data ?? { regions: [], levels: [] };

  const visibleMeetups = useMemo(() => {
    let result = meetups;

    const search = filters.search.trim();
    if (search) {
      result = new Fuse(result, {
        keys: ['title', 'spot', 'region', 'description', 'creator_display_name'],
        threshold: 0.35,
      }).search(search).map((entry) => entry.item);
    }

    if (filters.tag) {
      result = result.filter((meetup) => meetup.tags?.includes(filters.tag));
    }

    if (onlyFavorites) {
      result = result.filter((meetup) => favoriteIds.includes(meetup.id));
    }

    return result;
  }, [meetups, filters.search, filters.tag, onlyFavorites, favoriteIds]);

  const orderedMeetups = useMemo(() => {
    const visibleIds = visibleMeetups.map((meetup) => meetup.id);
    const orderedIds = [
      ...cardOrder.filter((id) => visibleIds.includes(id)),
      ...visibleIds.filter((id) => !cardOrder.includes(id)),
    ];

    return orderedIds
      .map((id) => visibleMeetups.find((meetup) => meetup.id === id))
      .filter((meetup): meetup is Meetup => Boolean(meetup));
  }, [cardOrder, visibleMeetups]);

  function reorderCards(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = orderedMeetups.map((meetup) => meetup.id);
    const oldIndex = ids.indexOf(Number(active.id));
    const newIndex = ids.indexOf(Number(over.id));

    if (oldIndex < 0 || newIndex < 0) return;

    setCardOrder(arrayMove(ids, oldIndex, newIndex));
  }

  function updateFilter(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
  }

  function resetFilters(): void {
    setFilters({ search: '', region: '', level: '', date_from: '', sort: '', tag: '' });
    setOnlyFavorites(false);
  }

  const loading = meetupsQuery.isLoading || filterOptionsQuery.isLoading;
  const error = meetupsQuery.error ?? filterOptionsQuery.error;

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Flugtreffen</h1>
          <p>Suche nach Titel, Spot, Region oder Beschreibung und filtere nach Region, Level, Kategorie oder Datum.</p>
        </div>
        <Link className="button" to={user ? '/flugtreffen/neu' : '/login'}>Neues Flugtreffen</Link>
      </div>

      <form className="filter-bar" onSubmit={submitSearch}>
        <input
          name="search"
          value={filters.search}
          onChange={updateFilter}
          placeholder="Suche nach Titel, Spot, Region, Beschreibung oder Ersteller"
        />

        <select name="region" value={filters.region} onChange={updateFilter}>
          <option value="">Alle Regionen</option>
          {filterOptions.regions.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <select name="level" value={filters.level} onChange={updateFilter}>
          <option value="">Alle Level</option>
          {filterOptions.levels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>

        <select name="tag" value={filters.tag} onChange={updateFilter}>
          <option value="">Alle Kategorien</option>
          {MEETUP_TAGS.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <input type="date" name="date_from" value={filters.date_from} onChange={updateFilter} />

        <select name="sort" value={filters.sort} onChange={updateFilter}>
          <option value="">Datum aufsteigend</option>
          <option value="created_desc">Neueste zuerst</option>
        </select>

        <button>Suchen</button>
        <button type="button" className="secondary-button" onClick={resetFilters}>Zurücksetzen</button>
      </form>

      <div className="view-bar">
        <label className="checkbox-label">
          <input type="checkbox" checked={onlyFavorites} onChange={(event) => setOnlyFavorites(event.target.checked)} />
          Nur Favoriten
        </label>

        <div className="view-toggle">
          <button
            type="button"
            className={view === 'list' ? '' : 'secondary-button'}
            onClick={() => setView('list')}
          >
            Liste
          </button>
          <button
            type="button"
            className={view === 'map' ? '' : 'secondary-button'}
            onClick={() => setView('map')}
          >
            Karte
          </button>
        </div>
      </div>

      {loading && <p className="loading-note">Lade Flugtreffen...</p>}
      {error && <p className="message error">{error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>}

      {view === 'map' ? (
        <MeetupMap meetups={visibleMeetups} height={520} />
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={reorderCards}>
          <SortableContext items={orderedMeetups.map((meetup) => meetup.id)} strategy={rectSortingStrategy}>
            <div className="grid">
              {orderedMeetups.map((meetup: Meetup) => (
                <SortableCard key={meetup.id} id={meetup.id}>
                  <div className="card-header">
                    <h2>{meetup.title}</h2>
                    <span className={`badge ${meetup.status === 'voll' ? 'full' : ''}`}>
                      {meetup.status}
                    </span>
                  </div>

                  <p className="meta-line">Erstellt von {meetup.creator_display_name ?? 'Unbekannt'}</p>

                  {meetup.tags && meetup.tags.length > 0 && (
                    <ul className="tag-list">
                      {meetup.tags.map((tag) => (
                        <li key={tag} className="tag-chip">{tag}</li>
                      ))}
                    </ul>
                  )}

                  <dl className="facts">
                    <div><dt>Flugspot</dt><dd>{meetup.spot}</dd></div>
                    <div><dt>Region</dt><dd>{meetup.region}</dd></div>
                    <div><dt>Datum</dt><dd>{formatDate(meetup.date)}</dd></div>
                    <div><dt>Uhrzeit</dt><dd>{formatTime(meetup.time)}{meetup.end_time ? `–${formatTime(meetup.end_time)}` : ''}</dd></div>
                    <div><dt>Level</dt><dd>{meetup.experience_level}</dd></div>
                    <div>
                      <dt>Teilnehmende</dt>
                      <dd>{meetup.participant_count} / {meetup.max_participants}</dd>
                    </div>
                  </dl>

                  <details className="card-details">
                    <summary>Teilnehmer anzeigen</summary>
                    {(meetup.participants?.length ?? 0) > 0 ? (
                      <ul className="compact-list">
                        {meetup.participants?.map((participant) => (
                          <li key={participant.id}>{participant.pilot_name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Noch keine Teilnehmenden.</p>
                    )}
                  </details>

                  <div className="card-footer">
                    <FavoriteButton meetupId={meetup.id} />
                    <Link className="button secondary card-action" to={`/flugtreffen/${meetup.id}`}>Details öffnen</Link>
                  </div>
                </SortableCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!loading && visibleMeetups.length === 0 && (
        <p className="message">Keine passenden Flugtreffen gefunden.</p>
      )}
    </section>
  );
}
