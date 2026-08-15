import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShovLogo } from '../common/ShovLogo';
import { UserRole } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  User, 
  ChevronDown,
  Sparkles,
  X
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'IN 🇮🇳' },
  { code: '+1', country: 'US/CA 🇺🇸' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+81', country: 'JP 🇯🇵' },
  { code: '+61', country: 'AU 🇦🇺' },
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPhone, verifyOtp, loginWithGoogle, switchRole } = useAuth();

  const [step, setStep] = useState<'METHOD' | 'OTP' | 'SUCCESS'>('METHOD');
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('9876500001');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [testOtpCode, setTestOtpCode] = useState('123456');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeError, setShakeError] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const triggerShakeError = (msg: string) => {
    setErrorMessage(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      triggerShakeError('Please enter a valid mobile phone number');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    const res = await loginWithPhone(`${countryCode}${phoneNumber}`);
    setIsSubmitting(false);

    if (res.success) {
      if (res.testOtp) setTestOtpCode(res.testOtp);
      setStep('OTP');
      setTimer(60);
      setCanResend(false);
      // Auto fill test OTP after short delay for convenience
      setTimeout(() => {
        setOtpDigits(['1', '2', '3', '4', '5', '6']);
      }, 500);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpSubmit = async () => {
    const fullCode = otpDigits.join('');
    if (fullCode.length < 6) {
      triggerShakeError('Please enter the full 6-digit verification code');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    const success = await verifyOtp(`${countryCode}${phoneNumber}`, fullCode, selectedRole);
    setIsSubmitting(false);

    if (success) {
      setStep('SUCCESS');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      triggerShakeError('Invalid verification code. Use code: 123456');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const success = await loginWithGoogle(selectedRole);
    setIsSubmitting(false);
    if (success) {
      setStep('SUCCESS');
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleQuickDemoRole = (role: UserRole) => {
    switchRole(role);
    setStep('SUCCESS');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Background Floating Glow Shapes */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`relative w-full max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 ${
          shakeError ? 'animate-shake' : ''
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Logo */}
        <div className="text-center mb-6">
          <ShovLogo size="md" showTagline={false} lightText={document.documentElement.classList.contains('dark')} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            College Digital Identity & Authentication System
          </p>
        </div>

        {/* Role Picker Segmented Control */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
            Select Your Account Scope
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            {(['STUDENT', 'STAFF', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === r
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === 'STAFF' ? 'Staff/Sec' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* STEP 1: LOGIN METHOD (Google or Phone) */}
        {step === 'METHOD' && (
          <div className="space-y-4">
            
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-3 group cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Institutional Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                OR PHONE OTP
              </span>
            </div>

            {/* Phone Number Input with Country Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <div className="flex rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus-within:ring-2 focus-within:ring-blue-500 transition-all overflow-hidden">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-3 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="98765 00001"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-3 text-sm font-semibold bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* Send OTP Button */}
            <button
              onClick={handleSendOtp}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send OTP Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Demo Quick Accounts shortcut */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                ⚡ Instant Demo Login Shortcuts
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickDemoRole('STUDENT')}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold text-center border border-emerald-500/20 transition-all cursor-pointer"
                >
                  Student 23CS001
                </button>
                <button
                  onClick={() => handleQuickDemoRole('STAFF')}
                  className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold text-center border border-blue-500/20 transition-all cursor-pointer"
                >
                  Security Staff
                </button>
                <button
                  onClick={() => handleQuickDemoRole('ADMIN')}
                  className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold text-center border border-purple-500/20 transition-all cursor-pointer"
                >
                  College Admin
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'OTP' && (
          <div className="space-y-5">
            
            <div className="text-center">
              <span className="inline-flex p-3 rounded-full bg-blue-500/10 text-blue-500 mb-2">
                <Phone className="w-5 h-5 animate-bounce" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verify Phone Number</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter code sent to <span className="font-bold text-slate-800 dark:text-slate-200">{countryCode} {phoneNumber}</span>
              </p>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold">
                Test OTP Code: <span className="underline">123456</span>
              </div>
            </div>

            {/* 6 Digit Inputs */}
            <div className="flex justify-between gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-11 h-12 text-center text-lg font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtpSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Code & Login</span>
                </>
              )}
            </button>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
              <button
                onClick={() => setStep('METHOD')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Change Phone Number
              </button>

              {canResend ? (
                <button
                  onClick={handleSendOtp}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resend OTP
                </button>
              ) : (
                <span className="font-mono text-slate-400">
                  Resend code in <strong className="text-blue-500">{timer}s</strong>
                </span>
              )}
            </div>

          </div>
        )}

        {/* STEP 3: SUCCESS ANIMATION */}
        {step === 'SUCCESS' && (
          <div className="text-center py-8 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Authentication Verified!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Redirecting to <span className="font-bold text-blue-500">{selectedRole} Portal</span>...
            </p>
          </div>
        )}

      </motion.div>
    </div>
  );
};
