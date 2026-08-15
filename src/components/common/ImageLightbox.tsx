import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Download, ZoomIn, UserCheck, Lock } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  title: string;
  subtitle?: string;
  badge?: string;
  status?: string;
  details?: { label: string; value: string }[];
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  photoUrl,
  title,
  subtitle,
  badge,
  status,
  details
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `${title.replace(/\s+/g, '_')}_ID_Photo.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
        
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 w-full max-w-lg rounded-3xl bg-slate-900 border border-blue-500/30 text-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  SHOV Biometric Identity Photo Record
                </h3>
                <p className="text-[10px] text-slate-400">High Resolution Verification Photo</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Container with Security Watermark */}
          <div className="relative aspect-square max-h-[380px] w-full bg-slate-950 flex items-center justify-center overflow-hidden group">
            <img
              src={photoUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Biometric Scanning Reticle Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/20 m-4 rounded-2xl flex items-center justify-center">
              {/* Corner reticles */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-sky-400" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-sky-400" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-sky-400" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-sky-400" />

              {/* Watermark text */}
              <div className="text-[10px] font-mono tracking-widest text-white/30 uppercase font-black rotate-[-25deg] select-none text-center">
                OFFICIAL INSTITUTIONAL RECORD<br />VERIFIED DIGITAL ID
              </div>
            </div>

            {/* Status Pill on Photo */}
            {status && (
              <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{status}</span>
              </div>
            )}
          </div>

          {/* Footer Metadata Details */}
          <div className="p-5 space-y-3 bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">{title}</h2>
                {subtitle && <p className="text-xs font-mono text-blue-400 mt-0.5">{subtitle}</p>}
              </div>

              {badge && (
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase">
                  {badge}
                </span>
              )}
            </div>

            {details && details.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                {details.map((d, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">{d.label}</span>
                    <span className="font-semibold text-slate-200 truncate block">{d.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-blue-400" /> 256-BIT ENCRYPTED ID
              </span>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save HD Photo</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
