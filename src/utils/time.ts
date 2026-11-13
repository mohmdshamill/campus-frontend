/** Convert "HH:mm" (24h) to "h:mm AM/PM". */
export const formatTime12 = (hhmm?: string): string => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
};

const ANY_TIME_TYPES = ['AUDITORIUM', 'SEMINAR_HALL', 'MEETING_ROOM'];

/** "8:30 AM - 4:30 PM", or "Any time" for the main areas (no time restriction). */
export const formatOperatingHours = (r: { type: string; operatingHoursStart: string; operatingHoursEnd: string }): string =>
  ANY_TIME_TYPES.includes(r.type) ? 'Any time' : `${formatTime12(r.operatingHoursStart)} - ${formatTime12(r.operatingHoursEnd)}`;
