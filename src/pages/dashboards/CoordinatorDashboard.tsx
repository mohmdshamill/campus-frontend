import React, { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reports';
import { bookingsApi } from '../../api/bookings';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Layers,
  CalendarCheck,
  Clock,
  Wrench,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CoordinatorDashboard: React.FC = () => {
  const { success, error } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboard = () => {
    reportsApi.getCoordinatorDashboard().then((res) => {
      if (res.data) setData(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      await bookingsApi.approve(bookingId, 'Approved by Coordinator via quick-action');
      success('Booking approved successfully!');
      fetchDashboard();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to approve booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    const reason = prompt('Please specify a reason for rejecting this booking:');
    if (!reason) return;

    setActionLoadingId(bookingId);
    try {
      await bookingsApi.reject(bookingId, reason);
      success('Booking rejected');
      fetchDashboard();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const overview = data?.overview || {};
  const department = data?.department;
  const upcoming = data?.upcomingReservations || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-100 text-brand-700">
              <Building className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
              {department?.name || 'Department Hub'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Department Coordinator Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your department facilities, review student booking approvals, and track equipment.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/resources">
            <Button variant="outline" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
              Add Resource
            </Button>
          </Link>
          <Link to="/coordinator/approvals">
            <Button variant="primary" size="sm" leftIcon={<CheckCircle className="w-4 h-4" />}>
              Review Approvals ({overview.pendingApprovalsCount || 0})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Dept Resources"
          value={overview.resourceCount || 0}
          icon={<Layers className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Today's Bookings"
          value={overview.todayBookingsCount || 0}
          icon={<CalendarCheck className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Pending Approvals"
          value={overview.pendingApprovalsCount || 0}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Operational"
          value={overview.operationalResources || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="In Maintenance"
          value={overview.maintenanceResources || 0}
          icon={<Wrench className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Overdue Items"
          value={overview.equipmentAlertsCount || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals & Recent Department Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Booking Requests</h3>
              <p className="text-xs text-slate-500">Fast action approval queue</p>
            </div>
            <Link
              to="/coordinator/approvals"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Full queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No booking requests found</p>
            ) : (
              recentActivity.map((b: any) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {b.resource.name} ({b.resource.code})
                    </p>
                    <p className="text-slate-500 mt-0.5 truncate">
                      Student: <strong className="text-slate-700">{b.user.name}</strong> •{' '}
                      {new Date(b.startDateTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge status={b.status} size="sm" />
                    {b.status === 'PENDING' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApprove(b.id)}
                          disabled={actionLoadingId === b.id}
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Quick Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(b.id)}
                          disabled={actionLoadingId === b.id}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Confirmed Reservations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Reservations</h3>
              <p className="text-xs text-slate-500">Confirmed sessions in your department</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Open Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No upcoming confirmed reservations
              </p>
            ) : (
              upcoming.map((b: any) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{b.resource.name}</p>
                    <p className="text-slate-500 mt-0.5 truncate">
                      Room: {b.resource.roomNumber} • By {b.user.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-slate-700 font-semibold">
                      {new Date(b.startDateTime).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
