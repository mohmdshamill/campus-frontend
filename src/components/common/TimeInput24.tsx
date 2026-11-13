import React from 'react';

interface TimeInputProps {
  value: string; // "HH:mm" (24h, internal/API format)
  onChange: (value: string) => void;
  step?: number; // minute step
  className?: string;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12

/** 12-hour picker with AM/PM. Value in/out stays "HH:mm" (24h) for the API. */
export const TimeInput24: React.FC<TimeInputProps> = ({ value, onChange, step = 5, className }) => {
  const [h24 = 9, m = 0] = (value || '09:00').split(':').map(Number);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step);
  if (!minutes.includes(m)) minutes.push(m);
  minutes.sort((a, b) => a - b);

  const emit = (hour12: number, min: number, p: string) => {
    let h = hour12 % 12;
    if (p === 'PM') h += 12;
    onChange(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  };

  const base =
    'flex-1 px-2 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none';

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <select aria-label="Hour" value={h12} onChange={(e) => emit(Number(e.target.value), m, period)} className={base}>
        {HOURS_12.map((h) => (
          <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
        ))}
      </select>
      <span className="font-bold text-slate-500">:</span>
      <select aria-label="Minute" value={m} onChange={(e) => emit(h12, Number(e.target.value), period)} className={base}>
        {minutes.map((x) => (
          <option key={x} value={x}>{String(x).padStart(2, '0')}</option>
        ))}
      </select>
      <select aria-label="AM or PM" value={period} onChange={(e) => emit(h12, m, e.target.value)} className={base}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};
