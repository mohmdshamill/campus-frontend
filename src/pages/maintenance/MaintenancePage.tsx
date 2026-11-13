import React, { useEffect, useState } from 'react';
import { maintenanceApi } from '../../api/maintenance';
import { resourcesApi } from '../../api/resources';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MaintenanceRecord, Resource, MaintenanceStatus, Priority } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

export const MaintenancePage: React.FC = () => {
  const { user, isCoordinator, isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await maintenanceApi.list({
        status: (statusFilter as MaintenanceStatus) || undefined,
      });
      if (res.data) setRecords(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    resourcesApi.list({ isActive: 'true', limit: 200 }).then((res) => {
      if (!res.data) return;
      // Coordinators: only their own department's rooms + the main campus areas
      const MAIN_AREAS = ['AUDITORIUM', 'SEMINAR_HALL', 'MEETING_ROOM'];
      setResources(
        isCoordinator
          ? res.data.filter((r) => r.departmentId === user?.departmentId || MAIN_AREAS.includes(r.type))
          : res.data
      );
    });
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [statusFilter]);

  const handleResolve = async (id: string) => {
    const notes = prompt('Enter resolution summary / technician notes:');
    if (!notes) return;

    try {
      await maintenanceApi.update(id, {
        status: 'RESOLVED',
        resolutionNotes: notes,
      });
      success('Maintenance marked as RESOLVED! Resource operational status restored.');
      fetchRecords();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update maintenance record');
    }
  };

  const handleInspect = async (id: string) => {
    try {
      const res = await maintenanceApi.get(id);
      if (res.data) setSelectedRecord(res.data);
    } catch {
      // ignore
    }
  };

  const {
    register: registerReport,
    handleSubmit: handleReportSubmit,
    reset: resetReport,
    formState: { isSubmitting: isReporting },
  } = useForm<any>();

  const onReportSubmit = async (values: any) => {
    try {
      const res = await maintenanceApi.create({
        resourceId: values.resourceId,
        title: values.title,
        description: values.description,
        priority: values.priority,
        blockResource: values.blockResource === 'true' || values.blockResource === true,
      });

      const count = res.data?.affectedBookings?.length || 0;
      success(
        `Maintenance logged successfully! ${
          count > 0 ? `Alerted ${count} conflicting booking holder(s).` : ''
        }`
      );
      setIsReportOpen(false);
      resetReport();
      fetchRecords();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to log maintenance');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Facility Maintenance & Issue Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log equipment faults, temporarily block facilities, and resolve affected student reservations.
          </p>
        </div>

        {(isCoordinator || isSuperAdmin) && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsReportOpen(true)}
          >
            Report Issue / Maintenance
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {[
          { label: 'All Tickets', val: '' },
          { label: 'Reported', val: 'REPORTED' },
          { label: 'In Progress', val: 'IN_PROGRESS' },
          { label: 'Resolved', val: 'RESOLVED' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setStatusFilter(tab.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.val
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Records Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : records.length === 0 ? (
        <EmptyState
          title="No maintenance records found"
          description="All facilities are operational with no open maintenance tickets."
          actionText={isCoordinator || isSuperAdmin ? 'Log Maintenance' : undefined}
          onAction={() => setIsReportOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Title & Resource</th>
                  <th className="px-6 py-3.5">Reported By</th>
                  <th className="px-6 py-3.5">Scheduled Window</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{r.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Facility: <strong className="text-slate-700">{r.resource.name}</strong> ({r.resource.code})
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{r.reportedBy?.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{r.reportedBy?.email}</p>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <p className="text-slate-800 font-semibold">
                        {new Date(r.startDateTime).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-slate-500">Reported</p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.priority === 'URGENT' || r.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={r.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInspect(r.id)}
                        >
                          Inspect
                        </Button>

                        {isSuperAdmin && r.status !== 'RESOLVED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                            onClick={() => handleResolve(r.id)}
                          >
                            Resolve
                          </Button>
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

      {/* Inspect Affected Bookings Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Maintenance: ${selectedRecord.title}`}
          subtitle={`Resource: ${selectedRecord.resource?.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-700">Description</p>
              <p className="text-slate-600 leading-relaxed">{selectedRecord.description}</p>
              {selectedRecord.resolutionNotes && (
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <p className="font-bold text-emerald-800">Resolution Notes</p>
                  <p className="text-emerald-700">{selectedRecord.resolutionNotes}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Affected Reservations During Window ({selectedRecord.affectedBookings?.length || 0})
              </h4>

              {selectedRecord.affectedBookings?.length === 0 ? (
                <p className="text-slate-400 py-2">No student bookings conflicted with this window.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedRecord.affectedBookings.map((b: any) => (
                    <div key={b.id} className="p-3 bg-white flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{b.bookingCode} - {b.purpose}</p>
                        <p className="text-slate-500">
                          By {b.user?.name} ({b.user?.collegeId}) • {new Date(b.startDateTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge status={b.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Maintenance Modal */}
      {isReportOpen && (
        <Modal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          title="Log Maintenance or Facility Fault"
          subtitle="Block availability and notify any overlapping reservations"
          maxWidth="lg"
        >
          <form onSubmit={handleReportSubmit(onReportSubmit)} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Facility / Resource
              </label>
              <select
                required
                {...registerReport('resourceId')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Array.from(new Set(resources.map((r) => r.department?.name || 'Other'))).map((dept) => (
                  <optgroup key={dept} label={dept}>
                    {resources
                      .filter((r) => (r.department?.name || 'Other') === dept)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.code})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Issue Title</label>
              <input
                type="text"
                required
                placeholder="e.g. AC cooling unit failure / Projector lamp replacement"
                {...registerReport('title')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Priority</label>
                <select
                  {...registerReport('priority')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Block Resource
                </label>
                <select
                  {...registerReport('blockResource')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="true">Yes, mark Under Maintenance</option>
                  <option value="false">No, partial maintenance only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Description / Diagnostic Notes
              </label>
              <textarea
                rows={2}
                required
                placeholder="Details of the fault, work order number, or repair agency"
                {...registerReport('description')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsReportOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isReporting}>
                Log Maintenance
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
