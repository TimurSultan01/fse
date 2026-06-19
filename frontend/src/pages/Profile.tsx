import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <p>Lade Profil...</p>;
  }

  if (!user) {
    return (
      <section className="form-page">
        <h1>Profil</h1>
        <div className="form-card">
          <p>Bitte melde dich an, um dein Profil, Teilnahmen, Gruppen und Chat-Nachrichten zu verwenden.</p>
          <div className="actions">
            <Link className="button" to="/login">Einloggen</Link>
            <Link className="button secondary" to="/registrieren">Registrieren</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="form-page">
      <h1>Profil</h1>

      <div className="form-card profile-card">
        <div>
          <span className="profile-label">Name</span>
          <strong>{user.display_name}</strong>
        </div>

        <div>
          <span className="profile-label">E-Mail</span>
          <strong>{user.email}</strong>
        </div>

        <button className="secondary-button" onClick={() => void logout()}>Logout</button>
      </div>
    </section>
  );
}
