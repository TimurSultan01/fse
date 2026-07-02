import type { MeetupDetail } from '../types';

function toIcsStamp(date: string, time: string): string {
  const clean = `${date}T${(time || '00:00:00').slice(0, 8).padEnd(8, ':00')}`;
  const parsed = new Date(clean);
  if (Number.isNaN(parsed.getTime())) return '';
  // Format: 20260621T152000
  return `${date.replace(/-/g, '')}T${(time || '00:00').replace(/:/g, '').padEnd(6, '0')}`;
}

function escapeText(value: string): string {
  return value.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
}

/** Erzeugt einen iCalendar-String und stößt den Download an. */
export function downloadMeetupIcs(meetup: MeetupDetail): void {
  const start = toIcsStamp(meetup.date, meetup.time);
  const end = meetup.end_time ? toIcsStamp(meetup.date, meetup.end_time) : start;
  const location = [meetup.spot, meetup.region].filter(Boolean).join(', ');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FlightMeet//DE',
    'BEGIN:VEVENT',
    `UID:flightmeet-${meetup.id}@flightmeet`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(meetup.title)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(meetup.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `flugtreffen-${meetup.id}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
