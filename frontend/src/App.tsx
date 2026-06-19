import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ConfirmDialog from './components/ConfirmDialog';

const Home = lazy(() => import('./pages/Home'));
const Meetups = lazy(() => import('./pages/Meetups'));
const MeetupDetail = lazy(() => import('./pages/MeetupDetail'));
const MeetupForm = lazy(() => import('./pages/MeetupForm'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupDetail = lazy(() => import('./pages/GroupDetail'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

export default function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="site-header">
        <div>
          <strong className="brand">FlightMeet</strong>
          <span className="tagline">Community für Gleitschirmflieger</span>
        </div>

        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/flugtreffen">Flugtreffen</NavLink>
          <NavLink to="/gruppen">Gruppen</NavLink>
          <NavLink to="/chat">Chat</NavLink>
          <NavLink to="/profil">Profil</NavLink>
          {!user && <NavLink to="/login">Login</NavLink>}
        </nav>

        {user && (
          <div className="account-menu">
            <span>{user.display_name}</span>
            <button className="secondary-button" onClick={() => void logout()}>Logout</button>
          </div>
        )}
      </header>

      <main className="container">
        <Suspense fallback={<p>Lade Ansicht...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/flugtreffen" element={<Meetups />} />
            <Route path="/flugtreffen/neu" element={<MeetupForm />} />
            <Route path="/flugtreffen/:id/bearbeiten" element={<MeetupForm />} />
            <Route path="/flugtreffen/:id" element={<MeetupDetail />} />
            <Route path="/gruppen" element={<Groups />} />
            <Route path="/gruppen/:id" element={<GroupDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/registrieren" element={<AuthPage />} />
          </Routes>
        </Suspense>
      </main>
      <ConfirmDialog />
    </>
  );
}
