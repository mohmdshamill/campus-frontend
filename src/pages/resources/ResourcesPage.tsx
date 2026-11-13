import { formatOperatingHours } from '../../utils/time';
import React, { useEffect, useState } from 'react';
import { resourcesApi } from '../../api/resources';
import { departmentsApi } from '../../api/departments';
import { TimeInput24 } from '../../components/common/TimeInput24';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Resource, Department, ResourceType } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { BookingModal } from '../../components/booking/BookingModal';
import {
  Search,
  Plus,
  Filter,
  MapPin,
  Users,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
  Calendar,
  Layers,
  Building2,
  Trash2,
  Edit,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';

export const ResourcesPage: React.FC = () => {
  const { isCoordinator, isSuperAdmin, user } = useAuth();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [resources, setResources] = useState<Resource[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('departmentId') || '');
  const [selectedType, setSelectedType] = useState<string>('');

  // Modals state
  const [bookingResource, setBookingResource] = useState<Resource | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourcesApi.list({
        search: search || undefined,
        departmentId: selectedDept || undefined,
        type: (selectedType as ResourceType) || undefined,
      });
      if (res.data) setResources(res.data);
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
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedDept, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleDeleteOrDeactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate or remove ${name}?`)) return;

    try {
      const res = await resourcesApi.delete(id);
      success(res.message || 'Resource updated successfully');
      fetchResources();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update resource');
    }
  };

  // Create Resource Form
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    control: controlCreate,
    formState: { isSubmitting: isCreating },
  } = useForm<any>();

  const closeForm = () => {
    setIsCreateOpen(false);
    setEditingResource(null);
  };

  const openEdit = (res: Resource) => {
    setEditingResource(res);
    resetCreate({
      name: res.name,
      code: res.code,
      type: res.type,
      departmentId: res.departmentId,
      building: res.building,
      roomNumber: res.roomNumber,
      floor: res.floor || '',
      capacity: res.capacity,
      facilities: res.facilities || '',
      operatingHoursStart: res.operatingHoursStart,
      operatingHoursEnd: res.operatingHoursEnd,
      requiresApproval: String(res.requiresApproval),
    });
    setIsCreateOpen(true);
  };

  const openCreate = () => {
    setEditingResource(null);
    resetCreate({ operatingHoursStart: '08:30', operatingHoursEnd: '16:30', requiresApproval: 'true' });
    setIsCreateOpen(true);
  };

  const onCreateResource = async (values: any) => {
    try {
      const payload = {
        ...values,
        capacity: Number(values.capacity),
        requiresApproval: true,
      };
      if (editingResource) {
        await resourcesApi.update(editingResource.id, payload);
        success('Resource updated successfully!');
        closeForm();
        fetchResources();
        return;
      }
      await resourcesApi.create({
        ...values,
        capacity: Number(values.capacity),
        minBookingMinutes: Number(values.minBookingMinutes || 30),
        maxBookingMinutes: Number(values.maxBookingMinutes || 240),
        minAdvanceDays: Number(values.minAdvanceDays || 0),
        maxAdvanceDays: Number(values.maxAdvanceDays || 14),
        requiresApproval: true,
      });
      success('Resource added successfully!');
      closeForm();
      resetCreate();
      fetchResources();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create resource');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Facilities & Resources
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse classrooms, laboratories, auditoriums, and schedule reservations.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreate}
          >
            Add New Resource
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, room, building..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
          />
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">All Resource Types</option>
            <option value="CLASSROOM">Classroom</option>
            <option value="COMPUTER_LAB">Computer Lab</option>
            <option value="SCIENCE_LAB">Science Lab</option>
            <option value="SEMINAR_HALL">Seminar Hall</option>
            <option value="AUDITORIUM">Auditorium</option>
            <option value="MEETING_ROOM">Meeting Room</option>
          </select>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'table' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          description="Try broadening your search term or changing the department filter."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedDept('');
            setSelectedType('');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 uppercase tracking-wide">
                      {res.type.replace('_', ' ')}
                    </span>
                    <Badge status={res.maintenanceStatus} size="sm" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{res.code}</span>
                </div>

                <div>
                  <Link
                    to={`/resources/${res.id}`}
                    className="font-bold text-base text-slate-900 hover:text-brand-600 transition-colors line-clamp-1"
                  >
                    {res.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{res.description}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {res.building} • Room {res.roomNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Capacity: {res.capacity} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Hours: {formatOperatingHours(res)}</span>
                  </div>
                </div>

                {res.facilities && (
                  <p className="text-[11px] text-slate-400 truncate pt-1 border-t border-slate-100">
                    Facilities: {res.facilities}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/resources/${res.id}`}
                  className="text-xs font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" /> View Schedule
                </Link>

                <div className="flex items-center gap-2">
                  {(isCoordinator || isSuperAdmin) && (
                    <button
                      onClick={() => openEdit(res)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                      title="Edit Resource"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {(isCoordinator || isSuperAdmin) && (
                    <button
                      onClick={() => handleDeleteOrDeactivate(res.id, res.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Deactivate or Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!res.isActive || res.maintenanceStatus === 'UNDER_MAINTENANCE'}
                    onClick={() => setBookingResource(res)}
                  >
                    Reserve Slot
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Code / Name</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Capacity</th>
                <th className="px-6 py-3.5">Operating Hours</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resources.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      to={`/resources/${res.id}`}
                      className="font-bold text-slate-900 hover:text-brand-600 block text-sm"
                    >
                      {res.name}
                    </Link>
                    <span className="font-mono text-slate-400 text-[11px]">{res.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {res.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {res.building}, {res.roomNumber}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{res.capacity} seats</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">
                    {formatOperatingHours(res)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={res.maintenanceStatus} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(isCoordinator || isSuperAdmin) && (
                        <Button variant="outline" size="sm" onClick={() => openEdit(res)}>
                          Edit
                        </Button>
                      )}
                      <Link to={`/resources/${res.id}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!res.isActive || res.maintenanceStatus === 'UNDER_MAINTENANCE'}
                        onClick={() => setBookingResource(res)}
                      >
                        Book
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Dialog */}
      {bookingResource && (
        <BookingModal
          isOpen={!!bookingResource}
          onClose={() => setBookingResource(null)}
          resource={bookingResource}
          onSuccess={fetchResources}
        />
      )}

      {/* Add Resource Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={closeForm}
          title={editingResource ? 'Edit Resource' : 'Add New College Resource'}
          subtitle={editingResource ? editingResource.name : 'Register a classroom, lab, auditorium, or seminar facility'}
          maxWidth="xl"
        >
          <form onSubmit={handleCreateSubmit(onCreateResource)} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Resource Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Robotics Lab"
                  {...registerCreate('name')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Unique Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAB-ROB-01"
                  {...registerCreate('code')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Resource Type
                </label>
                <select
                  required
                  {...registerCreate('type')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="CLASSROOM">Classroom</option>
                  <option value="COMPUTER_LAB">Computer Laboratory</option>
                  <option value="SCIENCE_LAB">Science / Chemistry Lab</option>
                  <option value="SEMINAR_HALL">Seminar Hall</option>
                  <option value="AUDITORIUM">Auditorium</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="PROJECTOR">Projector / Mobile Gear</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Department
                </label>
                <select
                  required
                  {...registerCreate('departmentId')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Building</label>
                <input
                  type="text"
                  required
                  placeholder="Block B"
                  {...registerCreate('building')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Room No</label>
                <input
                  type="text"
                  required
                  placeholder="B-201"
                  {...registerCreate('roomNumber')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="60"
                  {...registerCreate('capacity')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Operating Start
                </label>
                <Controller name="operatingHoursStart" control={controlCreate} render={({ field }) => <TimeInput24 value={field.value || '08:30'} onChange={field.onChange} />} />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Operating End
                </label>
                <Controller name="operatingHoursEnd" control={controlCreate} render={({ field }) => <TimeInput24 value={field.value || '16:30'} onChange={field.onChange} />} />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Facilities</label>
              <input
                type="text"
                placeholder="e.g. Smart Board, 4K Projector, Central AC, High-speed LAN"
                {...registerCreate('facilities')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreating}>
                {editingResource ? 'Update Resource' : 'Save Resource'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
