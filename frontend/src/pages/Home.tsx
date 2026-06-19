import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { api } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const meetupsQuery = useQuery({
    queryKey: ['meetups', 'home'],
    queryFn: () => api.getMeetups(),
  });
  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.getGroups(),
  });

  const meetups = meetupsQuery.data ?? [];
  const groups = groupsQuery.data ?? [];
  const openMeetups = meetups.filter((meetup) => meetup.status !== 'voll').length;
  const fullMeetups = meetups.filter((meetup) => meetup.status === 'voll').length;
  const participantCount = meetups.reduce((sum, meetup) => sum + meetup.participant_count, 0);
  const groupMemberCount = groups.reduce((sum, group) => sum + (group.member_count ?? 0), 0);

  const chartData = {
    labels: ['Offene Treffen', 'Volle Treffen'],
    datasets: [
      {
        data: [openMeetups, fullMeetups],
        backgroundColor: ['#176c72', '#b42318'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <section className="home-page">
      <motion.div
        className="hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="eyebrow">Willkommen bei</p>
        <h1>FlightMeet</h1>
        <p>
          FlightMeet hilft Pilotinnen und Piloten dabei, Flugtreffen zu finden,
          eigene gemeinsame Flugtage zu organisieren, Gruppen beizutreten und
          einfache Nachrichten auszutauschen.
        </p>

        <div className="actions">
          <Link className="button" to="/flugtreffen">Zu den Flugtreffen</Link>
          <Link className="button secondary" to="/gruppen">Zu den Gruppen</Link>
        </div>
      </motion.div>

      <section className="dashboard">
        <article>
          <span className="profile-label">Flugtreffen</span>
          <strong>{meetups.length}</strong>
        </article>
        <article>
          <span className="profile-label">Gruppen</span>
          <strong>{groups.length}</strong>
        </article>
        <article>
          <span className="profile-label">Teilnahmen</span>
          <strong>{participantCount}</strong>
        </article>
        <article>
          <span className="profile-label">Gruppenmitglieder</span>
          <strong>{groupMemberCount}</strong>
        </article>
      </section>

      <section className="chart-panel">
        <div>
          <h2>Status der Flugtreffen</h2>
          <p>Ein schneller Blick darauf, wie viele Treffen noch freie Plätze haben.</p>
        </div>
        <div className="chart-box">
          <Doughnut data={chartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </section>
    </section>
  );
}
