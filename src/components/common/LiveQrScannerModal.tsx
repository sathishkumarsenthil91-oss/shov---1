import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, QrCode, FlipHorizontal, RefreshCw, XCircle, CheckCircle2, Zap, AlertTriangle, ShieldCheck, X, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { soundManager } from '../../utils/audio';

interface LiveQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedToken: string, capturedThumbnailUrl?: string) => void;
  title?: string;
  subtitle?: string;
}

export const LiveQrScannerModal: React.FC<LiveQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Live QR Code Scanner',
  subtitle = 'Aim your camera at a student Digital ID QR badge to verify instantly'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);
  const [capturedThumbnail, setCapturedThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const scanBarcodeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data && !isProcessing) {
        setIsProcessing(true);
        setLastScannedResult(code.data);

        // Capture a compressed small thumbnail snapshot at the exact moment of scan
        let snapshotDataUrl: string | undefined = undefined;
        try {
          // Render a crisp thumbnail (240x240 square or 4:3)
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = 240;
          thumbCanvas.height = 240;
          const thumbCtx = thumbCanvas.getContext('2d');
          if (thumbCtx) {
            // Draw center crop
            const size = Math.min(video.videoWidth, video.videoHeight);
            const startX = (video.videoWidth - size) / 2;
            const startY = (video.videoHeight - size) / 2;
            thumbCtx.drawImage(video, startX, startY, size, size, 0, 0, 240, 240);
            snapshotDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.85);
            setCapturedThumbnail(snapshotDataUrl);
          }
        } catch (e) {
          console.warn('Could not generate scan thumbnail snapshot:', e);
        }

        // Play audible crisp confirmation beep
        soundManager.playSuccessBeep();

        // Haptic feedback if supported
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([60, 50, 100]);
        }

        setTimeout(() => {
          onScanSuccess(code.data, snapshotDataUrl);
          onClose();
        }, 550);
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(scanBarcodeFrame);
  }, [isProcessing, onScanSuccess, onClose]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsProcessing(false);
    setLastScannedResult(null);

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
        animationFrameId.current = requestAnimationFrame(scanBarcodeFrame);
      }
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Please enable camera access.'
          : 'Unable to start camera for QR scanning.'
      );
    }
  }, [facingMode, scanBarcodeFrame, stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="p-5 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden min-h-[340px]">
          <canvas ref={canvasRef} className="hidden" />

          {cameraError ? (
            <div className="text-center p-6 space-y-3 z-10 max-w-sm">
              <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-white">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera Permission</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* QR Targeting Frame Box with Laser Sweep */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 rounded-2xl border-2 border-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.5)] relative overflow-hidden bg-blue-500/5">
                  {/* 4 Corner Markers */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-400" />

                  {/* Laser Scan Sweep Bar */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-laser shadow-[0_0_12px_#38bdf8]" />
                </div>
              </div>

              {/* Scanning Overlay Notification */}
              {lastScannedResult ? (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce mb-2" />
                  <p className="text-sm font-black text-white">QR Code Verified!</p>
                  <p className="text-[11px] font-mono text-emerald-300 mt-1 max-w-[240px] truncate">
                    {lastScannedResult}
                  </p>
                </div>
              ) : (
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-cyan-400 font-mono text-[10px] px-2.5 py-1 rounded-lg border border-slate-700/50 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Scanning for Digital QR...</span>
                </div>
              )}

              {/* Flip camera */}
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700/60 shadow-lg cursor-pointer transition-all"
                title="Switch Camera (Front/Rear)"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Supports Standard Digital QR & SHOV Dynamic Auth Badges
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Close Scanner
          </button>
        </div>
      </motion.div>
    </div>
  );
};
