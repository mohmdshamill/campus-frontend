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

/** "13/11/2026" (dd/mm/yyyy) */
export const formatDateDMY = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });

/** "1:00 PM" from an ISO timestamp, in college time (IST). */
export const formatClock12 = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });

/**
 * Bookings store "who it is for" as a prefix: "[Computer Department – BCA 1st Year] Project work".
 * Split it into department / class / purpose.
 */
export const parseBookingPurpose = (raw: string): { department: string; className: string; purpose: string } => {
  const m = raw.match(/^\[([^\]–]+?)(?:\s*–\s*([^\]]+))?\]\s*(.*)$/s);
  return m
    ? { department: m[1].trim(), className: (m[2] || '').trim(), purpose: m[3] }
    : { department: '', className: '', purpose: raw };
};
