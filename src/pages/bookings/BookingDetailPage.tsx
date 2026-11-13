import { formatClock12, formatDateDMY, parseBookingPurpose } from '../../utils/time';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingsApi } from '../../api/bookings';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  History,
} from 'lucide-react';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isCoordinator, isSuperAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooking = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await bookingsApi.get(id);
      if (res.data) setBooking(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleApprove = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      await bookingsApi.approve(booking.id, 'Approved via details inspector');
      success('Booking approved!');
      fetchBooking();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!booking) return;
    const reason = prompt('Specify rejection reason:');
    if (!reason) return;

    setActionLoading(true);
    try {
      await bookingsApi.reject(booking.id, reason);
      success('Booking rejected');
      fetchBooking();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    const reason = prompt('Specify cancellation reason:');
    if (!reason) return;

    setActionLoading(true);
    try {
      await bookingsApi.cancel(booking.id, reason);
      success('Booking cancelled');
      fetchBooking();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const canApproveReject = isSuperAdmin && booking.status === 'PENDING';
  const canCancel =
    (booking.status === 'APPROVED' || booking.status === 'PENDING') &&
    (user?.id === booking.userId || isSuperAdmin);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Bookings
      </Link>

      {/* Main Booking Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {booking.bookingCode}
              </span>
              <Badge status={booking.status} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {parseBookingPurpose(booking.purpose).purpose}
            </h1>
            {parseBookingPurpose(booking.purpose).department && (
              <p className="text-sm font-semibold text-brand-700 mt-1">
                {parseBookingPurpose(booking.purpose).department}
                {parseBookingPurpose(booking.purpose).className ? ` — ${parseBookingPurpose(booking.purpose).className}` : ''}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Created on {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canApproveReject && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={actionLoading}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={handleApprove}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={actionLoading}
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={handleReject}
                >
                  Reject
                </Button>
              </>
            )}

            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                isLoading={actionLoading}
                className="text-rose-600 hover:bg-rose-50"
                onClick={handleCancel}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>

        {/* Reasons block if rejected or cancelled */}
        {booking.rejectionReason && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
            <p className="font-bold">Rejection Reason</p>
            <p className="mt-0.5">{booking.rejectionReason}</p>
          </div>
        )}

        {booking.cancellationReason && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
            <p className="font-bold">Cancellation Reason</p>
            <p className="mt-0.5">{booking.cancellationReason}</p>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-400 uppercase text-[10px]">Target Resource</p>
            <Link
              to={`/resources/${booking.resourceId}`}
              className="text-sm font-bold text-brand-600 hover:underline block"
            >
              {booking.resource.name}
            </Link>
            <p className="text-slate-500">
              {booking.resource.building}, Room {booking.resource.roomNumber}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-400 uppercase text-[10px]">Reserved Schedule</p>
            <p className="text-sm font-bold text-slate-800">
              {formatDateDMY(booking.startDateTime)}
            </p>
            <p className="text-slate-500 font-mono">
              {formatClock12(booking.startDateTime)} - {formatClock12(booking.endDateTime)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-400 uppercase text-[10px]">Student / Requester</p>
            <p className="text-sm font-bold text-slate-800">{booking.user.name}</p>
            <p className="text-slate-500 font-mono">{booking.user.collegeId || booking.user.email}</p>
          </div>
        </div>

        {/* Attendees & Special Requirements */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-700 uppercase text-[10px]">Attendees Count</p>
            <p className="mt-0.5 font-semibold text-slate-900">{booking.attendeesCount} persons</p>
          </div>
          <div>
            <p className="font-bold text-slate-700 uppercase text-[10px]">Special Requirements</p>
            <p className="mt-0.5">{booking.specialRequirements || 'None specified'}</p>
          </div>
        </div>
      </div>

      {/* Booking Status Lifecycle Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-brand-600" />
          Status History & Audit Trail
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {booking.statusHistory && booking.statusHistory.length > 0 ? (
            booking.statusHistory.map((h, idx) => (
              <div key={idx} className="relative text-xs space-y-1">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <Badge status={h.toStatus} size="sm" />
                  <span className="text-[11px] text-slate-400">
                    {new Date(h.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{h.reason}</p>
                {h.changedBy && (
                  <p className="text-[11px] text-slate-400">
                    Action by: <span className="text-slate-600">{h.changedBy.name}</span> ({h.changedBy.role})
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No status changes recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
