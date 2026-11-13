import React, { useEffect, useState } from 'react';
import { eventsApi } from '../../api/events';
import { resourcesApi } from '../../api/resources';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CollegeEvent, Resource } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { CalendarRange, Plus, Calendar, MapPin, Users, XCircle, Search, AlertCircle } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { TimeInput24 } from '../../components/common/TimeInput24';

// Venues where college events may be held
const EVENT_VENUE_CODES = ['AUD-MAIN-01', 'OPEN-MAIN-01', 'SEM-MAIN-01'];

export const EventsPage: React.FC = () => {
  const { isCoordinator, isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.list({ search: search || undefined });
      if (res.data) setEvents(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    resourcesApi.list({ isActive: 'true', limit: 200 }).then((res) => {
      if (res.data)
        setResources(res.data.filter((r) => EVENT_VENUE_CODES.includes(r.code)));
    });
    fetchEvents();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    try {
      await eventsApi.cancel(id);
      success('College event cancelled');
      fetchEvents();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to cancel event');
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<any>();

  const onCreateEvent = async (values: any) => {
    setConflictError(null);
    const startIso = new Date(`${values.startDate}T${values.startTime}:00+05:30`).toISOString();
    const endIso = new Date(`${values.endDate}T${values.endTime}:00+05:30`).toISOString();

    try {
      await eventsApi.create({
        resourceId: values.resourceId,
        title: values.title,
        description: values.description,
        organizer: values.organizer,
        eventType: values.eventType,
        startDateTime: startIso,
        endDateTime: endIso,
      });
      success('College event created successfully!');
      setIsCreateOpen(false);
      reset();
      fetchEvents();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create event';
      setConflictError(msg);
      error(msg, 'Event Conflict');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            College Events & Conventions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Major symposiums, cultural activities, hackathons, and guest keynote seminars.
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
            Schedule New Event
          </Button>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No upcoming events found"
          description="There are currently no active public college events scheduled in the calendar."
          actionText={isCoordinator || isSuperAdmin ? 'Schedule Event' : undefined}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 uppercase tracking-wide">
                    {ev.eventType}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Campus Event</span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                  {ev.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Organizer: <strong>{ev.organizer}</strong></span>
                  </p>
                  {ev.resource && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Venue: <strong>{ev.resource.name}</strong> ({ev.resource.building})
                      </span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(ev.startDateTime).toLocaleDateString()} •{' '}
                      {new Date(ev.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>
              </div>

              {(isCoordinator || isSuperAdmin) && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleCancel(ev.id)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 p-1"
                  >
                    Cancel Event
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Event Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => {
            setConflictError(null);
            setIsCreateOpen(false);
          }}
          title="Schedule Campus Event"
          subtitle="Reserve auditorium or seminar hall for an institutional event"
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit(onCreateEvent)} className="space-y-4 text-xs">
            {conflictError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Booking Conflict Detected</p>
                  <p className="mt-0.5 leading-relaxed">{conflictError}</p>
                </div>
              </div>
            )}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Annual Autonomous Systems Symposium"
                {...register('title')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Organizer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACM Student Chapter"
                  {...register('organizer')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Event Type</label>
                <select
                  {...register('eventType')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="CONFERENCE">Conference</option>
                  <option value="SEMINAR">Seminar</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="CULTURAL">Cultural Event</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Venue Resource</label>
              <select
                required
                {...register('resourceId')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code}) - Cap: {r.capacity}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  {...register('startDate')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  defaultValue="10:00"
                  {...register('startTime')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  required
                  {...register('endDate')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">End Time</label>
                <input
                  type="time"
                  required
                  defaultValue="16:00"
                  {...register('endTime')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Overview of the event agenda, keynote guests, and participation requirements"
                {...register('description')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Schedule Event
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
