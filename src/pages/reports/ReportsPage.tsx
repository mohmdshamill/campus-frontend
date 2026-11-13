import React, { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reports';
import { departmentsApi } from '../../api/departments';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Department } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BarChart3,
  Download,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Package,
} from 'lucide-react';
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

export const ReportsPage: React.FC = () => {
  const { isCoordinator, isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [data, setData] = useState<any>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getAnalytics({
        departmentId: selectedDept || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (res.data) setData(res.data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentsApi.list({ isActive: 'true' }).then((res) => {
      if (res.data) setDepartments(res.data);
    });
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept, startDate, endDate]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await reportsApi.exportBookingsCsv({
        departmentId: selectedDept || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campus_connect_bookings_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Bookings report downloaded as CSV');
    } catch {
      error('Failed to export CSV report');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = data?.summary || {};
  const statusDistribution = data?.statusDistribution || [];
  const topResources = data?.topResources || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data insights on facility utilization, peak booking volumes, and CSV report exports.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          isLoading={isExporting}
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCsv}
        >
          Export Bookings CSV
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Department:</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              <option value="">College-Wide (All)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>
        </div>

        {(selectedDept || startDate || endDate) && (
          <button
            onClick={() => {
              setSelectedDept('');
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-brand-600 hover:underline font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Bookings"
          value={summary.totalBookings || 0}
          icon={<Calendar className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Approved Slots"
          value={summary.approvedBookings || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Approval Rate"
          value={`${summary.approvalRate || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Rejected Requests"
          value={summary.rejectedBookings || 0}
          icon={<XCircle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Cancelled"
          value={summary.cancelledBookings || 0}
          icon={<XCircle className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="Overdue Gear"
          value={summary.overdueEquipmentCount || 0}
          icon={<Package className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Visual Charts */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Most Booked Resources */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Top Most Booked Facilities
            </h3>
            <p className="text-xs text-slate-500 mb-4">Confirmed reservations volume by resource</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topResources} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" name="Confirmed Bookings" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Breakdown Pie */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reservation Status Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">Proportion of approved, pending, and rejected slots</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {statusDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
