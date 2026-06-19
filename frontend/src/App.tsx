import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Meetups from './pages/Meetups';
import MeetupDetail from './pages/MeetupDetail';
import MeetupForm from './pages/MeetupForm';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

export default function App() {
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
        </nav>
      </header>

      <main className="container">
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
        </Routes>
      </main>
    </>
  );
}
