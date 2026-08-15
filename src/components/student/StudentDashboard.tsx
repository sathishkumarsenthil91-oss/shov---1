import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DigitalIDCard } from './DigitalIDCard';
import { FinePaymentModal } from './FinePaymentModal';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { LiveQrScannerModal } from '../common/LiveQrScannerModal';
import { Student, Fine, Payment } from '../../types';
import { INITIAL_STUDENTS, INITIAL_FINES, INITIAL_PAYMENTS } from '../../data/mockData';
import { fetchFinesApi, verifyQrTokenApi } from '../../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Download, 
  Share2, 
  ShieldAlert, 
  Sparkles,
  PhoneCall,
  MapPin,
  Mail,
  Receipt,
  FileText,
  AlertTriangle,
  Camera,
  QrCode,
  ShieldCheck,
  Zap,
  Activity,
  Scan
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, addNotification } = useAuth();

  // Find student matching current logged in user or default to Aarav Sharma (23CS001)
  const [student, setStudent] = useState<Student>(() => {
    return INITIAL_STUDENTS.find(s => s.registerNumber.toLowerCase() === user?.username.toLowerCase() || s.id === user?.studentId) || INITIAL_STUDENTS[0];
  });

  const [fines, setFines] = useState<Fine[]>([]);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [selectedFineToPay, setSelectedFineToPay] = useState<Fine | null>(null);
  const [showReportLostModal, setShowReportLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('');

  // Live Camera and Live QR Modals
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [qrVerificationResult, setQrVerificationResult] = useState<{
    valid: boolean;
    message: string;
    studentName?: string;
  } | null>(null);

  useEffect(() => {
    loadStudentFines();
  }, [student.id]);

  const loadStudentFines = async () => {
    const data = await fetchFinesApi(student.id);
    if (data.length > 0) {
      setFines(data);
    } else {
      setFines(INITIAL_FINES.filter(f => f.studentId === student.id));
    }
  };

  const pendingFines = fines.filter(f => f.status === 'PENDING');
  const totalPendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);

  const handlePaymentSuccess = (paymentRecord: Payment) => {
    setPayments(prev => [paymentRecord, ...prev]);
    setFines(prev => prev.map(f => f.id === paymentRecord.fineId ? { ...f, status: 'PAID' } : f));
    addNotification('Fine Settlement Complete', `Payment of ₹${paymentRecord.amount} recorded successfully`, 'success');
  };

  const handleReportLostSubmit = () => {
    if (!lostReason) return;
    setStudent(prev => ({ ...prev, status: 'SUSPENDED' }));
    setShowReportLostModal(false);
    addNotification('Lost ID Reported', 'Your digital card status has been set to SUSPENDED. Admin notified.', 'warning');
  };

  const handlePhotoUpdated = (newPhotoUrl: string) => {
    setStudent(prev => ({ ...prev, photoUrl: newPhotoUrl }));
    addNotification('Biometric ID Photo Updated', 'Your live photo was successfully captured and applied to your Digital ID card.', 'success');
  };

  const handleQrScanned = async (scannedToken: string) => {
    const result = await verifyQrTokenApi(scannedToken, user?.id || 'self-verify', 'Student Self-Verification Hub');
    setQrVerificationResult({
      valid: result.valid,
      message: result.message,
      studentName: result.student?.name
    });
    addNotification(
      result.valid ? 'QR Verified' : 'QR Scan Warning',
      result.message,
      result.valid ? 'success' : 'warning'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Action Ribbon: Live Camera & Live QR Scanner Hub */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>SHOV Digital ID Biometric Suite</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Student Identity & Security Hub
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Take a live biometric photo snapshot to refresh your Digital ID, or launch the real-time QR scanner to verify your college access permissions.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowCameraModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              <span>Take Live ID Photo</span>
            </button>

            <button
              onClick={() => setShowQrScannerModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Scan className="w-4 h-4 text-cyan-400" />
              <span>Scan QR Code</span>
            </button>
          </div>
        </div>

        {/* Live QR Verification Notice if scanned */}
        {qrVerificationResult && (
          <div className={`mt-4 p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            qrVerificationResult.valid 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {qrVerificationResult.valid ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-bold">QR Verification Outcome:</span> {qrVerificationResult.message}
              </div>
            </div>
            <button
              onClick={() => setQrVerificationResult(null)}
              className="text-[11px] underline font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Top Banner Alert for Non-Active Statuses */}
      {student.status !== 'ACTIVE' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-3xl border flex items-center justify-between gap-4 shadow-xl ${
            student.status === 'BANNED' 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' 
              : student.status === 'SUSPENDED' 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
              : 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wider">
                CARD STATUS: {student.status}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                {student.status === 'BANNED' && 'Access prohibited by Security Council. Please visit Administrative Block.'}
                {student.status === 'SUSPENDED' && 'Digital ID temporarily suspended due to reported loss or administrative review.'}
                {student.status === 'EXPIRED' && 'Validity ended on ' + student.validUntil + '. Contact Dean Office for re-issuance.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Grid: Left Digital ID Card Preview, Right Profile & Fines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col (Digital ID Card View - 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <DigitalIDCard 
            student={student} 
            onReportLost={() => setShowReportLostModal(true)} 
            onPhotoUpdated={handlePhotoUpdated}
          />
        </div>

        {/* Right Col (Profile Summary, Fines, Payments - 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Profile Overview Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Student Record Particulars
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                AY 2026-2027
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Full Name</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">{student.name}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Register Number</span>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">{student.registerNumber}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Department & Course</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{student.departmentName} ({student.course})</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">College Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{student.collegeEmail}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mobile & Guardian</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{student.phoneNumber}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Blood Group & Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{student.bloodGroup || 'O+'} • Hostel B Room 304</span>
              </div>
            </div>
          </div>

          {/* Pending Fines & Fee Dues */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Pending College Fines & Dues
                </h3>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                totalPendingAmount > 0 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                {totalPendingAmount > 0 ? `Pending: ₹${totalPendingAmount}` : 'All Cleared'}
              </span>
            </div>

            {pendingFines.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">No Outstanding Fines</p>
                <p className="text-[11px] text-slate-400">You are fully compliant with college library and campus guidelines.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingFines.map((fine) => (
                  <div key={fine.id} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{fine.reason}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        Ref: {fine.fineNumber} • Due: {fine.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400">₹{fine.amount}</span>
                      <button
                        onClick={() => setSelectedFineToPay(fine)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                      >
                        Pay Fine
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Receipts History */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Payment Receipts History
                </h3>
              </div>
            </div>

            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No past transactions recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="pb-2">Receipt Ref</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Method</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{p.gatewayPaymentId}</td>
                        <td className="py-2.5 font-bold text-emerald-500">₹{p.amount}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{p.paymentMethod}</td>
                        <td className="py-2.5 text-slate-400">{p.paidAt}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-500">PAID</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Live Camera Snapshot Modal */}
      <LiveCameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handlePhotoUpdated}
        title="Student Live Photo Capture"
        subtitle={`Take a high-definition ID photo for ${student.name}`}
      />

      {/* Live QR Scanner Modal */}
      <LiveQrScannerModal
        isOpen={showQrScannerModal}
        onClose={() => setShowQrScannerModal(false)}
        onScanSuccess={handleQrScanned}
        title="Student QR Access Scanner"
        subtitle="Point camera to verify QR badge tokens and gate entry clearance"
      />

      {/* Fine Payment Modal Popup */}
      {selectedFineToPay && (
        <FinePaymentModal
          fine={selectedFineToPay}
          isOpen={!!selectedFineToPay}
          onClose={() => setSelectedFineToPay(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Report Lost ID Modal */}
      {showReportLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Report Lost Digital ID</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reporting your ID as lost will temporarily set its status to <strong className="text-amber-500">SUSPENDED</strong> to prevent unauthorized use.
            </p>
            <textarea
              rows={3}
              placeholder="State reason or location where ID was lost..."
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowReportLostModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleReportLostSubmit}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Submit & Suspend Card
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
