import React, { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reports';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { BookingModal } from '../../components/booking/BookingModal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  CalendarCheck,
  Clock,
  Package,
  Layers,
  Search,
  ArrowRight,
  Sparkles,
  MapPin,
  Users as UsersIcon,
  Plus,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Resource } from '../../types';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingResource, setSelectedBookingResource] = useState<Resource | null>(null);

  const fetchDashboard = () => {
    reportsApi.getStudentDashboard().then((res) => {
      if (res.data) setData(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const user = data?.user;
  const upcomingBookings = data?.upcomingBookings || [];
  const pendingBookings = data?.pendingBookings || [];
  const recentHistory = data?.recentHistory || [];
  const activeEquipment = data?.activeEquipment || [];
  const featuredResources = data?.featuredResources || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/resources');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800 p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-brand-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Campus Resource Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-sm text-brand-100 leading-relaxed">
            Reserve smart classrooms, GPU laboratories, auditoriums, and borrow specialized equipment for your projects and academic research.
          </p>

          {/* Quick Search Bar inside banner */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search labs, auditoriums, classrooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-black transition-colors shadow-sm shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Abstract decorative graphic */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-radial pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Confirmed"
          value={upcomingBookings.length}
          icon={<CalendarCheck className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={pendingBookings.length}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Borrowed Equipment"
          value={activeEquipment.length}
          icon={<Package className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Total Reservations"
          value={recentHistory.length}
          icon={<Layers className="w-5 h-5" />}
          color="slate"
        />
      </div>

      {/* Featured Resources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Available Campus Facilities</h2>
            <p className="text-xs text-slate-500">Quickly book smart facilities for your work</p>
          </div>
          <Link
            to="/resources"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Explore all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredResources.map((res: Resource) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 uppercase tracking-wide">
                    {res.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">{res.code}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{res.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{res.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {res.roomNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <UsersIcon className="w-3.5 h-3.5 text-slate-400" /> {res.capacity} seats
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedBookingResource(res)}
                >
                  Book
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: My Active Bookings & Equipment Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">My Upcoming Reservations</h3>
            <Link to="/my-bookings" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingBookings.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                You have no upcoming confirmed reservations
              </p>
            ) : (
              upcomingBookings.map((b: any) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{b.resource.name}</p>
                    <p className="text-slate-500 mt-0.5 truncate">
                      {b.resource.building} • Room {b.resource.roomNumber}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge status={b.status} size="sm" />
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      {new Date(b.startDateTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Equipment Requests & Borrowings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">My Equipment Borrowings</h3>
            <Link to="/equipment" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Borrow Items
            </Link>
          </div>

          <div className="space-y-3">
            {activeEquipment.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No active equipment borrowing requests
              </p>
            ) : (
              activeEquipment.map((tx: any) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {tx.equipment.name} ({tx.quantity}x)
                    </p>
                    <p className="text-slate-500 mt-0.5 truncate">Asset: {tx.equipment.assetCode}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge status={tx.status} size="sm" />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Due: {new Date(tx.expectedReturnDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedBookingResource && (
        <BookingModal
          isOpen={!!selectedBookingResource}
          onClose={() => setSelectedBookingResource(null)}
          resource={selectedBookingResource}
          onSuccess={fetchDashboard}
        />
      )}
    </div>
  );
};
