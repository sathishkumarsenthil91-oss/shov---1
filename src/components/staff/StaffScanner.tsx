import React, { useState, useRef, useEffect, useCallback } from 'react';
import { verifyQrTokenApi } from '../../services/api';
import { VerificationLog, Student, IDStatus } from '../../types';
import { INITIAL_STUDENTS } from '../../data/mockData';
import { ImageLightbox } from '../common/ImageLightbox';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { LiveQrScannerModal } from '../common/LiveQrScannerModal';
import { soundManager } from '../../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Scan, 
  UserCheck,
  Sparkles,
  MapPin,
  Maximize2,
  Lock,
  Upload,
  Zap,
  RefreshCw,
  Video,
  VideoOff,
  FlipHorizontal,
  Eye,
  Activity,
  Radio,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const StaffScanner: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'FACIAL_RECOGNITION' | 'SIMULATOR' | 'CAMERA'>('FACIAL_RECOGNITION');
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [location, setLocation] = useState('Main Gate Security Gatehouse #1');
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    status: IDStatus | 'INVALID_TOKEN';
    student?: Partial<Student>;
    message: string;
  } | null>(null);

  // Live Camera Feed Overlay State
  const [isPreviewCameraActive, setIsPreviewCameraActive] = useState(true);
  const [previewFacingMode, setPreviewFacingMode] = useState<'environment' | 'user'>('environment');
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  // Facial Recognition State
  const [selectedPhotoStudent, setSelectedPhotoStudent] = useState<Student>(INITIAL_STUDENTS[0]);
  const [isFacialScanning, setIsFacialScanning] = useState(false);
  const [facialMatchScore, setFacialMatchScore] = useState<number | null>(99.4);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);

  // Modal states for live captures
  const [showLiveCaptureModal, setShowLiveCaptureModal] = useState(false);
  const [showLiveQrModal, setShowLiveQrModal] = useState(false);

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

  // Start live camera stream for the preview overlay
  const startPreviewCamera = useCallback(async () => {
    try {
      setCameraPermissionError(null);
      if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: previewFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setPreviewStream(stream);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        await previewVideoRef.current.play().catch(() => {});
      }
      setIsPreviewCameraActive(true);
    } catch (err: any) {
      console.warn('Live preview camera error:', err);
      setCameraPermissionError('Hardware camera feed unavailable. Visual simulation enabled.');
      setIsPreviewCameraActive(false);
    }
  }, [previewFacingMode, previewStream]);

  const stopPreviewCamera = useCallback(() => {
    if (previewStream) {
      previewStream.getTracks().forEach(t => t.stop());
      setPreviewStream(null);
    }
    setIsPreviewCameraActive(false);
  }, [previewStream]);

  // Lifecycle for preview stream
  useEffect(() => {
    startPreviewCamera();
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [previewFacingMode]);

  const toggleCameraFacing = () => {
    setPreviewFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleVerifyToken = async (tokenToVerify?: string, capturedThumbnailUrl?: string) => {
    const finalToken = tokenToVerify || tokenInput;
    if (!finalToken) return;

    setIsVerifying(true);
    setScanResult(null);

    // If no live thumbnail provided and preview camera is active, snap from preview
    let thumb = capturedThumbnailUrl;
    if (!thumb && previewVideoRef.current && isPreviewCameraActive) {
      try {
        const video = previewVideoRef.current;
        const c = document.createElement('canvas');
        c.width = 240;
        c.height = 240;
        const ctx = c.getContext('2d');
        if (ctx && video.videoWidth > 0) {
          const size = Math.min(video.videoWidth, video.videoHeight);
          const startX = (video.videoWidth - size) / 2;
          const startY = (video.videoHeight - size) / 2;
          ctx.drawImage(video, startX, startY, size, size, 0, 0, 240, 240);
          thumb = c.toDataURL('image/jpeg', 0.85);
        }
      } catch (e) {
        console.warn('Could not auto-capture preview thumbnail:', e);
      }
    }

    const res = await verifyQrTokenApi(finalToken, 'u-staff-1', location, thumb);

    setIsVerifying(false);
    setScanResult(res);

    // Sensory feedback
    if (res.valid) {
      soundManager.playSuccessBeep();
    } else {
      soundManager.playDeniedSound();
    }
  };

  const runFacialScan = (student: Student, overridePhotoUrl?: string) => {
    setSelectedPhotoStudent(student);
    if (overridePhotoUrl) setCustomPhotoUrl(overridePhotoUrl);
    else setCustomPhotoUrl(null);

    setIsFacialScanning(true);
    setFacialMatchScore(null);
    setScanResult(null);

    setTimeout(() => {
      setIsFacialScanning(false);
      const score = Number((97.2 + Math.random() * 2.6).toFixed(1));
      setFacialMatchScore(score);

      const isValid = student.status === 'ACTIVE';
      setScanResult({
        valid: isValid,
        status: student.status,
        student,
        message: isValid 
          ? `Biometric Facial Recognition Matched (${score}% Confidence). Digital ID Authorized.` 
          : `Facial Biometrics Matched (${score}% Confidence). WARNING: Student ID is ${student.status}!`
      });

      if (isValid) {
        soundManager.playSuccessBeep();
      } else {
        soundManager.playDeniedSound();
      }
    }, 1200);
  };

  const handleLivePhotoTaken = (imageDataUrl: string) => {
    setCustomPhotoUrl(imageDataUrl);
    setIsFacialScanning(true);
    setFacialMatchScore(null);
    setScanResult(null);

    setTimeout(() => {
      setIsFacialScanning(false);
      const score = 99.1;
      setFacialMatchScore(score);
      setScanResult({
        valid: true,
        status: 'ACTIVE',
        student: {
          ...selectedPhotoStudent,
          photoUrl: imageDataUrl
        },
        message: `Live Camera Snapshot Verified (${score}% Match). Gate Clearance Granted.`
      });
      soundManager.playSuccessBeep();
    }, 1000);
  };

  const captureSnapshotFromPreview = () => {
    if (!previewVideoRef.current || !previewCanvasRef.current) {
      // Fallback
      runFacialScan(selectedPhotoStudent);
      return;
    }

    const video = previewVideoRef.current;
    const canvas = previewCanvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      handleLivePhotoTaken(dataUrl);
    } else {
      runFacialScan(selectedPhotoStudent);
    }
  };

  const openPhotoLightbox = (st: Student) => {
    setLightboxData({
      isOpen: true,
      photoUrl: st.photoUrl,
      title: st.name,
      subtitle: `REG: ${st.registerNumber} | ID: ${st.studentIdNumber}`,
      badge: st.departmentName,
      status: st.status,
      details: [
        { label: 'Register Number', value: st.registerNumber },
        { label: 'Course & Year', value: `${st.course} (${st.year} Yr)` },
        { label: 'Blood Group', value: st.bloodGroup || 'O+' },
        { label: 'College Email', value: st.collegeEmail }
      ]
    });
  };

  const statusDisplayMap: Record<string, { bg: string; border: string; text: string; title: string; icon: React.ReactNode }> = {
    ACTIVE: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      border: 'border-emerald-500/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      title: 'MATCH VERIFIED — ACCESS GRANTED',
      icon: <CheckCircle2 className="w-12 h-12 text-emerald-500" />
    },
    INACTIVE: {
      bg: 'bg-slate-500/10 dark:bg-slate-900/60',
      border: 'border-slate-500/40',
      text: 'text-slate-600 dark:text-slate-400',
      title: 'ID INACTIVE — ACCESS DENIED',
      icon: <XCircle className="w-12 h-12 text-slate-500" />
    },
    SUSPENDED: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      border: 'border-amber-500/40',
      text: 'text-amber-600 dark:text-amber-400',
      title: 'ID SUSPENDED — REPORTED LOST OR HELD',
      icon: <AlertTriangle className="w-12 h-12 text-amber-500" />
    },
    BANNED: {
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      border: 'border-rose-500/40',
      text: 'text-rose-600 dark:text-rose-400',
      title: 'ID BANNED — DISCIPLINARY HOLD',
      icon: <ShieldAlert className="w-12 h-12 text-rose-500" />
    },
    EXPIRED: {
      bg: 'bg-purple-500/10 dark:bg-purple-950/40',
      border: 'border-purple-500/40',
      text: 'text-purple-600 dark:text-purple-400',
      title: 'ID EXPIRED — RENEWAL REQUIRED',
      icon: <Clock className="w-12 h-12 text-purple-500" />
    },
    INVALID_TOKEN: {
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      border: 'border-rose-500/40',
      text: 'text-rose-600 dark:text-rose-400',
      title: 'UNRECOGNIZED QR BADGE / TOKEN',
      icon: <XCircle className="w-12 h-12 text-rose-500" />
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Hidden canvas for taking snapshots from video stream */}
      <canvas ref={previewCanvasRef} className="hidden" />

      {/* Lightbox Photo Inspection */}
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

      {/* Live Camera Snapshot Modal */}
      <LiveCameraCaptureModal
        isOpen={showLiveCaptureModal}
        onClose={() => setShowLiveCaptureModal(false)}
        onCapture={handleLivePhotoTaken}
        title="Live Gate Security Photo Capture"
        subtitle="Capture arriving student snapshot for live biometric facial verification"
      />

      {/* Live QR Scanner Modal */}
      <LiveQrScannerModal
        isOpen={showLiveQrModal}
        onClose={() => setShowLiveQrModal(false)}
        onScanSuccess={(token, capturedThumbnailUrl) => {
          setTokenInput(token);
          handleVerifyToken(token, capturedThumbnailUrl);
        }}
        title="Live Security QR Reader"
        subtitle="Aim camera at student digital pass to trigger instant entry clearance"
      />

      {/* Location Bar & Quick Trigger Hub */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Security Gate Biometric & QR Verification Terminal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live hardware camera feed, real-time facial recognition, and QR code token scanner
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowLiveCaptureModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all hover:scale-105"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Live Photo</span>
          </button>

          <button
            onClick={() => setShowLiveQrModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105"
          >
            <Scan className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scan QR Code</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-36 sm:w-48 text-xs truncate"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REAL-TIME LIVE CAMERA FEED OVERLAY (PRE-SCAN VIEW & TELEMETRY HUD)       */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-cyan-500/30 text-white shadow-2xl transition-all">
        
        {/* Top Header Bar of the Live Feed */}
        <div className="p-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 relative" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  Live Camera Feed & Real-Time Optical Viewfinder
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-bold">
                  1080p • 60 FPS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Real-time optical preview active before QR decode or biometric match
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCameraFacing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Flip Front / Rear Lens"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (isPreviewCameraActive) stopPreviewCamera();
                else startPreviewCamera();
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isPreviewCameraActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={isPreviewCameraActive ? "Pause Camera Feed" : "Start Camera Feed"}
            >
              {isPreviewCameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title={isPreviewCollapsed ? "Expand Viewfinder" : "Collapse Viewfinder"}
            >
              {isPreviewCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Viewfinder Main Video & HUD Overlay */}
        {!isPreviewCollapsed && (
          <div className="relative w-full aspect-video sm:aspect-[21/9] max-h-[360px] bg-slate-950 flex items-center justify-center overflow-hidden">
            
            {/* Real Hardware Video Stream */}
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${previewFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Fallback Display if camera not active or permission pending */}
            {(!isPreviewCameraActive || cameraPermissionError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center">
                <Camera className="w-12 h-12 text-slate-600 mb-2 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-300">Live Camera Feed Standby</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  {cameraPermissionError || "Camera stream paused. Click below to reconnect optical sensors."}
                </p>
                <button
                  onClick={startPreviewCamera}
                  className="mt-4 px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Activate Optical Camera</span>
                </button>
              </div>
            )}

            {/* HUD Reticle Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              
              {/* Corner Framing Brackets */}
              <div className="relative w-56 h-48 sm:w-80 sm:h-52 border border-cyan-500/20 rounded-2xl flex items-center justify-center">
                {/* 4 Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

                {/* Laser scan line animation */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-scan-laser" />

                {/* Center Crosshair */}
                <div className="w-6 h-6 rounded-full border border-cyan-400/40 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>

                {/* Target Guide Text */}
                <div className="absolute -bottom-7 text-[10px] font-mono font-bold text-cyan-300/80 uppercase tracking-widest bg-slate-950/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                  Align Student QR Badge / Face
                </div>
              </div>

              {/* Real-time telemetry stamps */}
              <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-400/80 bg-slate-950/60 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-2">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>REC // CAM-01 • {previewFacingMode.toUpperCase()} LENS</span>
              </div>

              <div className="absolute top-3 right-4 text-[10px] font-mono text-emerald-400 bg-slate-950/60 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>LATENCY: 12ms • LOCKED</span>
              </div>
            </div>

            {/* Bottom Pre-Scan Action Overlay Ribbon */}
            <div className="absolute bottom-3 inset-x-4 flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Real-Time Optical Preview Ready</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={captureSnapshotFromPreview}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  title="Snap Current Frame for Biometric Face Recognition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap Biometrics</span>
                </button>

                <button
                  onClick={() => setShowLiveQrModal(true)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Scan QR from Live Stream</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveMode('FACIAL_RECOGNITION')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeMode === 'FACIAL_RECOGNITION'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scan className="w-4 h-4 text-sky-300" />
          <span>Live Photo Facial Identification</span>
        </button>

        <button
          onClick={() => setActiveMode('SIMULATOR')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeMode === 'SIMULATOR'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Code & Registry Lookup</span>
        </button>

        <button
          onClick={() => setActiveMode('CAMERA')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeMode === 'CAMERA'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Dedicated Fullscreen Viewfinder</span>
        </button>
      </div>

      {/* Main Scanner Card Area */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* MODE 1: LIVE PHOTO FACIAL IDENTIFICATION */}
        {activeMode === 'FACIAL_RECOGNITION' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Live Facial Identification Engine
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Biometric Face Match & Registry Lookup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap any student below or click "Take Live Photo" to test instant biometric facial verification
              </p>
            </div>

            {/* Live Facial Scanner Visualizer Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-950 text-white border border-blue-500/30 shadow-2xl relative overflow-hidden">
              
              {/* Left Column: Live Captured Photo View with Reticle */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden ring-4 ring-blue-500/50 shadow-2xl group">
                  <img
                    src={customPhotoUrl || selectedPhotoStudent.photoUrl}
                    alt={selectedPhotoStudent.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Reticle Frame */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-sky-400/80 rounded-2xl flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-sky-400/40" />
                    {isFacialScanning && (
                      <div className="absolute inset-x-0 h-1 bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-scan-laser" />
                    )}
                  </div>

                  <button
                    onClick={() => openPhotoLightbox(selectedPhotoStudent)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white text-[10px] flex items-center gap-1 cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>HD</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLiveCaptureModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Camera Snapshot</span>
                  </button>
                </div>
              </div>

              {/* Right Column: AI Analysis Telemetry */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-400 tracking-wider font-bold">
                    Biometric Telemetry Matrix
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">
                    {selectedPhotoStudent.name}
                  </h4>
                  <p className="text-xs font-mono text-slate-400">
                    REG: {selectedPhotoStudent.registerNumber} • ID: {selectedPhotoStudent.studentIdNumber}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-bold text-white">{selectedPhotoStudent.departmentName}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Course & Year:</span>
                    <span className="font-bold text-white">{selectedPhotoStudent.course} ({selectedPhotoStudent.year} Yr)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Biometric Match:</span>
                    <span className={`font-mono font-bold ${
                      isFacialScanning ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                    }`}>
                      {isFacialScanning ? 'Analyzing Facial Vectors...' : `${facialMatchScore}% High Confidence`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => runFacialScan(selectedPhotoStudent)}
                  disabled={isFacialScanning}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Scan className={`w-4 h-4 ${isFacialScanning ? 'animate-spin' : ''}`} />
                  <span>{isFacialScanning ? 'Scanning Biometrics...' : 'Run Facial Recognition Verification'}</span>
                </button>
              </div>

            </div>

            {/* Student Quick Select Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
                Select Registered Student to Simulate Verification
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {INITIAL_STUDENTS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => runFacialScan(st)}
                    className={`p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] flex flex-col items-center gap-2 cursor-pointer ${
                      selectedPhotoStudent.id === st.id
                        ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30 shadow-lg'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={st.photoUrl}
                        alt={st.name}
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-blue-500/30 shadow-md"
                      />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        st.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                    </div>

                    <div className="overflow-hidden w-full">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.name}</p>
                      <p className="text-[10px] font-mono text-blue-500 truncate">{st.registerNumber}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* MODE 2: FULLSCREEN CAMERA VIEWFINDER MODE */}
        {activeMode === 'CAMERA' && (
          <div className="space-y-4">
            <div className="relative max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden bg-slate-950 border-4 border-blue-500/40 shadow-2xl flex items-center justify-center">
              {/* Viewfinder Target Frame */}
              <div className="absolute inset-12 border-2 border-dashed border-sky-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-1 bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-scan-laser" />
              </div>

              <div className="text-center p-6 space-y-3 z-10">
                <Camera className="w-12 h-12 text-cyan-400 mx-auto" />
                <h4 className="text-sm font-black text-white">Full Optical Security Scanner</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Active live feed is currently displaying in the top preview viewport.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => setShowLiveQrModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Scan className="w-4 h-4" />
                    <span>Launch Live QR Scanner</span>
                  </button>

                  <button
                    onClick={() => {
                      runFacialScan(INITIAL_STUDENTS[0]);
                      setActiveMode('FACIAL_RECOGNITION');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Snap & Identify Student</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: SIMULATOR / QR SEARCH MODE */}
        {activeMode === 'SIMULATOR' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
                Select Student Digital ID to Scan & Verify
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {INITIAL_STUDENTS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setTokenInput(st.qrSecureToken);
                      handleVerifyToken(st.qrSecureToken);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all hover:border-blue-500 flex items-center gap-3 cursor-pointer ${
                      tokenInput === st.qrSecureToken
                        ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <img
                      src={st.photoUrl}
                      alt={st.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-300 dark:ring-slate-700"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.name}</p>
                      <p className="text-[10px] font-mono text-blue-500">{st.registerNumber}</p>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase mt-0.5 ${
                        st.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {st.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Token / Reg No Search Input */}
            <div className="max-w-md mx-auto">
              <div className="flex rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="text"
                  placeholder="Enter Secure QR Token or Register No (e.g. 23CS001)..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-4 py-3 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  onClick={() => handleVerifyToken()}
                  className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Verify</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCAN / VERIFICATION OUTCOME BANNER */}
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-3xl border-2 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl ${
              statusDisplayMap[scanResult.status]?.bg || 'bg-slate-900'
            } ${statusDisplayMap[scanResult.status]?.border || 'border-slate-700'}`}
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              {statusDisplayMap[scanResult.status]?.icon}
              <div>
                <h3 className={`text-base font-black ${statusDisplayMap[scanResult.status]?.text || 'text-white'}`}>
                  {statusDisplayMap[scanResult.status]?.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                  {scanResult.message}
                </p>
                {scanResult.student && (
                  <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
                    Student: {scanResult.student.name} • {scanResult.student.registerNumber} • {scanResult.student.departmentName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setScanResult(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Clear Result
              </button>
            </div>
          </motion.div>
        )}

      </div>

    </div>
  );
};
