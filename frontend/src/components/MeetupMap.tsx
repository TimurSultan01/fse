import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from '../lib/leaflet';
import type { Meetup } from '../types';

type MeetupMapProps = {
  meetups: Meetup[];
  height?: number;
  withLinks?: boolean;
};

const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];

type Located = Meetup & { latitude: number; longitude: number };

function hasCoords(meetup: Meetup): meetup is Located {
  return typeof meetup.latitude === 'number' && typeof meetup.longitude === 'number';
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points).pad(0.2));
    }
  }, [map, points]);
  return null;
}

export default function MeetupMap({ meetups, height = 380, withLinks = true }: MeetupMapProps) {
  const located = meetups.filter(hasCoords);
  const points = located.map((meetup): [number, number] => [meetup.latitude, meetup.longitude]);

  if (located.length === 0) {
    return <p className="message">Für diese Flugtreffen sind noch keine Koordinaten hinterlegt.</p>;
  }

  return (
    <div className="map-canvas" style={{ height }}>
      <MapContainer center={points[0] ?? GERMANY_CENTER} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {located.map((meetup) => (
          <Marker key={meetup.id} position={[meetup.latitude, meetup.longitude]}>
            <Popup>
              <strong>{meetup.title}</strong>
              <br />
              {meetup.spot}, {meetup.region}
              {withLinks && (
                <>
                  <br />
                  <Link to={`/flugtreffen/${meetup.id}`}>Details öffnen</Link>
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
