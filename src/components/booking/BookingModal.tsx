import { formatTime12 } from '../../utils/time';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TimeInput24 } from '../common/TimeInput24';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { bookingsApi } from '../../api/bookings';
import { Resource } from '../../types';
import { resourcesApi } from '../../api/resources';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Users, FileText, AlertCircle, Sparkles } from 'lucide-react';

const bookingSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  purpose: z.string().min(5, 'Purpose must be at least 5 characters'),
  attendeesCount: z.number().int().min(1, 'At least 1 attendee required'),
  specialRequirements: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
  defaultDate?: string;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  resource: initialResource,
  defaultDate,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Resource>(initialResource);
  const [rooms, setRooms] = useState<Resource[]>([]);
  const [deptFilter, setDeptFilter] = useState<string>(user?.departmentId || initialResource.departmentId);
  const [className, setClassName] = useState<string>('');
  const resource = selected;

  // Local calendar date (toISOString would give the UTC date)
  const todayStr = new Date().toLocaleDateString('en-CA');

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: defaultDate || todayStr,
      startTime: ['AUDITORIUM', 'SEMINAR_HALL', 'MEETING_ROOM'].includes(resource.type) ? '09:00' : resource.operatingHoursStart || '09:00',
      endTime: '11:00',
      purpose: '',
      attendeesCount: 1,
      specialRequirements: '',
    },
  });

  const SHARED = ['AUDITORIUM', 'SEMINAR_HALL', 'MEETING_ROOM'];

  // Load the rooms this user may book
  useEffect(() => {
    if (!isOpen) return;
    setSelected(initialResource);
    setClassName('');
    resourcesApi
      .list({ isActive: 'true' as any, limit: 200 })
      .then((res) => {
        const all = res.data || [];
        setRooms(all.some((r) => r.id === initialResource.id) ? all : [initialResource, ...all]);
      })
      .catch(() => setRooms([initialResource]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialResource.id]);

  const departments = useMemo(() => {
    const map = new Map<string, string>();
    rooms.forEach((r) => map.set(r.departmentId, r.department?.name || r.departmentId));
    return Array.from(map.entries());
  }, [rooms]);

  // Classes (e.g. "BCA 1st Year") of the selected booking department
  const classOptions = rooms
    .filter((r) => r.departmentId === deptFilter && r.type === 'CLASSROOM')
    .map((r) => r.name.replace(/ Classroom$/i, ''));

  // Department / class = WHO is booking (not which room is booked)
  const handleDeptChange = (deptId: string) => {
    setDeptFilter(deptId);
    setClassName('');
  };

  const startTimeVal = watch('startTime');
  const endTimeVal = watch('endTime');

  const onSubmit = async (values: BookingFormValues) => {
    setConflictError(null);

    // Entered times are college-local (IST, +05:30); send with the explicit offset
    // so the backend's timezone conversion returns the same HH:mm the user chose.
    if (values.endTime <= values.startTime) {
      setConflictError('End time must be after the start time.');
      return;
    }

    const startIso = new Date(`${values.date}T${values.startTime}:00+05:30`).toISOString();
    const endIso = new Date(`${values.date}T${values.endTime}:00+05:30`).toISOString();

    try {
      const res = await bookingsApi.create({
        resourceId: resource.id,
        startDateTime: startIso,
        endDateTime: endIso,
        purpose: `[${(departments.find(([id]) => id === deptFilter)?.[1] || '')}${className ? ' – ' + className : ''}] ${values.purpose}`,
        attendeesCount: Number(values.attendeesCount),
        specialRequirements: values.specialRequirements,
      });

      if (res.success) {
        success(
          'Booking request submitted! Awaiting Super Admin approval.',
          'Reservation Created'
        );
        reset();
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit booking request';
      setConflictError(msg);
      error(msg, 'Booking Not Allowed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reserve ${resource.name}`}
      subtitle={`Code: ${resource.code} • Capacity: ${resource.capacity} seats`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Who is booking: department + class */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Booking For: Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            >
              {departments.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Class / Year
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            >
              <option value="">Whole Department</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {conflictError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Booking Not Allowed</p>
              <p className="mt-0.5 leading-relaxed">{conflictError}</p>
            </div>
          </div>
        )}

        {/* Resource Policy Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>
              Operating: <strong>{['AUDITORIUM', 'SEMINAR_HALL', 'MEETING_ROOM'].includes(resource.type) ? 'Any time (24 hours)' : `${formatTime12(resource.operatingHoursStart)} - ${formatTime12(resource.operatingHoursEnd)}`}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>
              Super Admin Approval Required
            </span>
          </div>
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Reservation Date
          </label>
          <div className="relative">
            <input
              type="date"
              min={todayStr}
              {...register('date')}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          {errors.date && <p className="text-xs text-rose-600 mt-1">{errors.date.message}</p>}
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Start Time (HH:mm)
            </label>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => <TimeInput24 value={field.value} onChange={field.onChange} />}
            />
            {errors.startTime && (
              <p className="text-xs text-rose-600 mt-1">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              End Time (HH:mm)
            </label>
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => <TimeInput24 value={field.value} onChange={field.onChange} />}
            />
            {errors.endTime && (
              <p className="text-xs text-rose-600 mt-1">{errors.endTime.message}</p>
            )}
          </div>
        </div>

        {/* Expected Attendees */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Expected Attendees
          </label>
          <input
            type="number"
            min={1}
            max={resource.capacity}
            {...register('attendeesCount', { valueAsNumber: true })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Maximum allowed: {resource.capacity} people</p>
          {errors.attendeesCount && (
            <p className="text-xs text-rose-600 mt-1">{errors.attendeesCount.message}</p>
          )}
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Booking Purpose
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Capstone Project Team Simulation, Faculty Guest Lecture, etc."
            {...register('purpose')}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
          {errors.purpose && <p className="text-xs text-rose-600 mt-1">{errors.purpose.message}</p>}
        </div>

        {/* Special Requirements */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Special Equipment / Audio-Visual Requirements (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Wireless collar mic, HDMI switcher, GPU cluster access"
            {...register('specialRequirements')}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Confirm & Reserve
          </Button>
        </div>
      </form>
    </Modal>
  );
};
