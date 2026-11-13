import React, { useEffect, useState } from 'react';
import { equipmentApi } from '../../api/equipment';
import { departmentsApi } from '../../api/departments';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Equipment, EquipmentTransaction, Department, EquipmentCondition } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Package,
  Plus,
  Search,
  CheckCircle,
  Clock,
  ArrowRight,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

export const EquipmentPage: React.FC = () => {
  const { user, isCoordinator, isSuperAdmin, isStudent } = useAuth();
  const { success, error } = useToast();

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [transactions, setTransactions] = useState<EquipmentTransaction[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'inventory' | 'transactions'>('inventory');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Modals state
  const [borrowItem, setBorrowItem] = useState<Equipment | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eqRes, txRes] = await Promise.all([
        equipmentApi.list({
          search: search || undefined,
          departmentId: selectedDept || undefined,
        }),
        equipmentApi.listTransactions(),
      ]);

      if (eqRes.data) setEquipmentList(eqRes.data);
      if (txRes.data) setTransactions(txRes.data);
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
    fetchData();
  }, [selectedDept]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Borrow Modal Form
  const {
    register: registerBorrow,
    handleSubmit: handleBorrowSubmit,
    reset: resetBorrow,
    formState: { isSubmitting: isBorrowing },
  } = useForm<any>();

  const onBorrowSubmit = async (values: any) => {
    if (!borrowItem) return;
    try {
      await equipmentApi.borrow({
        equipmentId: borrowItem.id,
        quantity: Number(values.quantity || 1),
        expectedReturnDate: new Date(values.expectedReturnDate).toISOString(),
        purpose: values.purpose,
        notes: values.notes,
      });
      success(`Borrow request submitted for ${borrowItem.name}`);
      setBorrowItem(null);
      resetBorrow();
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to submit borrow request');
    }
  };

  // Issue transaction (coordinator action)
  const handleIssue = async (txId: string) => {
    setActionLoadingId(txId);
    try {
      await equipmentApi.issue(txId);
      success('Equipment issued to borrower successfully');
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to issue equipment');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Return transaction (coordinator action)
  const handleReturn = async (txId: string) => {
    const condition = prompt('Condition on return (EXCELLENT, GOOD, FAIR, POOR, DAMAGED):', 'GOOD');
    if (!condition) return;

    setActionLoadingId(txId);
    try {
      await equipmentApi.returnItem(txId, {
        conditionOnReturn: condition as EquipmentCondition,
        status: condition === 'DAMAGED' ? 'DAMAGED_RETURN' : 'RETURNED',
        notes: 'Verified and accepted back into department inventory',
      });
      success('Equipment return recorded and inventory restored!');
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Equipment Form
  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    formState: { isSubmitting: isAdding },
  } = useForm<any>();

  const onAddEquipment = async (values: any) => {
    try {
      await equipmentApi.create({
        ...values,
        quantityOwned: Number(values.quantityOwned),
        quantityAvailable: Number(values.quantityOwned),
      });
      success('Equipment added to department inventory!');
      setIsAddOpen(false);
      resetAdd();
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to register equipment');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laboratory & Department Equipment Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track testing gear, oscilloscopes, development boards, and manage borrow/return workflows.
          </p>
        </div>

        {(isCoordinator || isSuperAdmin) && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddOpen(true)}
          >
            Add Equipment Item
          </Button>
        )}
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Inventory Catalog ({equipmentList.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Loan & Return Records ({transactions.length})
          </button>
        </div>

        {activeTab === 'inventory' && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search equipment, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </form>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content Rendering */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : activeTab === 'inventory' ? (
        /* Equipment Catalog Grid */
        equipmentList.length === 0 ? (
          <EmptyState
            title="No equipment items found"
            description="No lab tools or equipment match your current department filter or query."
            actionText={isCoordinator || isSuperAdmin ? 'Add Equipment' : undefined}
            onAction={() => setIsAddOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentList.map((eq) => (
              <div
                key={eq.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {eq.assetCode}
                    </span>
                    <Badge status={eq.condition} size="sm" />
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{eq.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{eq.description}</p>

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <p>
                      Category: <span className="font-medium text-slate-800">{eq.category}</span>
                    </p>
                    <p>
                      Department: <span className="font-medium text-slate-800">{eq.department?.name}</span>
                    </p>
                    <p>
                      Location: <span className="font-medium text-slate-800">{eq.location}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">Available: </span>
                    <strong
                      className={`font-mono text-sm ${
                        eq.quantityAvailable > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {eq.quantityAvailable} / {eq.quantityOwned}
                    </strong>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={eq.quantityAvailable <= 0}
                    onClick={() => setBorrowItem(eq)}
                  >
                    Borrow Item
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Transactions & Loans Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Asset / Equipment</th>
                  <th className="px-6 py-3.5">Borrower</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Expected Return</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{tx.equipment?.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{tx.equipment?.assetCode}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{tx.user?.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{tx.user?.collegeId}</p>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {tx.quantity} units
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 font-mono">
                        {new Date(tx.expectedReturnDate).toLocaleDateString()}
                      </p>
                      {new Date(tx.expectedReturnDate) < new Date() && tx.status === 'ISSUED' && (
                        <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={tx.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Coordinator Issue Control */}
                        {(isCoordinator || isSuperAdmin) && tx.status === 'REQUESTED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={actionLoadingId === tx.id}
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => handleIssue(tx.id)}
                          >
                            Issue
                          </Button>
                        )}

                        {/* Coordinator Return Control */}
                        {(isCoordinator || isSuperAdmin) && tx.status === 'ISSUED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            isLoading={actionLoadingId === tx.id}
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                            onClick={() => handleReturn(tx.id)}
                          >
                            Process Return
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

      {/* Borrow Request Modal */}
      {borrowItem && (
        <Modal
          isOpen={!!borrowItem}
          onClose={() => setBorrowItem(null)}
          title={`Borrow ${borrowItem.name}`}
          subtitle={`Available in stock: ${borrowItem.quantityAvailable} units`}
          maxWidth="md"
        >
          <form onSubmit={handleBorrowSubmit(onBorrowSubmit)} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Requested Quantity
              </label>
              <input
                type="number"
                min={1}
                max={borrowItem.quantityAvailable}
                defaultValue={1}
                required
                {...registerBorrow('quantity')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Expected Return Date
              </label>
              <input
                type="date"
                required
                min={new Date().toLocaleDateString('en-CA')}
                {...registerBorrow('expectedReturnDate')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Academic Purpose
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Capstone Project experimentation in Room 105"
                {...registerBorrow('purpose')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setBorrowItem(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isBorrowing}>
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Equipment Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Register Equipment Asset"
          subtitle="Add new instruments, laptops, or testing gear to department inventory"
          maxWidth="lg"
        >
          <form onSubmit={handleAddSubmit(onAddEquipment)} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500MHz Digital Oscilloscope"
                  {...registerAdd('name')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Asset Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EQ-COMP-PRJ-99"
                  {...registerAdd('assetCode')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Testing Equipment"
                  {...registerAdd('category')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Department</label>
                <select
                  required
                  {...registerAdd('departmentId')}
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
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Quantity Owned
                </label>
                <input
                  type="number"
                  min={1}
                  defaultValue={1}
                  required
                  {...registerAdd('quantityOwned')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Condition</label>
                <select
                  {...registerAdd('condition')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="Block C, Cabinet 1"
                  {...registerAdd('location')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Serial number, accessories included, technical specifications..."
                {...registerAdd('description')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isAdding}>
                Register Equipment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
