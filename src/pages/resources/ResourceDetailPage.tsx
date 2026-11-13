import { formatOperatingHours } from '../../utils/time';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resourcesApi, ResourceAvailabilityData } from '../../api/resources';
import { Resource } from '../../types';
import { AvailabilityTimeline } from '../../components/booking/AvailabilityTimeline';
import { BookingModal } from '../../components/booking/BookingModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  MapPin,
  Users,
  Clock,
  Sparkles,
  Calendar,
  Building2,
  Layers,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [availability, setAvailability] = useState<ResourceAvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchResourceData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await resourcesApi.get(id);
      if (res.data) setResource(res.data);

      const availRes = await resourcesApi.getAvailability(id, selectedDate);
      if (availRes.data) setAvailability(availRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourceData();
  }, [id, selectedDate]);

  if (loading && !resource) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Resource not found</p>
        <Link to="/resources" className="text-brand-600 font-bold mt-2 inline-block">
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back Button */}
      <Link
        to="/resources"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to All Resources
      </Link>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 uppercase">
                {resource.type.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {resource.code}
              </span>
              <Badge status={resource.maintenanceStatus} size="sm" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {resource.name}
            </h1>

            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {resource.description || 'College shared academic and research facility.'}
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={!resource.isActive || resource.maintenanceStatus === 'UNDER_MAINTENANCE'}
            onClick={() => setIsBookingOpen(true)}
          >
            Reserve Slot
          </Button>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Location</p>
            <p className="text-sm font-bold text-slate-800">
              {resource.building}, Room {resource.roomNumber}
            </p>
            <p className="text-xs text-slate-500">{resource.department?.name}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Seating Capacity</p>
            <p className="text-sm font-bold text-slate-800">{resource.capacity} Seats</p>
            <p className="text-xs text-slate-500">Fixed seating layout</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Operating Hours</p>
            <p className="text-sm font-bold text-slate-800 font-mono">
              {formatOperatingHours(resource)}
            </p>
            <p className="text-xs text-slate-500">Every college working day</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Booking Policy</p>
            <p className="text-sm font-bold text-slate-800">
              Super Admin Approval Required
            </p>
            <p className="text-xs text-slate-500">Booked by Department / Class</p>
          </div>
        </div>

        {/* Facilities list */}
        {resource.facilities && (
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Installed Equipment & Audio-Visual Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              {resource.facilities.split(',').map((fac, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80"
                >
                  {fac.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Date Selector & Interactive Availability Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Live Resource Availability</h2>
            <p className="text-xs text-slate-500">
              Check real-time slot occupancy, scheduled timetable classes, and open reservation windows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Target Date:</label>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {availability && (
          <AvailabilityTimeline
            resource={resource}
            date={selectedDate}
            busyIntervals={availability.busyIntervals}
          />
        )}
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          resource={resource}
          defaultDate={selectedDate}
          onSuccess={fetchResourceData}
        />
      )}
    </div>
  );
};
