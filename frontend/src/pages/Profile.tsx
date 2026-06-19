import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';
import type { PasswordChangeData, ProfileUpdateData } from '../types';

const emptyPasswordForm: PasswordChangeData = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

export default function Profile() {
  const { user, loading, logout, updateProfile, changePassword } = useAuth();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);
  const [profileForm, setProfileForm] = useState<ProfileUpdateData>({ display_name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState<PasswordChangeData>(emptyPasswordForm);
  const [profileMessage, setProfileMessage] = useState<string>('');
  const [passwordMessage, setPasswordMessage] = useState<string>('');
  const [profileError, setProfileError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    const timeoutId = window.setTimeout(() => {
      setProfileForm({
        display_name: user.display_name,
        email: user.email,
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [user]);

  async function saveProfile(): Promise<void> {
    setProfileMessage('');
    setProfileError('');
    setSavingProfile(true);

    try {
      await updateProfile(profileForm);
      setProfileMessage('Profil wurde gespeichert.');
      toast('Profil wurde gespeichert.', 'success');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast(err instanceof Error ? err.message : 'Profil konnte nicht gespeichert werden.', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  function requestSaveProfile(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    requestConfirmation({
      title: 'Profil speichern?',
      message: 'Dein Name wird auch in Teilnahmen, Gruppenmitgliedschaften und Chatnachrichten aktualisiert.',
      confirmLabel: 'Speichern',
      onConfirm: () => void saveProfile(),
    });
  }

  async function savePassword(): Promise<void> {
    setPasswordMessage('');
    setPasswordError('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Die Passwortbestätigung stimmt nicht überein.');
      return;
    }

    setSavingPassword(true);

    try {
      await changePassword(passwordForm);
      setPasswordForm(emptyPasswordForm);
      setPasswordMessage('Passwort wurde geändert.');
      toast('Passwort wurde geändert.', 'success');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast(err instanceof Error ? err.message : 'Passwort konnte nicht geändert werden.', 'error');
    } finally {
      setSavingPassword(false);
    }
  }

  function requestSavePassword(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Die Passwortbestätigung stimmt nicht überein.');
      return;
    }

    requestConfirmation({
      title: 'Passwort ändern?',
      message: 'Nach der Änderung verwendest du beim nächsten Login dein neues Passwort.',
      confirmLabel: 'Passwort ändern',
      onConfirm: () => void savePassword(),
    });
  }

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
      <div className="page-title">
        <div>
          <h1>Profil</h1>
          <p>Verwalte deine Accountdaten und dein Passwort.</p>
        </div>
        <button className="secondary-button" onClick={() => void logout()}>Logout</button>
      </div>

      <form className="form-card" onSubmit={requestSaveProfile}>
        <h2>Accountdaten</h2>

        <label>
          Pilotinnen- oder Pilotenname
          <input
            value={profileForm.display_name}
            onChange={(event) => setProfileForm((current) => ({ ...current, display_name: event.target.value }))}
            minLength={2}
            maxLength={80}
            required
          />
        </label>

        <label>
          E-Mail
          <input
            type="email"
            value={profileForm.email}
            onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
            maxLength={190}
            required
          />
        </label>

        <button disabled={savingProfile}>{savingProfile ? 'Speichern...' : 'Profil speichern'}</button>

        {profileMessage && <p className="message success">{profileMessage}</p>}
        {profileError && <p className="message error">{profileError}</p>}
      </form>

      <form className="form-card" onSubmit={requestSavePassword}>
        <h2>Passwort ändern</h2>

        <label>
          Aktuelles Passwort
          <input
            type="password"
            value={passwordForm.current_password}
            onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
            autoComplete="current-password"
            required
          />
        </label>

        <label>
          Neues Passwort
          <input
            type="password"
            value={passwordForm.new_password}
            onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label>
          Neues Passwort bestätigen
          <input
            type="password"
            value={passwordForm.confirm_password}
            onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <button disabled={savingPassword}>{savingPassword ? 'Ändern...' : 'Passwort ändern'}</button>

        {passwordMessage && <p className="message success">{passwordMessage}</p>}
        {passwordError && <p className="message error">{passwordError}</p>}
      </form>
    </section>
  );
}
