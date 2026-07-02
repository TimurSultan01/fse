import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import '../lib/leaflet';

type MapPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onPick: (latitude: number, longitude: number) => void;
};

const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];

function ClickCatcher({ onPick }: { onPick: MapPickerProps['onPick'] }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function Recenter({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], Math.max(map.getZoom(), 11));
  }, [latitude, longitude, map]);
  return null;
}

export default function MapPicker({ latitude, longitude, onPick }: MapPickerProps) {
  const hasPosition = latitude !== null && longitude !== null;

  return (
    <div className="map-canvas">
      <MapContainer
        center={hasPosition ? [latitude!, longitude!] : GERMANY_CENTER}
        zoom={hasPosition ? 11 : 5}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCatcher onPick={onPick} />
        {hasPosition && (
          <>
            <Marker position={[latitude!, longitude!]} />
            <Recenter latitude={latitude!} longitude={longitude!} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
