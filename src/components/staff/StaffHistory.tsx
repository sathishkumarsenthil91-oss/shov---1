import React, { useEffect, useState } from 'react';
import { VerificationLog } from '../../types';
import { INITIAL_VERIFICATION_LOGS } from '../../data/mockData';
import { fetchVerificationLogsApi } from '../../services/api';
import { ImageLightbox } from '../common/ImageLightbox';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Clock, 
  MapPin, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  AlertOctagon, 
  RotateCcw, 
  Filter, 
  UserCheck, 
  FileText, 
  Eye, 
  Maximize2,
  X,
  Building2,
  User,
  Zap,
  Download,
  Camera
} from 'lucide-react';

export const StaffHistory: React.FC = () => {
  const [logs, setLogs] = useState<VerificationLog[]>(INITIAL_VERIFICATION_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'DENIED' | 'LATE' | 'EXPIRED' | 'INVALID_TOKEN'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VerificationLog | null>(null);

  // Lightbox State
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    photoUrl: string;
    title: string;
    subtitle?: string;
    badge?: string;
    status?: string;
    details?: { label: string; value: string }[];
  }>({
    isOpen: false,
    photoUrl: '',
    title: ''
  });

  const loadLogs = async () => {
    setIsLoading(true);
    const serverLogs = await fetchVerificationLogsApi();
    if (serverLogs && serverLogs.length > 0) {
      setLogs(serverLogs);
    } else {
      setLogs(INITIAL_VERIFICATION_LOGS);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Helper to get normalized scan category
  const getScanCategory = (log: VerificationLog): 'SUCCESS' | 'DENIED' | 'LATE' | 'EXPIRED' | 'INVALID_TOKEN' => {
    const st = (log.scanStatus || log.result || '').toUpperCase();
    if (st === 'SUCCESS' || st === 'ACTIVE' || st === 'GRANTED') return 'SUCCESS';
    if (st === 'LATE') return 'LATE';
    if (st === 'EXPIRED') return 'EXPIRED';
    if (st === 'INVALID_TOKEN' || st === 'UNRECOGNIZED') return 'INVALID_TOKEN';
    if (st === 'DENIED' || st === 'SUSPENDED' || st === 'BANNED' || st === 'INACTIVE') return 'DENIED';
    return 'DENIED';
  };

  // Helper to resolve badge visual properties
  const getBadgeConfig = (log: VerificationLog) => {
    const category = getScanCategory(log);
    const rawResult = (log.scanStatus || log.result || '').toUpperCase();

    switch (category) {
      case 'SUCCESS':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 ring-emerald-500/20',
          label: 'Success',
          subtext: 'Authorized Entry',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        };
      case 'LATE':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 ring-amber-500/20',
          label: 'Late Entry',
          subtext: 'Flagged Post-Curfew',
          icon: <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        };
      case 'EXPIRED':
        return {
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 ring-purple-500/20',
          label: 'Expired ID',
          subtext: 'Renewal Required',
          icon: <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
        };
      case 'INVALID_TOKEN':
        return {
          bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 ring-red-500/20',
          label: 'Invalid QR',
          subtext: 'Unrecognized Token',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-red-500 shrink-0" />
        };
      case 'DENIED':
      default:
        let specificLabel = 'Denied';
        if (rawResult === 'SUSPENDED') specificLabel = 'Denied (Suspended)';
        else if (rawResult === 'BANNED') specificLabel = 'Denied (Banned)';
        else if (rawResult === 'INACTIVE') specificLabel = 'Denied (Inactive)';

        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 ring-rose-500/20',
          label: specificLabel,
          subtext: 'Access Restricted',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        };
    }
  };

  // Filter calculations
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      if (statusFilter === 'ALL') return true;
      return getScanCategory(log) === statusFilter;
    }

    const matchesSearch = 
      log.studentName.toLowerCase().includes(term) ||
      log.registerNumber.toLowerCase().includes(term) ||
      (log.studentId && log.studentId.toLowerCase().includes(term)) ||
      log.id.toLowerCase().includes(term) ||
      log.location.toLowerCase().includes(term) ||
      log.departmentName.toLowerCase().includes(term) ||
      (log.verifierName && log.verifierName.toLowerCase().includes(term)) ||
      (log.notes && log.notes.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    return getScanCategory(log) === statusFilter;
  });

  // KPI stats
  const totalScans = logs.length;
  const successCount = logs.filter(l => getScanCategory(l) === 'SUCCESS').length;
  const deniedCount = logs.filter(l => getScanCategory(l) === 'DENIED').length;
  const lateCount = logs.filter(l => getScanCategory(l) === 'LATE').length;
  const expiredCount = logs.filter(l => getScanCategory(l) === 'EXPIRED' || getScanCategory(l) === 'INVALID_TOKEN').length;

  const openLightbox = (log: VerificationLog, customPhotoUrl?: string, customSubtitle?: string) => {
    const photoToDisplay = customPhotoUrl || log.capturedThumbnailUrl || log.photoUrl;
    if (!photoToDisplay) return;
    const badgeConfig = getBadgeConfig(log);
    setLightboxData({
      isOpen: true,
      photoUrl: photoToDisplay,
      title: log.studentName,
      subtitle: customSubtitle || `REG: ${log.registerNumber} | LOG ID: ${log.id}`,
      badge: log.departmentName,
      status: badgeConfig.label,
      details: [
        { label: 'Gate Location', value: log.location },
        { label: 'Scan Timestamp', value: log.timestamp },
        { label: 'Verifier Officer', value: log.verifierName },
        { label: 'Scan Event Result', value: log.result },
        { label: 'Live Thumbnail Attached', value: log.capturedThumbnailUrl ? 'Yes (Instant Capture)' : 'No (Default Photo)' }
      ]
    });
  };

  const handleDownloadCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'Log ID',
      'Scan Timestamp',
      'Student Name',
      'Register Number',
      'Student ID',
      'Department',
      'Gate Location',
      'Verifier Officer',
      'Scan Outcome',
      'Raw Status',
      'Remarks / Notes'
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id || ''}"`,
      `"${log.timestamp || log.scannedAt || ''}"`,
      `"${(log.studentName || '').replace(/"/g, '""')}"`,
      `"${log.registerNumber || ''}"`,
      `"${log.studentId || ''}"`,
      `"${(log.departmentName || '').replace(/"/g, '""')}"`,
      `"${(log.location || '').replace(/"/g, '""')}"`,
      `"${(log.verifierName || '').replace(/"/g, '""')}"`,
      `"${getScanCategory(log)}"`,
      `"${log.scanStatus || log.result || ''}"`,
      `"${(log.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `shov-scan-audit-logs-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Lightbox Inspector */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
        photoUrl={lightboxData.photoUrl}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        badge={lightboxData.badge}
        status={lightboxData.status}
        details={lightboxData.details}
      />

      {/* Title Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Gatehouse Scan Audit Log
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Live Audit Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time verification history & color-coded entry outcome tracking
          </p>
        </div>

        {/* Search & Refresh Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or ID (e.g. Marcus, 21CS101)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="Refresh Scan Audit Logs"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={filteredLogs.length === 0}
            className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-md shadow-emerald-600/20"
            title="Download Filtered CSV Records"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download CSV</span>
            <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.2 rounded-full ml-0.5 font-mono">
              {filteredLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Status KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        {/* ALL */}
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'ALL' ? 'text-blue-100' : 'text-slate-400'}`}>
              Total Scans
            </span>
            <FileText className={`w-4 h-4 ${statusFilter === 'ALL' ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <p className="text-xl font-black mt-1">{totalScans}</p>
        </button>

        {/* SUCCESS */}
        <button
          onClick={() => setStatusFilter('SUCCESS')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'SUCCESS'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'SUCCESS' ? 'text-emerald-100' : 'text-emerald-500'}`}>
              Success
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'SUCCESS' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <p className={`text-xl font-black mt-1 ${statusFilter === 'SUCCESS' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {successCount}
          </p>
        </button>

        {/* DENIED */}
        <button
          onClick={() => setStatusFilter('DENIED')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'DENIED'
              ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'DENIED' ? 'text-rose-100' : 'text-rose-500'}`}>
              Denied
            </span>
            <XCircle className={`w-4 h-4 ${statusFilter === 'DENIED' ? 'text-white' : 'text-rose-500'}`} />
          </div>
          <p className={`text-xl font-black mt-1 ${statusFilter === 'DENIED' ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`}>
            {deniedCount}
          </p>
        </button>

        {/* LATE */}
        <button
          onClick={() => setStatusFilter('LATE')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'LATE'
              ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'LATE' ? 'text-amber-100' : 'text-amber-500'}`}>
              Late
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === 'LATE' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <p className={`text-xl font-black mt-1 ${statusFilter === 'LATE' ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`}>
            {lateCount}
          </p>
        </button>

        {/* EXPIRED & INVALID */}
        <button
          onClick={() => setStatusFilter('EXPIRED')}
          className={`p-4 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 cursor-pointer ${
            statusFilter === 'EXPIRED'
              ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'EXPIRED' ? 'text-purple-100' : 'text-purple-500'}`}>
              Expired / Invalid
            </span>
            <AlertOctagon className={`w-4 h-4 ${statusFilter === 'EXPIRED' ? 'text-white' : 'text-purple-500'}`} />
          </div>
          <p className={`text-xl font-black mt-1 ${statusFilter === 'EXPIRED' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>
            {expiredCount}
          </p>
        </button>

      </div>

      {/* Log Table Container */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        
        {/* Active Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Filters:
            </span>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
              {statusFilter === 'ALL' ? 'All Statuses' : `Status: ${statusFilter}`}
            </span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Search className="w-3 h-3" />
                <span>Search: "{searchTerm}"</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-amber-700 dark:hover:text-amber-200 cursor-pointer"
                  title="Remove search query"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(searchTerm || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-blue-500 underline ml-1 cursor-pointer"
              >
                Reset all
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Showing {filteredLogs.length} of {logs.length} scan records
            </span>
            <button
              onClick={handleDownloadCSV}
              disabled={filteredLogs.length === 0}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              title="Export Current View as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-extrabold tracking-wider">
                <th className="pb-3 min-w-[140px]">Scan Timestamp</th>
                <th className="pb-3 min-w-[180px]">Student / ID</th>
                <th className="pb-3 min-w-[150px]">Department</th>
                <th className="pb-3 min-w-[160px]">Gate Location</th>
                <th className="pb-3 min-w-[130px]">Verifier Officer</th>
                <th className="pb-3 min-w-[160px]">Status Badge</th>
                <th className="pb-3 text-right">Inspect</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-bold text-xs text-slate-700 dark:text-slate-200">
                      No scan records match "{searchTerm || statusFilter}"
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Try searching with another student name (e.g., "Marcus", "Kavya") or ID (e.g., "21CS101", "st-001").
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('ALL');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Clear Search & Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badgeConfig = getBadgeConfig(log);

                  return (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="py-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* Student Info & Scan Snapshot */}
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0 flex items-center">
                            {log.photoUrl ? (
                              <button 
                                onClick={() => openLightbox(log, log.photoUrl, 'Official Registered ID Photo')}
                                className="relative cursor-pointer shrink-0"
                                title="Inspect Official ID Photo"
                              >
                                <img 
                                  src={log.photoUrl} 
                                  alt={log.studentName} 
                                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-blue-500 transition-all shadow-sm" 
                                />
                              </button>
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-slate-400" />
                              </div>
                            )}

                            {/* Live Scanned Thumbnail at moment of scan */}
                            {log.capturedThumbnailUrl && log.capturedThumbnailUrl !== log.photoUrl && (
                              <button
                                onClick={() => openLightbox(log, log.capturedThumbnailUrl!, 'Live Optical Scan Snapshot')}
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-md overflow-hidden ring-1 ring-cyan-500 hover:scale-125 transition-transform cursor-pointer shadow-md bg-slate-950"
                                title="Click to view Live Scan Thumbnail captured at moment of verification"
                              >
                                <img
                                  src={log.capturedThumbnailUrl}
                                  alt="Live Scan Snapshot"
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            )}
                          </div>

                          <div>
                            <span className="font-bold block text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {log.studentName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                                {log.registerNumber}
                              </span>
                              {log.capturedThumbnailUrl && log.capturedThumbnailUrl !== log.photoUrl && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-500 text-[8px] font-mono font-bold">
                                  <Camera className="w-2.5 h-2.5" /> LIVE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        <span className="truncate max-w-[140px] block font-medium">
                          {log.departmentName}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{log.location}</span>
                        </div>
                      </td>

                      {/* Verifier */}
                      <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {log.verifierName || 'Security Gatehouse'}
                      </td>

                      {/* COLOR-CODED STATUS BADGE */}
                      <td className="py-3">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ring-1 ${badgeConfig.bg}`}>
                            {badgeConfig.icon}
                            <span>{badgeConfig.label}</span>
                          </span>
                          {log.notes && (
                            <span className="text-[9px] text-slate-400 truncate max-w-[150px] pl-1 font-mono">
                              {log.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED SCAN LOG INSPECTION MODAL */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Scan Telemetry Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Outcome Banner */}
              {(() => {
                const badge = getBadgeConfig(selectedLog);
                return (
                  <div className={`p-4 rounded-2xl border ${badge.bg} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      {badge.icon}
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block">
                          Outcome: {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {badge.subtext}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold uppercase">
                      RESULT: {selectedLog.result}
                    </span>
                  </div>
                );
              })()}

              {/* Student & Event Details */}
              <div className="space-y-3 text-xs">
                
                <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-3">
                    {selectedLog.photoUrl && (
                      <div className="text-center">
                        <button
                          onClick={() => openLightbox(selectedLog, selectedLog.photoUrl, 'Official Registered ID Photo')}
                          className="cursor-pointer group relative"
                        >
                          <img
                            src={selectedLog.photoUrl}
                            alt={selectedLog.studentName}
                            className="w-14 h-14 rounded-xl object-cover ring-2 ring-blue-500/30 shrink-0 group-hover:ring-blue-500 transition-all"
                          />
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block mt-0.5">Official ID</span>
                        </button>
                      </div>
                    )}

                    {/* Live Scanned Thumbnail */}
                    {selectedLog.capturedThumbnailUrl && (
                      <div className="text-center">
                        <button
                          onClick={() => openLightbox(selectedLog, selectedLog.capturedThumbnailUrl!, 'Live Optical Scan Snapshot')}
                          className="cursor-pointer group relative"
                        >
                          <img
                            src={selectedLog.capturedThumbnailUrl}
                            alt="Live Scanned Snapshot"
                            className="w-14 h-14 rounded-xl object-cover ring-2 ring-cyan-500/50 shrink-0 group-hover:ring-cyan-400 transition-all bg-slate-950"
                          />
                          <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 block mt-0.5 flex items-center justify-center gap-0.5">
                            <Camera className="w-2.5 h-2.5" /> Live Scan
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-3.5 flex flex-col justify-center w-full">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedLog.studentName}
                    </h4>
                    <p className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {selectedLog.registerNumber}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {selectedLog.departmentName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Timestamp</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {selectedLog.timestamp}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Verifier Officer</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedLog.verifierName || 'Security Gatehouse'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Gate Location</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {selectedLog.location}
                    </span>
                  </div>

                  {selectedLog.notes && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Security Remarks</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {selectedLog.notes}
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs transition-all hover:opacity-90 cursor-pointer"
                >
                  Close Record
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

