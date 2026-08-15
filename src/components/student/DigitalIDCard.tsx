import React, { useState } from 'react';
import { Student } from '../../types';
import { ShovLogo } from '../common/ShovLogo';
import { ImageLightbox } from '../common/ImageLightbox';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  QrCode, 
  RotateCw, 
  Download, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  Building2,
  Calendar,
  Sparkles,
  Maximize2,
  Camera
} from 'lucide-react';

interface DigitalIDCardProps {
  student: Student;
  onReportLost?: () => void;
  onPhotoUpdated?: (newPhotoUrl: string) => void;
}

export const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ student, onReportLost, onPhotoUpdated }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);

  const statusColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
    INACTIVE: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-500' },
    SUSPENDED: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' },
    BANNED: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-500' },
    EXPIRED: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-500' },
  };

  const statusBadge = statusColors[student.status] || statusColors.ACTIVE;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(student.qrSecureToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto select-none">
      
      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photoUrl={student.photoUrl}
        title={student.name}
        subtitle={`REG: ${student.registerNumber} | ID: ${student.studentIdNumber}`}
        badge={student.departmentName}
        status={student.status}
        details={[
          { label: 'Register Number', value: student.registerNumber },
          { label: 'Course & Year', value: `${student.course} (${student.year} Yr)` },
          { label: 'Blood Group', value: student.bloodGroup || 'O+' },
          { label: 'College Email', value: student.collegeEmail }
        ]}
      />

      {/* Live Camera Snapshot Modal */}
      <LiveCameraCaptureModal
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCapture={(newPhoto) => {
          onPhotoUpdated?.(newPhoto);
        }}
        title="Student Photo Capture"
        subtitle={`Take new biometric photo for ${student.name} (${student.registerNumber})`}
      />

      {/* Flip Control Toggle */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          OFFICIAL COLLEGE DIGITAL ID
        </span>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'View Front' : 'View Back & QR'}</span>
        </button>
      </div>

      {/* 3D ID CARD CONTAINER */}
      <div className="relative w-full aspect-[1/1.55] sm:aspect-[1/1.5] perspective-1000">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="w-full h-full relative transform-style-3d shadow-2xl rounded-3xl"
        >
          
          {/* FRONT SIDE OF ID CARD */}
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-500/30 p-6 flex flex-col justify-between backface-hidden shadow-2xl">
            
            {/* Hologram & Grid Overlay Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Logo & College Name */}
            <div>
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <ShovLogo size="sm" showTagline={false} lightText={true} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-bold block">
                    ID: {student.studentIdNumber}
                  </span>
                  <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} text-[10px] font-black uppercase`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} animate-pulse`} />
                    {student.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Student Photo & Core Particulars */}
            <div className="my-auto py-4 flex flex-col items-center text-center">
              {/* Photo Frame with Security Hologram Border & Quick Camera Capture */}
              <div className="relative mb-3 flex items-center justify-center">
                <div 
                  className="relative cursor-pointer group" 
                  onClick={() => setIsLightboxOpen(true)}
                  title="Tap to view HD photo"
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-blue-500/40 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1 rounded-2xl">
                      <Maximize2 className="w-4 h-4" />
                      <span>HD View</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-blue-600 text-white shadow-lg border-2 border-slate-900">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                {onPhotoUpdated && (
                  <button
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="absolute -top-2 -right-2 p-2 rounded-full bg-slate-900/90 hover:bg-blue-600 text-cyan-400 hover:text-white border border-blue-500/40 shadow-xl transition-all cursor-pointer group/cam"
                    title="Take Live Camera ID Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span className="sr-only">Live Photo Capture</span>
                  </button>
                )}
              </div>

              {/* Name */}
              <h2 className="text-xl font-black text-white tracking-tight">{student.name}</h2>
              <p className="text-xs font-mono font-bold text-blue-400 mt-0.5 tracking-wider">
                REGISTER NO: {student.registerNumber}
              </p>

              {/* Department & Course Pills */}
              <div className="mt-3 space-y-1 w-full max-w-xs">
                <div className="p-2 rounded-xl bg-blue-900/40 border border-blue-500/20 text-xs font-medium text-slate-200">
                  <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Department</p>
                  <p className="font-semibold text-white truncate">{student.departmentName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
                    <p className="text-[9px] uppercase font-bold text-slate-400">Course / Year</p>
                    <p className="font-semibold text-slate-100">{student.course} ({student.year} Yr)</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
                    <p className="text-[9px] uppercase font-bold text-slate-400">Valid Until</p>
                    <p className="font-semibold text-emerald-400">{student.validUntil}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="border-t border-blue-500/20 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>ISSUED: {student.issuedAt}</span>
              <span className="flex items-center gap-1 text-blue-400">
                <Lock className="w-3 h-3" /> SECURE CHIP
              </span>
            </div>

          </div>

          {/* BACK SIDE OF ID CARD (SECURE QR CODE) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white border border-blue-500/30 p-6 flex flex-col justify-between transform-rotateY-180 backface-hidden shadow-2xl">
            
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">SECURE QR VERIFICATION</p>
                <p className="text-[10px] text-slate-400">Scan via Security Scanner to verify authenticity</p>
              </div>
              <QrCode className="w-5 h-5 text-blue-400" />
            </div>

            {/* QR Code Graphic Center */}
            <div className="my-auto flex flex-col items-center text-center">
              <div className="relative p-4 rounded-2xl bg-white shadow-2xl ring-4 ring-blue-500/30 group">
                
                {/* SVG High Precision QR Code Pattern */}
                <svg viewBox="0 0 100 100" className="w-40 h-40 sm:w-44 sm:h-44">
                  {/* Position detection patterns */}
                  <rect x="0" y="0" width="30" height="30" fill="#0f172a" rx="4" />
                  <rect x="5" y="5" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="10" y="10" width="10" height="10" fill="#1e40af" rx="1" />

                  <rect x="70" y="0" width="30" height="30" fill="#0f172a" rx="4" />
                  <rect x="75" y="5" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="80" y="10" width="10" height="10" fill="#1e40af" rx="1" />

                  <rect x="0" y="70" width="30" height="30" fill="#0f172a" rx="4" />
                  <rect x="5" y="75" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="10" y="80" width="10" height="10" fill="#1e40af" rx="1" />

                  {/* QR Data Grid Simulation */}
                  <path d="M 35 5 H 45 V 15 H 35 Z M 50 5 H 65 V 15 H 50 Z M 35 20 H 50 V 30 H 35 Z M 55 20 H 65 V 30 H 55 Z" fill="#1e293b" />
                  <path d="M 5 35 H 15 V 45 H 5 Z M 20 35 H 30 V 45 H 20 Z M 35 35 H 45 V 45 H 35 Z M 50 35 H 60 V 45 H 50 Z M 65 35 H 95 V 45 H 65 Z" fill="#1e293b" />
                  <path d="M 5 50 H 25 V 60 H 5 Z M 30 50 H 40 V 60 H 30 Z M 45 50 H 65 V 60 H 45 Z M 70 50 H 95 V 60 H 70 Z" fill="#1e293b" />
                  <path d="M 5 65 H 30 V 68 H 5 Z M 35 65 H 55 V 68 H 35 Z M 60 65 H 95 V 68 H 60 Z" fill="#2563eb" />
                  <path d="M 35 70 H 45 V 80 H 35 Z M 50 70 H 65 V 80 H 50 Z M 70 70 H 80 V 80 H 70 Z M 85 70 H 95 V 80 H 85 Z" fill="#1e293b" />
                  <path d="M 35 85 H 50 V 95 H 35 Z M 55 85 H 70 V 95 H 55 Z M 75 85 H 95 V 95 H 75 Z" fill="#1e293b" />
                  
                  {/* Center SHOV Logo Pin */}
                  <rect x="38" y="38" width="24" height="24" rx="4" fill="#0284c7" />
                  <text x="50" y="54" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">SHOV</text>
                </svg>

                {/* Animated Scanner Laser Sweep */}
                <div className="absolute inset-x-0 h-1 bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-scan-laser pointer-events-none" />
              </div>

              <div className="mt-3">
                <button
                  onClick={handleCopyToken}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Token: {student.qrSecureToken.slice(0, 16)}...</span>
                  {copiedToken ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-blue-400" />}
                </button>
              </div>
            </div>

            {/* Back Footer & Lost ID button */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="text-[9px] text-slate-400 text-center leading-relaxed">
                Property of Campus Security. If found, return to Central Gate Security.
              </div>

              {onReportLost && (
                <button
                  onClick={onReportLost}
                  className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report Lost ID Card</span>
                </button>
              )}
            </div>

          </div>

        </motion.div>
      </div>

    </div>
  );
};
