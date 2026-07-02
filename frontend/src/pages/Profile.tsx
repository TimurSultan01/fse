import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';
import type { PasswordChangeData, ProfileUpdateData } from '../types';

const profileSchema = z.object({
  display_name: z.string().trim().min(2, 'Der Name muss mindestens 2 Zeichen lang sein.').max(80),
  email: z.string().trim().email('Bitte gib eine gültige E-Mail-Adresse ein.').max(190),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Bitte gib dein aktuelles Passwort ein.'),
  new_password: z.string().min(8, 'Das neue Passwort muss mindestens 8 Zeichen lang sein.'),
  confirm_password: z.string().min(1, 'Bitte bestätige das neue Passwort.'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Die Passwortbestätigung stimmt nicht überein.',
  path: ['confirm_password'],
});

const emptyPassword: PasswordChangeData = { current_password: '', new_password: '', confirm_password: '' };

export default function Profile() {
  const { user, loading, logout, updateProfile, changePassword } = useAuth();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);

  const profileForm = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { display_name: '', email: '' },
  });

  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: emptyPassword,
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ display_name: user.display_name, email: user.email });
    }
  }, [user, profileForm]);

  function requestSaveProfile(data: ProfileUpdateData): void {
    requestConfirmation({
      title: 'Profil speichern?',
      message: 'Dein Name wird auch in Teilnahmen, Gruppenmitgliedschaften und Chatnachrichten aktualisiert.',
      confirmLabel: 'Speichern',
      async onConfirm() {
        try {
          await updateProfile(data);
          toast('Profil wurde gespeichert.', 'success');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Profil konnte nicht gespeichert werden.';
          profileForm.setError('root', { message });
          toast(message, 'error');
        }
      },
    });
  }

  function requestSavePassword(data: PasswordChangeData): void {
    requestConfirmation({
      title: 'Passwort ändern?',
      message: 'Nach der Änderung verwendest du beim nächsten Login dein neues Passwort.',
      confirmLabel: 'Passwort ändern',
      async onConfirm() {
        try {
          await changePassword(data);
          passwordForm.reset(emptyPassword);
          toast('Passwort wurde geändert.', 'success');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Passwort konnte nicht geändert werden.';
          passwordForm.setError('root', { message });
          toast(message, 'error');
        }
      },
    });
  }

  if (loading) {
    return <p className="loading-note">Lade Profil...</p>;
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

      <form className="form-card" onSubmit={(event) => void profileForm.handleSubmit(requestSaveProfile)(event)}>
        <h2>Accountdaten</h2>

        <label>
          Pilotinnen- oder Pilotenname
          <input {...profileForm.register('display_name')} />
          {profileForm.formState.errors.display_name && (
            <small className="field-error">{profileForm.formState.errors.display_name.message}</small>
          )}
        </label>

        <label>
          E-Mail
          <input type="email" {...profileForm.register('email')} />
          {profileForm.formState.errors.email && (
            <small className="field-error">{profileForm.formState.errors.email.message}</small>
          )}
        </label>

        <button disabled={profileForm.formState.isSubmitting}>Profil speichern</button>
        {profileForm.formState.errors.root && (
          <p className="message error">{profileForm.formState.errors.root.message}</p>
        )}
      </form>

      <form className="form-card" onSubmit={(event) => void passwordForm.handleSubmit(requestSavePassword)(event)}>
        <h2>Passwort ändern</h2>

        <label>
          Aktuelles Passwort
          <input type="password" autoComplete="current-password" {...passwordForm.register('current_password')} />
          {passwordForm.formState.errors.current_password && (
            <small className="field-error">{passwordForm.formState.errors.current_password.message}</small>
          )}
        </label>

        <label>
          Neues Passwort
          <input type="password" autoComplete="new-password" {...passwordForm.register('new_password')} />
          {passwordForm.formState.errors.new_password && (
            <small className="field-error">{passwordForm.formState.errors.new_password.message}</small>
          )}
        </label>

        <label>
          Neues Passwort bestätigen
          <input type="password" autoComplete="new-password" {...passwordForm.register('confirm_password')} />
          {passwordForm.formState.errors.confirm_password && (
            <small className="field-error">{passwordForm.formState.errors.confirm_password.message}</small>
          )}
        </label>

        <button disabled={passwordForm.formState.isSubmitting}>Passwort ändern</button>
        {passwordForm.formState.errors.root && (
          <p className="message error">{passwordForm.formState.errors.root.message}</p>
        )}
      </form>
    </section>
  );
}
