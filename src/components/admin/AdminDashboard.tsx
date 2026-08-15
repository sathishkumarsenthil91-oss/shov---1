import React, { useState } from 'react';
import { StudentManagement } from './StudentManagement';
import { FineManagement } from './FineManagement';
import { AuditLogsView } from './AuditLogsView';
import { HodVpSection } from '../staff/HodVpSection';
import { INITIAL_STUDENTS, INITIAL_FINES, INITIAL_AUDIT_LOGS } from '../../data/mockData';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  Building2, 
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Terminal,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'STUDENTS' | 'FINES' | 'AUDIT_LOGS' | 'HOD_VP'>('OVERVIEW');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>Admin Executive Operations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Institutional Digital Identity, Security Compliance & Fine Governance
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'OVERVIEW'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            System Overview
          </button>

          <button
            onClick={() => setActiveSubTab('STUDENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'STUDENTS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Students & IDs
          </button>

          <button
            onClick={() => setActiveSubTab('FINES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'FINES'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fines & Payments
          </button>

          <button
            onClick={() => setActiveSubTab('AUDIT_LOGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'AUDIT_LOGS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Audit Logs
          </button>

          <button
            onClick={() => setActiveSubTab('HOD_VP')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'HOD_VP'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            HOD & VP Gallery
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-8">
          
          {/* KPI Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Users className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">1,250</p>
              <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +45 new enrollments this month
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Digital IDs</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><ShieldCheck className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">1,180</p>
              <p className="text-[10px] text-slate-400 font-semibold">94.4% Active Compliance</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suspended & Banned</span>
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500"><ShieldAlert className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">25</p>
              <p className="text-[10px] text-rose-400 font-semibold">10 Banned • 15 Suspended</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Fines</span>
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><CreditCard className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">₹85,000</p>
              <p className="text-[10px] text-slate-400 font-semibold">Across 142 overdue items</p>
            </div>

          </div>

          {/* Verification Activity & Status Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Daily Verification Activity Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Today's Scanner Verifications (342 Total)
                </h3>
              </div>

              {/* Bar graph visual */}
              <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
                {[
                  { time: '08:00', count: 120, label: 'Morning Gate Rush' },
                  { time: '10:00', count: 65, label: 'Class Transitions' },
                  { time: '12:00', count: 85, label: 'Cafeteria & Library' },
                  { time: '14:00', count: 42, label: 'Lab Sessions' },
                  { time: '16:00', count: 30, label: 'Evening Exit' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </div>
                    <div
                      style={{ height: `${(item.count / 120) * 100}%` }}
                      className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-blue-700 to-sky-400 group-hover:from-blue-600 group-hover:to-sky-300 transition-all shadow-lg"
                    />
                    <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ID Status Breakdown Bar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Digital ID Registry Compliance Distribution
                </h3>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-500">ACTIVE IDs (1,180)</span>
                    <span className="text-slate-400">94.4%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-400">INACTIVE IDs (35)</span>
                    <span className="text-slate-400">2.8%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full rounded-full" style={{ width: '2.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-500">SUSPENDED / EXPIRED (25)</span>
                    <span className="text-slate-400">2.0%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '2.0%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-500">BANNED IDs (10)</span>
                    <span className="text-slate-400">0.8%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '0.8%' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Audit Stream Highlights */}
          <AuditLogsView />

        </div>
      )}

      {/* SUB-TABS ROUTING */}
      {activeSubTab === 'STUDENTS' && <StudentManagement />}
      {activeSubTab === 'FINES' && <FineManagement />}
      {activeSubTab === 'AUDIT_LOGS' && <AuditLogsView />}
      {activeSubTab === 'HOD_VP' && <HodVpSection />}

    </div>
  );
};
