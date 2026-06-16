import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Meetups from './pages/Meetups';
import MeetupDetail from './pages/MeetupDetail';
import NewMeetup from './pages/NewMeetup';
import Groups from './pages/Groups';
import Chat from './pages/Chat';

export default function App() {
  return (
    <>
      <header className="site-header">
        <div>
          <strong className="brand">FlightMeet</strong>
          <span className="tagline">Community für Gleitschirmfliegerinnen und Gleitschirmflieger</span>
        </div>

        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/flugtreffen">Flugtreffen</NavLink>
          <NavLink to="/gruppen">Gruppen</NavLink>
          <NavLink to="/chat">Chat</NavLink>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flugtreffen" element={<Meetups />} />
          <Route path="/flugtreffen/neu" element={<NewMeetup />} />
          <Route path="/flugtreffen/:id" element={<MeetupDetail />} />
          <Route path="/gruppen" element={<Groups />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
    </>
  );
}
