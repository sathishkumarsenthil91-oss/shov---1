import React, { useState } from 'react';
import { Student, IDStatus } from '../../types';
import { updateIdStatusApi } from '../../services/api';
import { ShieldAlert, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface IDStatusModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedStudent: Student) => void;
}

export const IDStatusModal: React.FC<IDStatusModalProps> = ({
  student,
  isOpen,
  onClose,
  onStatusUpdated
}) => {
  const [newStatus, setNewStatus] = useState<IDStatus>(student.status);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason || reason.trim().length < 5) {
      setError('Please provide a mandatory audit reason (at least 5 characters)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const success = await updateIdStatusApi(student.id, newStatus, reason);
    setIsSubmitting(false);

    if (success) {
      onStatusUpdated({ ...student, status: newStatus });
      onClose();
    } else {
      // Local fallback state update
      onStatusUpdated({ ...student, status: newStatus });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Change Student Digital ID Status</h3>
        </div>

        {/* Student Summary */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <img src={student.photoUrl} alt={student.name} className="w-12 h-12 rounded-xl object-cover" />
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</p>
            <p className="text-[11px] font-mono text-blue-500">{student.registerNumber} • {student.departmentName}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Current Status: <strong className="uppercase font-extrabold">{student.status}</strong></p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
            {error}
          </div>
        )}

        {/* Status Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Select New ID Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'EXPIRED'] as IDStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setNewStatus(st)}
                className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  newStatus === st
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-md ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Audit Trail Reason (Required)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Card reported lost by student, disciplinary hold approved by Dean..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/20 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? 'Recording Audit Log...' : 'Update & Log Action'}
          </button>
        </div>

      </div>
    </div>
  );
};
