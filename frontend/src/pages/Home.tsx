import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero">
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
    </section>
  );
}
