import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';

const authSchema = z.object({
  display_name: z.string().trim().max(80).optional(),
  email: z.string().trim().min(1, 'Bitte gib eine E-Mail-Adresse ein.').email('Bitte gib eine gültige E-Mail-Adresse ein.'),
  password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();
  const isRegister = location.pathname === '/registrieren';
  const title = isRegister ? 'Registrieren' : 'Einloggen';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { display_name: '', email: '', password: '' },
  });

  useEffect(() => {
    reset({ display_name: '', email: '', password: '' });
  }, [isRegister, reset]);

  async function onSubmit(values: AuthFormValues): Promise<void> {
    if (isRegister && (values.display_name ?? '').trim().length < 2) {
      setError('display_name', { message: 'Der Name muss mindestens 2 Zeichen lang sein.' });
      return;
    }

    try {
      if (isRegister) {
        await registerUser({ display_name: values.display_name!.trim(), email: values.email, password: values.password });
      } else {
        await login({ email: values.email, password: values.password });
      }

      navigate('/profil');
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Unbekannter Fehler' });
    }
  }

  return (
    <section className="form-page auth-page">
      <h1>{title}</h1>

      <form className="form-card" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        {isRegister && (
          <label>
            Pilotinnen- oder Pilotenname
            <input {...register('display_name')} autoComplete="nickname" />
            {errors.display_name && <small className="field-error">{errors.display_name.message}</small>}
          </label>
        )}

        <label>
          E-Mail
          <input type="email" autoComplete="email" {...register('email')} />
          {errors.email && <small className="field-error">{errors.email.message}</small>}
        </label>

        <label>
          Passwort
          <input
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            {...register('password')}
          />
          {errors.password && <small className="field-error">{errors.password.message}</small>}
        </label>

        <button disabled={isSubmitting}>{isSubmitting ? 'Bitte warten...' : title}</button>

        {errors.root && <p className="message error">{errors.root.message}</p>}
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
