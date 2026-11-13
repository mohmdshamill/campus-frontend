import React, { useEffect, useState } from 'react';
import { bookingsApi } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Booking, BookingStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Eye,
  X,
  FileSpreadsheet,
  CalendarPlus,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const BookingsPage: React.FC = () => {
  const { user, isCoordinator, isSuperAdmin } = useAuth();
  const { success, error } = useToast();
  const location = useLocation();

  const isPendingView = location.pathname.includes('/approvals');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(isPendingView ? 'PENDING' : '');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.list({
        search: search || undefined,
        status: (statusFilter as BookingStatus) || undefined,
      });
      if (res.data) setBookings(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      await bookingsApi.approve(id, 'Approved via Bookings Hub');
      success('Booking approved successfully!');
      fetchBookings();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to approve booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Specify rejection reason:');
    if (!reason) return;

    setActionLoadingId(id);
    try {
      await bookingsApi.reject(id, reason);
      success('Booking rejected');
      fetchBookings();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Please specify cancellation reason:');
    if (!reason) return;

    setActionLoadingId(id);
    try {
      await bookingsApi.cancel(id, reason);
      success('Booking cancelled successfully');
      fetchBookings();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isPendingView ? 'Pending Booking Approvals' : 'Resource Bookings & Schedule Log'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isPendingView
              ? 'Reservation requests waiting for Super Admin approval.'
              : 'Complete history of confirmed, pending, and past resource reservations.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CalendarPlus className="w-4 h-4" />}
            onClick={async () => {
              try {
                const blob = await bookingsApi.exportMyCalendar();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'my-bookings.ics';
                a.click();
                URL.revokeObjectURL(url);
                success('Calendar file downloaded — import it into Google/Outlook/Apple Calendar.');
              } catch {
                error('Could not export your calendar.');
              }
            }}
          >
            Add to calendar
          </Button>
          <Link to="/resources">
            <Button variant="primary" size="sm">
              New Booking Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Tab controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          {[
            { label: 'All Requests', val: '' },
            { label: 'Pending', val: 'PENDING' },
            { label: 'Approved', val: 'APPROVED' },
            { label: 'Cancelled', val: 'CANCELLED' },
            { label: 'Rejected', val: 'REJECTED' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.val
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, student, purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </form>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings match your filter"
          description="There are currently no reservations found matching the selected status or search term."
          actionText="Reset Filters"
          onAction={() => {
            setStatusFilter('');
            setSearch('');
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Code / Purpose</th>
                  <th className="px-6 py-3.5">Resource & Dept</th>
                  <th className="px-6 py-3.5">Requested By</th>
                  <th className="px-6 py-3.5">Scheduled Interval</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900">{b.bookingCode}</span>
                      <p className="text-slate-500 font-medium text-[11px] mt-0.5 line-clamp-1">
                        {b.purpose}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{b.resource.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {b.resource.code} • {b.resource.department?.code}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{b.user.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{b.user.collegeId}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {new Date(b.startDateTime).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(b.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={b.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/bookings/${b.id}`}>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>

                        {/* Only the Super Admin can approve / reject */}
                        {isSuperAdmin && b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(b.id)}
                              disabled={actionLoadingId === b.id}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Approve Booking"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(b.id)}
                              disabled={actionLoadingId === b.id}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Reject Booking"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Cancellation for Student owner or staff */}
                        {(b.status === 'APPROVED' || b.status === 'PENDING') &&
                          (user?.id === b.userId || isSuperAdmin) && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={actionLoadingId === b.id}
                              className="px-2 py-1 rounded text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                              title="Cancel"
                            >
                              Cancel
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
