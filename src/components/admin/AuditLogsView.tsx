import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { INITIAL_AUDIT_LOGS } from '../../data/mockData';
import { fetchAuditLogsApi } from '../../services/api';
import { ShieldAlert, Search, Terminal } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    const data = await fetchAuditLogsApi();
    if (data.length > 0) {
      setLogs(data);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-purple-500" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Immutable System Security Audit Trail
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recording every administrative status override, fine modification, and security event
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-medium font-mono">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
              <th className="pb-3">Timestamp</th>
              <th className="pb-3">Admin / User</th>
              <th className="pb-3">Action Type</th>
              <th className="pb-3">Target Entity</th>
              <th className="pb-3">Change Transition</th>
              <th className="pb-3">Mandatory Reason</th>
              <th className="pb-3 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 text-slate-400">{log.createdAt}</td>
                <td className="py-3">
                  <span className="font-bold text-slate-900 dark:text-white block">{log.userName}</span>
                  <span className="text-[10px] text-purple-400 font-sans font-semibold">{log.userRole}</span>
                </td>
                <td className="py-3 font-bold text-blue-500">{log.action}</td>
                <td className="py-3 text-slate-300">{log.entityType} ({log.entityId})</td>
                <td className="py-3">
                  {log.oldValue && <span className="text-rose-400 font-bold">{log.oldValue} → </span>}
                  <span className="text-emerald-400 font-bold">{log.newValue}</span>
                </td>
                <td className="py-3 text-slate-400 font-sans font-medium max-w-xs">{log.reason || 'N/A'}</td>
                <td className="py-3 text-right text-slate-500">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
