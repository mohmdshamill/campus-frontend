import React, { useEffect, useState } from 'react';
import { departmentsApi } from '../../api/departments';
import { usersApi } from '../../api/users';
import { useToast } from '../../context/ToastContext';
import { Department, User } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Building2,
  Plus,
  Users,
  Layers,
  Package,
  UserPlus,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

export const DepartmentsPage: React.FC = () => {
  const { success, error } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [assignDept, setAssignDept] = useState<Department | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentsApi.list();
      if (res.data) setDepartments(res.data);

      const userRes = await usersApi.list({ limit: 100 });
      if (userRes.data) setUsers(userRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Add Department Form
  const {
    register: regDept,
    handleSubmit: handleDeptSubmit,
    reset: resetDept,
    formState: { isSubmitting: isAddingDept },
  } = useForm<any>();

  const onAddDepartment = async (values: any) => {
    try {
      await departmentsApi.create(values);
      success('Department created successfully!');
      setIsAddDeptOpen(false);
      resetDept();
      fetchDepartments();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create department');
    }
  };

  // Assign Coordinator Form
  const {
    register: regAssign,
    handleSubmit: handleAssignSubmit,
    reset: resetAssign,
    formState: { isSubmitting: isAssigning },
  } = useForm<any>();

  const onAssignCoordinator = async (values: any) => {
    if (!assignDept) return;
    try {
      await departmentsApi.assignCoordinator(assignDept.id, values);
      success(`Coordinator assigned to ${assignDept.name}`);
      setAssignDept(null);
      resetAssign();
      fetchDepartments();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to assign coordinator');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Departments Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create college departments, allocate coordinators, and inspect departmental resource totals.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddDeptOpen(true)}
        >
          Add Department
        </Button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-lg">
                    {dept.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle className="w-3.5 h-3.5" /> Active Department
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{dept.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{dept.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Resources</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {dept._count?.resources || 0}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Equipment</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {dept._count?.equipment || 0}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Users</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {dept._count?.users || 0}
                    </p>
                  </div>
                </div>

                {/* Coordinators */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Assigned Coordinators:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.members && dept.members.length > 0 ? (
                      dept.members.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                        >
                          {m.user?.name} ({m.roleInDept})
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No coordinators assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  onClick={() => setAssignDept(dept)}
                >
                  Assign Coordinator
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      {isAddDeptOpen && (
        <Modal
          isOpen={isAddDeptOpen}
          onClose={() => setIsAddDeptOpen(false)}
          title="Create Academic Department"
          subtitle="Add a computer, commerce, science or arts division"
          maxWidth="md"
        >
          <form onSubmit={handleDeptSubmit(onAddDepartment)} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Department Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Department of Physics"
                {...regDept('name')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Department Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PHY"
                {...regDept('code')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Overview of research facilities, labs, and programs"
                {...regDept('description')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddDeptOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isAddingDept}>
                Create Department
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Coordinator Modal */}
      {assignDept && (
        <Modal
          isOpen={!!assignDept}
          onClose={() => setAssignDept(null)}
          title={`Assign Coordinator to ${assignDept.name}`}
          subtitle="Grant facility management and booking approval rights"
          maxWidth="md"
        >
          <form onSubmit={handleAssignSubmit(onAssignCoordinator)} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Select User</label>
              <select
                required
                {...regAssign('userId')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select a registered user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - {u.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Role in Department
              </label>
              <input
                type="text"
                defaultValue="HEAD_COORDINATOR"
                {...regAssign('roleInDept')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setAssignDept(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isAssigning}>
                Assign Coordinator
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
