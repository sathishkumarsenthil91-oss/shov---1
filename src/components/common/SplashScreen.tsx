import React, { useEffect, useState } from 'react';
import { ShovLogo } from './ShovLogo';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing Secure Storage...');
  const [stepFinished, setStepFinished] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(35);
      setStage('Loading Encrypted Keychains...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(75);
      setStage('Verifying Institutional Security Gateway...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStage('System Authenticated & Ready');
      setStepFinished(true);
    }, 1400);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* Floating background lighting circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none animate-pulse" />
      
      {/* Decorative Grid Mesh */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Main Logo Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        
        {/* Animated Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold tracking-widest uppercase mb-8 shadow-inner"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>SHOV DIGITAL IDENTITY SYSTEM v2.6</span>
        </motion.div>

        {/* Animated Logo Container with Glow Aura */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
          className="relative mb-10 group"
        >
          {/* Subtle Glow Ring behind logo */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-600/20 via-sky-500/20 to-indigo-600/20 blur-xl opacity-80 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 p-2">
            <ShovLogo size="xl" showTagline={true} lightText={true} animated={true} />
          </div>
        </motion.div>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-full h-3 p-0.5 overflow-hidden shadow-2xl mb-4 relative">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 shadow-lg shadow-blue-500/50 relative overflow-hidden"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
          >
            {/* Shimmer effect inside progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        {/* Stage Status & Percentage */}
        <div className="flex items-center justify-between w-full text-xs font-medium text-slate-400 px-1">
          <span className="flex items-center gap-2 text-slate-300">
            {stepFinished ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
            )}
            <span className={stepFinished ? 'text-emerald-300 font-semibold' : ''}>{stage}</span>
          </span>
          <span className="font-mono text-blue-400 font-bold">{progress}%</span>
        </div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="mt-8 text-xs text-slate-500 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Tap anywhere or click to enter system</span>
        </button>
      </div>
    </motion.div>
  );
};

