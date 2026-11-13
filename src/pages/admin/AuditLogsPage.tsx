import React, { useEffect, useState } from 'react';
import { auditApi } from '../../api/audit';
import { AuditLog } from '../../types';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { FileText, Shield, Clock, Search, Filter } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.list({ action: actionFilter || undefined });
      if (res.data) setLogs(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable security and activity audit records across Campus Connect.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase">Filter Action:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
          >
            <option value="">All Audit Actions</option>
            <option value="CREATE_BOOKING">CREATE_BOOKING</option>
            <option value="APPROVE_BOOKING">APPROVE_BOOKING</option>
            <option value="REJECT_BOOKING">REJECT_BOOKING</option>
            <option value="CANCEL_BOOKING">CANCEL_BOOKING</option>
            <option value="CREATE_RESOURCE">CREATE_RESOURCE</option>
            <option value="UPDATE_RESOURCE">UPDATE_RESOURCE</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="USER_REGISTER">USER_REGISTER</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description="There are currently no recorded events matching your query."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Actor</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{log.user?.name || log.userEmail || 'System'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{log.userEmail}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {log.entityType} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ''}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500 font-mono text-[11px]">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
