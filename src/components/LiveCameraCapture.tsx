'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  X,
  Download,
  CheckCircle2,
  RotateCcw,
  Crosshair,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface LiveCameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  target: 'imageUrl' | 'microscopeImageUrl';
  reportNumber: string;
  onCapture: (dataUrl: string) => void;
}

export default function LiveCameraCapture({
  isOpen,
  onClose,
  target,
  reportNumber,
  onCapture,
}: LiveCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [loadingCamera, setLoadingCamera] = useState<boolean>(false);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (deviceId?: string) => {
    setError('');
    setLoadingCamera(true);
    stopStream();

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError('Camera API is not supported in this browser. Use Chrome or Edge on localhost.');
        setLoadingCamera(false);
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? {
              deviceId: { exact: deviceId },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }
          : {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (!deviceId && videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        const activeId = activeTrack?.getSettings()?.deviceId || videoDevices[0].deviceId;
        setSelectedDeviceId(activeId);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to access camera. Check browser permission and USB connection.';
      setError(msg);
    } finally {
      setLoadingCamera(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCapturedDataUrl(null);
      setError('');
      return;
    }
    startCamera(selectedDeviceId || undefined);
    return () => {
      stopStream();
    };
  }, [isOpen]);

  const handleDeviceChange = (newId: string) => {
    setSelectedDeviceId(newId);
    setCapturedDataUrl(null);
    startCamera(newId);
  };

  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);
  };

  const handleDownloadToPc = () => {
    if (!capturedDataUrl) return;
    const suffix = target === 'microscopeImageUrl' ? 'microscope' : 'stone';
    const cleanReport = (reportNumber || 'WTC').replace(/[^a-zA-Z0-9_-]/g, '');
    const a = document.createElement('a');
    a.href = capturedDataUrl;
    a.download = `${cleanReport}-${suffix}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleApplyAndClose = () => {
    if (!capturedDataUrl) return;
    onCapture(capturedDataUrl);
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0B132B] border border-amber-500/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#070D1B] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-cinzel font-bold text-white">
                {target === 'microscopeImageUrl'
                  ? 'Live Microscope Camera Capture'
                  : 'Live Gemstone Macro Camera Capture'}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Direct USB / HDMI Microscope &amp; Webcam Feed &bull; {reportNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-900/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <span className="font-mono text-slate-400 whitespace-nowrap">Camera Source:</span>
            <select
              value={selectedDeviceId}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400"
            >
              {devices.length === 0 ? (
                <option value="">Detecting cameras...</option>
              ) : (
                devices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Camera ${idx + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCrosshair((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border font-mono text-[11px] inline-flex items-center gap-1 ${
                showCrosshair
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Reticle</span>
            </button>

            <button
              type="button"
              onClick={() => startCamera(selectedDeviceId || undefined)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reconnect</span>
            </button>
          </div>
        </div>

        {/* Video / Captured Frame Viewport */}
        <div className="p-5 bg-[#050914]">
          {error ? (
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/40 text-red-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1">Camera Connection Issue</div>
                <p>{error}</p>
                <p className="text-slate-400 mt-2">
                  Make sure your USB microscope / HDMI capture card is plugged in and browser camera permission is allowed for <code>localhost:3000</code>.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-contain ${capturedDataUrl ? 'hidden' : 'block'}`}
              />
              {capturedDataUrl && (
                <img
                  src={capturedDataUrl}
                  alt="Captured Frame"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Precision Optical Crosshair Overlay */}
              {!capturedDataUrl && showCrosshair && !loadingCamera && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-amber-400/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                  </div>
                  <div className="absolute inset-x-0 top-1/2 h-px bg-amber-400/20" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-amber-400/20" />
                </div>
              )}

              {loadingCamera && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-mono text-amber-300">
                  Connecting to camera feed...
                </div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Action Buttons */}
        <div className="px-5 py-3.5 bg-[#070D1B] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {!capturedDataUrl ? (
            <>
              <span className="text-[11px] font-mono text-slate-400">
                Center the gemstone or inclusion in the reticle, then capture.
              </span>
              <button
                type="button"
                disabled={Boolean(error) || loadingCamera}
                onClick={handleSnap}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-bold text-xs inline-flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCapturedDataUrl(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadToPc}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-mono text-xs inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Save Image to PC</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyAndClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs inline-flex items-center gap-1.5 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {target === 'microscopeImageUrl'
                      ? 'Use as Microscope Photo'
                      : 'Use as Stone Photo'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
