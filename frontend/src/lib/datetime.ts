const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

/** Wandelt "2026-06-21" in "Sa., 21. Juni 2026" um. */
export function formatDate(isoDate?: string | null): string {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? isoDate : dateFormatter.format(date);
}

/** Kürzt "15:20:00" auf "15:20". */
export function formatTime(time?: string | null): string {
  if (!time) return '';
  return time.slice(0, 5);
}

/** Kombiniert Datum + Uhrzeit(en) zu einer lesbaren Zeile. */
export function formatDateTime(isoDate?: string | null, time?: string | null, endTime?: string | null): string {
  const parts = [formatDate(isoDate)];
  const start = formatTime(time);
  const end = formatTime(endTime);

  if (start) {
    parts.push(end ? `${start}–${end} Uhr` : `${start} Uhr`);
  }

  return parts.filter(Boolean).join(', ');
}
