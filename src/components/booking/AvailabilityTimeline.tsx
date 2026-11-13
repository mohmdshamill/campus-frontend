import { formatOperatingHours, formatTime12 } from '../../utils/time';
import React from 'react';
import { Clock, ShieldAlert, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import { Resource } from '../../types';

interface BusyInterval {
  start: string;
  end: string;
  type: string;
  title: string;
  status?: string;
  id?: string;
}

interface AvailabilityTimelineProps {
  resource: Resource;
  date: string;
  busyIntervals: BusyInterval[];
  onSelectSlot?: (startHour: string, endHour: string) => void;
}

export const AvailabilityTimeline: React.FC<AvailabilityTimelineProps> = ({
  resource,
  date,
  busyIntervals,
  onSelectSlot,
}) => {
  // Parse operating hours
  const startHour = parseInt(resource.operatingHoursStart.split(':')[0], 10) || 8;
  const endHour = parseInt(resource.operatingHoursEnd.split(':')[0], 10) || 20;

  const totalHours = Math.max(1, endHour - startHour);

  // Generate 1-hour time blocks
  const hourBlocks = Array.from({ length: totalHours }, (_, i) => startHour + i);

  const getPositionPercent = (timeStr: string) => {
    // If ISO date, extract time or parse
    let hours = 0;
    let minutes = 0;

    if (timeStr.includes('T')) {
      const d = new Date(timeStr);
      // Format in college timezone (Asia/Kolkata)
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d).split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else {
      const parts = timeStr.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    }

    const totalMinutes = (hours - startHour) * 60 + minutes;
    return Math.max(0, Math.min(100, (totalMinutes / (totalHours * 60)) * 100));
  };

  const getIntervalColor = (item: BusyInterval) => {
    if (item.type === 'ACADEMIC_CLASS') {
      return 'bg-blue-500/90 border-blue-600 text-white';
    }
    if (item.type === 'MAINTENANCE') {
      return 'bg-rose-500/90 border-rose-600 text-white';
    }
    if (item.type === 'COLLEGE_EVENT') {
      return 'bg-purple-600/90 border-purple-700 text-white';
    }
    if (item.status === 'REJECTED') {
      return 'bg-slate-500/90 border-slate-600 text-white';
    }
    if (item.status === 'APPROVED') {
      return 'bg-indigo-600/90 border-indigo-700 text-white';
    }
    return 'bg-amber-500/90 border-amber-600 text-white'; // Pending
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            Daily Availability Timeline ({date})
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Operating Hours: <span className="font-semibold text-slate-700">{formatOperatingHours(resource)}</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600"></span>
            <span className="text-slate-600">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span className="text-slate-600">Timetable Class</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span className="text-slate-600">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500"></span>
            <span className="text-slate-600">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="space-y-2">
        {/* Hour markers */}
        <div className="relative h-6 text-[11px] text-slate-400 font-medium select-none">
          {hourBlocks.map((hour, idx) => (
            <span
              key={hour}
              className="absolute -translate-x-1/2"
              style={{ left: `${(idx / totalHours) * 100}%` }}
            >
              {formatTime12(`${hour}:00`)}
            </span>
          ))}
          <span className="absolute right-0 translate-x-1/2">
            {formatTime12(`${endHour}:00`)}
          </span>
        </div>

        {/* Bar Container */}
        <div className="relative h-14 bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden shadow-inner flex items-center">
          {/* Background grid lines */}
          {hourBlocks.map((_, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 border-r border-emerald-100/80 pointer-events-none"
              style={{ left: `${(idx / totalHours) * 100}%` }}
            />
          ))}

          {/* Busy segments placed absolutely */}
          {busyIntervals.map((item, idx) => {
            const left = getPositionPercent(item.start);
            const right = getPositionPercent(item.end);
            const width = Math.max(1, right - left);

            return (
              <div
                key={idx}
                className={`absolute top-1 bottom-1 rounded-lg border shadow-sm px-2 flex items-center overflow-hidden text-xs font-medium cursor-pointer transition-transform hover:scale-[1.02] hover:z-20 ${getIntervalColor(
                  item
                )}`}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${item.title} (${item.type})`}
              >
                <span className="truncate text-[11px] leading-tight font-medium">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Items List breakdown */}
      <div className="pt-2">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Scheduled Blocks on this Date
        </h5>
        {busyIntervals.length === 0 ? (
          <div className="text-center py-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 inline mr-1.5" />
            No conflicts scheduled. This resource is completely open for reservations throughout operating hours!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {busyIntervals.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs"
              >
                <div className="shrink-0">
                  {item.type === 'ACADEMIC_CLASS' && <BookOpen className="w-4 h-4 text-blue-600" />}
                  {item.type === 'BOOKING' && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                  {item.type === 'MAINTENANCE' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {item.type === 'COLLEGE_EVENT' && <ShieldAlert className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {item.type.replace('_', ' ')} • {item.status || 'Scheduled'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
