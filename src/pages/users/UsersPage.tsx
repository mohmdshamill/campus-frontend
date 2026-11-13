import React, { useEffect, useState } from 'react';
import { usersApi } from '../../api/users';
import { departmentsApi } from '../../api/departments';
import { useToast } from '../../context/ToastContext';
import { User, Department, Role } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users as UsersIcon,
  Search,
  Shield,
  Edit,
  CheckCircle,
  XCircle,
  GraduationCap,
  Building2,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

export const UsersPage: React.FC = () => {
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({
        search: search || undefined,
        role: (selectedRole as Role) || undefined,
      });
      if (res.data) setUsers(res.data);
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
    fetchUsers();
  }, [selectedRole]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  // Add User Form (super admin only)
  const {
    register: regAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    watch: watchAdd,
    formState: { isSubmitting: isAdding },
  } = useForm<any>({ defaultValues: { role: 'STUDENT' } });
  const addRole = watchAdd('role');

  const onAddUser = async (values: any) => {
    try {
      await usersApi.create({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role as Role,
        collegeId: values.collegeId || null,
        phone: values.phone || null,
        departmentId: values.role === 'SUPER_ADMIN' ? null : values.departmentId || null,
      });
      success('User created successfully');
      setIsAddOpen(false);
      resetAdd({ role: 'STUDENT' });
      fetchUsers();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Edit User Form
  const {
    register: regEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { isSubmitting: isUpdating },
  } = useForm<any>();

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditValue('role', u.role);
    setEditValue('departmentId', u.departmentId || '');
    setEditValue('isActive', String(u.isActive));
  };

  const onUpdateUser = async (values: any) => {
    if (!editingUser) return;
    try {
      await usersApi.update(editingUser.id, {
        role: values.role as Role,
        departmentId: values.departmentId || null,
        isActive: values.isActive === 'true',
      });
      success(`User account updated successfully`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student registrations, assign department coordinators, and control institutional access.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => {
            resetAdd({ role: 'STUDENT' });
            setShowPw(false);
            setIsAddOpen(true);
          }}
        >
          Add User
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, roll ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </form>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {[
            { label: 'All Users', val: '' },
            { label: 'Super Admins', val: 'SUPER_ADMIN' },
            { label: 'Coordinators', val: 'COORDINATOR' },
            { label: 'Students', val: 'STUDENT' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setSelectedRole(tab.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRole === tab.val
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try modifying your search or role filter."
          actionText="Reset Filter"
          onAction={() => {
            setSearch('');
            setSelectedRole('');
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">College ID</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wide">
                        <Shield className="w-3 h-3 text-brand-600" />
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono font-semibold text-slate-600">
                      {u.collegeId || '-'}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {u.department?.name ? (
                        <span>
                          {u.department.name} ({u.department.code})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Central</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                        onClick={() => openEditModal(u)}
                      >
                        Edit Access
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New User"
          subtitle="Create a student, coordinator or super admin account"
          maxWidth="md"
        >
          <form onSubmit={handleAddSubmit(onAddUser)} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input type="text" required minLength={2} placeholder="e.g. Rohan Verma" {...regAdd('name')} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
              <input type="email" required placeholder="name@campusconnect.edu" {...regAdd('email')} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  {...regAdd('password')}
                  className="w-full px-3 pr-10 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">College ID (optional)</label>
              <input type="text" placeholder="e.g. STU-BCA-010" {...regAdd('collegeId')} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Phone (optional)</label>
              <input type="text" placeholder="+91 ..." {...regAdd('phone')} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
            </div>

            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Role</label>
              <select {...regAdd('role')} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500">
                <option value="STUDENT">Student</option>
                <option value="COORDINATOR">Department Coordinator</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            {addRole !== 'SUPER_ADMIN' && (
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Department</label>
              <select required {...regAdd('departmentId')} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isAdding}>
                Create User
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit Permissions: ${editingUser.name}`}
          subtitle={`Email: ${editingUser.email}`}
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit(onUpdateUser)} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Role</label>
              <select
                {...regEdit('role')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="STUDENT">Student</option>
                <option value="COORDINATOR">Department Coordinator</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Department Assignment
              </label>
              <select
                {...regEdit('departmentId')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">No Department / Central Staff</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Account Active Status
              </label>
              <select
                {...regEdit('isActive')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="true">Active (Access Allowed)</option>
                <option value="false">Disabled (Deactivated)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
