import { formatTime12 } from '../../utils/time';
import React, { useEffect, useState } from 'react';
import { schedulesApi } from '../../api/schedules';
import { departmentsApi } from '../../api/departments';
import { resourcesApi } from '../../api/resources';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AcademicSchedule, Department, Resource, DayOfWeek } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  CalendarDays,
  Plus,
  BookOpen,
  Trash2,
  Clock,
  User,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { TimeInput24 } from '../../components/common/TimeInput24';

const DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export const SchedulesPage: React.FC = () => {
  const { isCoordinator, isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [schedules, setSchedules] = useState<AcademicSchedule[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await schedulesApi.list({
        departmentId: selectedDept || undefined,
        dayOfWeek: selectedDay || undefined,
      });
      if (res.data) setSchedules(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentsApi.list({ isActive: 'true' }).then((res) => {
      if (res.data) setDepartments(res.data);
    });
    resourcesApi.list({ isActive: 'true' }).then((res) => {
      if (res.data) setResources(res.data);
    });
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [selectedDept, selectedDay]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this academic schedule class entry?')) return;
    try {
      await schedulesApi.delete(id);
      success('Academic schedule removed');
      fetchSchedules();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete schedule entry');
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<any>();

  const onCreateSchedule = async (values: any) => {
    setConflictError(null);
    try {
      await schedulesApi.create(values);
      success('Class timetable entry added!');
      setIsCreateOpen(false);
      reset();
      fetchSchedules();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add class entry';
      setConflictError(msg);
      error(msg, 'Timetable Conflict');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Schedules & Timetable
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Weekly class schedule blocking recurring slots to prevent resource double-bookings.
          </p>
        </div>

        {(isCoordinator || isSuperAdmin) && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setConflictError(null);
              setIsCreateOpen(true);
            }}
          >
            Add Class Timetable
          </Button>
        )}
      </div>

      {/* Day Selector & Department Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Day of Week Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedDay === day
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {day.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Department dropdown */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full md:w-64 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Schedules List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : schedules.length === 0 ? (
        <EmptyState
          title={`No classes scheduled on ${selectedDay.toLowerCase()}`}
          description="There are currently no regular academic lectures or labs scheduled on this day."
          actionText={isCoordinator || isSuperAdmin ? 'Add Class Schedule' : undefined}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schedules.map((sch) => (
            <div
              key={sch.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    {sch.courseCode}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {sch.semester} • {sch.academicYear}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {sch.courseName}
                </h3>

                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Instructor: <strong className="text-slate-700">{sch.instructorName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-medium text-slate-700">
                      {formatTime12(sch.startTime)} - {formatTime12(sch.endTime)}
                    </span>
                  </div>
                  {sch.resource && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Venue: <strong>{sch.resource.name}</strong> ({sch.resource.roomNumber})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {(isCoordinator || isSuperAdmin) && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDelete(sch.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove Schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Schedule Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => {
            setConflictError(null);
            setIsCreateOpen(false);
          }}
          title="Add Academic Class Entry"
          subtitle="Configure regular recurring lecture or practical lab slots"
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit(onCreateSchedule)} className="space-y-4 text-xs">
            {conflictError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Schedule Conflict Detected</p>
                  <p className="mt-0.5 leading-relaxed">{conflictError}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-402"
                  {...register('courseCode')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Internals"
                  {...register('courseName')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                required
                placeholder="Prof. Jane Doe"
                {...register('instructorName')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Department
                </label>
                <select
                  required
                  {...register('departmentId')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Assigned Resource
                </label>
                <select
                  required
                  {...register('resourceId')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Day of Week
                </label>
                <select
                  {...register('dayOfWeek')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  defaultValue="09:00"
                  {...register('startTime')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">End Time</label>
                <input
                  type="time"
                  required
                  defaultValue="10:30"
                  {...register('endTime')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Semester</label>
                <input
                  type="text"
                  required
                  defaultValue="Sem 6"
                  {...register('semester')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  required
                  defaultValue="2026-2027"
                  {...register('academicYear')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Timetable Entry
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
