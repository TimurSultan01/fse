import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { closestCenter, DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import Fuse from 'fuse.js';
import { api } from '../api';
import SortableCard from '../components/SortableCard';
import { useAuth } from '../hooks/useAuth';
import type { FilterOptions, Meetup, MeetupFilters } from '../types';

export default function Meetups() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<MeetupFilters>({
    search: '',
    region: '',
    level: '',
    date_from: '',
    sort: '',
  });
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
    const search = filters.search.trim();

    if (!search) return meetups;

    return new Fuse(meetups, {
      keys: ['title', 'spot', 'region', 'description', 'creator_display_name'],
      threshold: 0.35,
    }).search(search).map((result) => result.item);
  }, [filters.search, meetups]);

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
    setFilters({ search: '', region: '', level: '', date_from: '', sort: '' });
  }

  const loading = meetupsQuery.isLoading || filterOptionsQuery.isLoading;
  const error = meetupsQuery.error ?? filterOptionsQuery.error;

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Flugtreffen</h1>
          <p>Suche nach Titel, Spot, Region oder Beschreibung und filtere nach Region, Level oder Datum.</p>
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

        <input type="date" name="date_from" value={filters.date_from} onChange={updateFilter} />

        <select name="sort" value={filters.sort} onChange={updateFilter}>
          <option value="">Datum aufsteigend</option>
          <option value="created_desc">Neueste zuerst</option>
        </select>

        <button>Suchen</button>
        <button type="button" className="secondary-button" onClick={resetFilters}>Zurücksetzen</button>
      </form>

      {loading && <p>Lade Flugtreffen...</p>}
      {error && <p className="message error">{error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>}

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

            <dl className="facts">
              <div><dt>Flugspot</dt><dd>{meetup.spot}</dd></div>
              <div><dt>Region</dt><dd>{meetup.region}</dd></div>
              <div><dt>Datum</dt><dd>{meetup.date}</dd></div>
              <div><dt>Uhrzeit</dt><dd>{meetup.time}</dd></div>
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

            <Link className="button secondary card-action" to={`/flugtreffen/${meetup.id}`}>Details öffnen</Link>
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!loading && orderedMeetups.length === 0 && (
        <p className="message">Keine passenden Flugtreffen gefunden.</p>
      )}
    </section>
  );
}
