import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Layers,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  Wrench,
  BarChart3,
  FileText,
  Package,
  Clock,
  Compass,
  CheckCircle,
  GraduationCap,
  Shield,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isSuperAdmin, isCoordinator, isStudent } = useAuth();

  const getLinks = () => {
    if (isSuperAdmin) {
      return [
        { label: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Departments', to: '/admin/departments', icon: Building2 },
        { label: 'Users & Roles', to: '/admin/users', icon: Users },
        { label: 'All Resources', to: '/resources', icon: Layers },
        { label: 'All Bookings', to: '/bookings', icon: CalendarCheck2 },
        { label: 'Academic Timetable', to: '/schedules', icon: CalendarDays },
        { label: 'College Events', to: '/events', icon: CalendarRange },
        { label: 'Equipment Inventory', to: '/equipment', icon: Package },
        { label: 'Maintenance', to: '/maintenance', icon: Wrench },
        { label: 'Analytics & Reports', to: '/reports', icon: BarChart3 },
        { label: 'Audit Logs', to: '/admin/audit-logs', icon: FileText },
      ];
    }

    if (isCoordinator) {
      return [
        { label: 'Dept Dashboard', to: '/coordinator/dashboard', icon: LayoutDashboard },
        { label: 'Dept Resources', to: '/resources', icon: Layers },
        { label: 'Pending Bookings', to: '/coordinator/approvals', icon: CheckCircle },
        { label: 'Booking Calendar', to: '/bookings', icon: CalendarCheck2 },
        { label: 'Academic Timetable', to: '/schedules', icon: CalendarDays },
        { label: 'College Events', to: '/events', icon: CalendarRange },
        { label: 'Equipment Inventory', to: '/equipment', icon: Package },
        { label: 'Equipment Requests', to: '/equipment/transactions', icon: Clock },
        { label: 'Maintenance Issues', to: '/maintenance', icon: Wrench },
        { label: 'Department Reports', to: '/reports', icon: BarChart3 },
      ];
    }

    // Student Links
    return [
      { label: 'Student Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Browse Resources', to: '/resources', icon: Compass },
      { label: 'My Bookings', to: '/my-bookings', icon: CalendarCheck2 },
      { label: 'Equipment Catalog', to: '/equipment', icon: Package },
      { label: 'Academic Timetable', to: '/schedules', icon: CalendarDays },
      { label: 'College Events', to: '/events', icon: CalendarRange },
    ];
  };

  const navLinks = getLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80 bg-navy-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Campus Connect
              </span>
              <p className="text-[10px] text-brand-300 font-medium uppercase tracking-wider">
                Smart Booking System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Tag */}
        <div className="px-6 py-4 border-b border-slate-800/60 bg-navy-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-brand-400 text-sm">
              {user?.name?.slice(0, 2).toUpperCase() || 'CC'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                  <Shield className="w-2.5 h-2.5 mr-1" />
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          {user?.department && (
            <p className="text-xs text-slate-400 mt-2 truncate">
              Dept: <span className="text-slate-300">{user.department.name}</span>
            </p>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-500 text-white font-semibold shadow-glow'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-0.5'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Campus Info Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-900/40 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Campus Connect College</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Campus Connect v2.0 • Press Ctrl+K</p>
        </div>
      </aside>
    </>
  );
};
