import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const isRegister = location.pathname === '/registrieren';

  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const title = useMemo(() => isRegister ? 'Registrieren' : 'Einloggen', [isRegister]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ display_name: displayName, email, password });
      } else {
        await login({ email, password });
      }

      navigate('/profil');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="form-page auth-page">
      <h1>{title}</h1>

      <form className="form-card" onSubmit={(event) => void submit(event)}>
        {isRegister && (
          <label>
            Pilotinnen- oder Pilotenname
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              minLength={2}
              maxLength={80}
              required
            />
          </label>
        )}

        <label>
          E-Mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Passwort
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={8}
            required
          />
        </label>

        <button disabled={submitting}>{submitting ? 'Bitte warten...' : title}</button>

        {error && <p className="message error">{error}</p>}
      </form>

      <p className="auth-switch">
        {isRegister ? 'Du hast schon einen Account?' : 'Noch keinen Account?'}{' '}
        <Link to={isRegister ? '/login' : '/registrieren'}>
          {isRegister ? 'Einloggen' : 'Registrieren'}
        </Link>
      </p>
    </section>
  );
}
