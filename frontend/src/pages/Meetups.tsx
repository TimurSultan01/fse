import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import type { FilterOptions, Meetup, MeetupFilters } from '../types';

export default function Meetups() {
  const { user } = useAuth();
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ regions: [], levels: [] });
  const [filters, setFilters] = useState<MeetupFilters>({
    search: '',
    region: '',
    level: '',
    date_from: '',
    sort: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  async function loadMeetups(): Promise<void> {
    setLoading(true);
    setError('');

    try {
      const [meetupData, optionData] = await Promise.all([
        api.getMeetups(filters),
        api.getMeetupFilters(),
      ]);
      setMeetups(meetupData);
      setFilterOptions(optionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMeetups();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.region, filters.level, filters.date_from, filters.sort]);

  function updateFilter(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void loadMeetups();
  }

  function resetFilters(): void {
    setFilters({ search: '', region: '', level: '', date_from: '', sort: '' });
  }

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
          placeholder="Suche nach Titel, Spot, Region oder Beschreibung"
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
      {error && <p className="message error">{error}</p>}

      <div className="grid">
        {meetups.map((meetup) => (
          <Link className="card" to={`/flugtreffen/${meetup.id}`} key={meetup.id}>
            <div className="card-header">
              <h2>{meetup.title}</h2>
              <span className={`badge ${meetup.status === 'voll' ? 'full' : ''}`}>
                {meetup.status}
              </span>
            </div>

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
          </Link>
        ))}
      </div>

      {!loading && meetups.length === 0 && (
        <p className="message">Keine passenden Flugtreffen gefunden.</p>
      )}
    </section>
  );
}
