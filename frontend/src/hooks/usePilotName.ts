import { useEffect, useState } from 'react';

const STORAGE_KEY = 'flightmeet_pilot_name';

export function usePilotName() {
  const [pilotName, setPilotNameState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || 'Gastpilot';
  });

  function setPilotName(value: string): void {
    const trimmed = value.trim() || 'Gastpilot';
    setPilotNameState(trimmed);
    localStorage.setItem(STORAGE_KEY, trimmed);
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, pilotName);
  }, [pilotName]);

  return { pilotName, setPilotName };
}
