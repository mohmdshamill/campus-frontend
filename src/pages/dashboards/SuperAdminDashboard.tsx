import React, { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reports';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Building2,
  Users,
  Layers,
  CalendarCheck,
  Clock,
  Wrench,
  TrendingUp,
  CalendarRange,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const SuperAdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getAdminDashboard().then((res) => {
      if (res.data) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const overview = data?.overview || {};
  const statusData = data?.statusBreakdown || [];
  const deptData = data?.departmentUtilization || [];
  const recentBookings = data?.recentBookings || [];
  const events = data?.upcomingEvents || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            College Administration Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time campus facilities utilization, pending approvals, and centralized booking metrics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/reports">
            <Button variant="outline" size="sm" leftIcon={<TrendingUp className="w-4 h-4" />}>
              Full Analytics
            </Button>
          </Link>
          <Link to="/resources">
            <Button variant="primary" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
              Manage Resources
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Departments"
          value={overview.totalDepartments || 0}
          icon={<Building2 className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Total Users"
          value={overview.totalUsers || 0}
          icon={<Users className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="All Resources"
          value={overview.totalResources || 0}
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
          title="Pending Requests"
          value={overview.pendingBookingsCount || 0}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="In Maintenance"
          value={overview.underMaintenanceCount || 0}
          icon={<Wrench className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Utilization Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Department Resource Utilization
              </h3>
              <p className="text-xs text-slate-500">
                Total bookings and facilities across academic departments
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="bookingsCount" name="Total Bookings" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resourcesCount" name="Active Resources" fill="#0c8fe4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Booking Status Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Current reservation status share</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {statusData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Campus Bookings</span>
            <span className="font-bold text-slate-800">
              {statusData.reduce((acc: number, item: any) => acc + item.count, 0)} reservations
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Booking Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Booking Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Booking Activity</h3>
              <p className="text-xs text-slate-500">Live reservation requests across the college</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {recentBookings.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No booking requests found</p>
            ) : (
              recentBookings.map((b: any) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {b.resource.name} ({b.resource.code})
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      By <span className="font-medium text-slate-700">{b.user.name}</span> • Purpose: {b.purpose}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {new Date(b.startDateTime).toLocaleDateString()}
                    </span>
                    <Badge status={b.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Events</h3>
              <p className="text-xs text-slate-500">Key seminars & campus conferences</p>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Schedule
            </Link>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No upcoming events scheduled</p>
            ) : (
              events.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{ev.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 uppercase">
                      {ev.eventType}
                    </span>
                  </div>
                  <p className="text-slate-500 truncate">
                    Venue: {ev.resource.name} ({ev.resource.building})
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {new Date(ev.startDateTime).toLocaleDateString()} • {new Date(ev.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
