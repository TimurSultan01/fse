import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../api';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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
        backgroundColor: ['#0f8a91', '#c0271c'],
        borderWidth: 0,
      },
    ],
  };

  const regionCounts = meetups.reduce<Record<string, number>>((acc, meetup) => {
    acc[meetup.region] = (acc[meetup.region] ?? 0) + 1;
    return acc;
  }, {});

  const regionChartData = {
    labels: Object.keys(regionCounts),
    datasets: [
      {
        label: 'Flugtreffen',
        data: Object.values(regionCounts),
        backgroundColor: '#2f6fed',
        borderRadius: 8,
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

      {regionChartData.labels.length > 0 && (
        <section className="chart-panel chart-panel--wide">
          <div>
            <h2>Flugtreffen pro Region</h2>
            <p>Wo sich aktuell die meisten Flugtage organisieren.</p>
          </div>
          <div className="chart-box chart-box--bar">
            <Bar
              data={regionChartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </div>
        </section>
      )}
    </section>
  );
}
