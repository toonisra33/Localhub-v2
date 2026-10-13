import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  RotateCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Video,
  Square,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { saveMediaFile, generateVideoThumbnail, formatBytes } from '../../utils/mediaStorage';

interface InstantCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (mediaUrl: string, mediaType?: 'image' | 'video', extraData?: { videoDuration?: number; videoThumbnail?: string }) => void;
}

export const InstantCameraModal: React.FC<InstantCameraModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  // Video recording mode
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoElementRef = useRef<HTMLVideoElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const nativeGalleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCapturedPhotoUrl(null);
      setCameraError(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (facing: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('เบราว์เซอร์ไม่รองรับการเปิดกล้องในหน้าเว็บโดยตรง');
      return;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(newStream);

      if (videoElementRef.current) {
        videoElementRef.current.srcObject = newStream;
        videoElementRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
        setCameraError('ไม่ได้รับอนุญาตให้เข้าถึงกล้อง กรุณากดอนุญาตในเบราว์เซอร์ หรือใช้กล้องของระบบ');
      } else {
        setCameraError('ไม่สามารถเปิดสตรีมกล้องได้ โปรดใช้ปุ่มเปิดกล้องของระบบด้านล่าง');
      }
    }
  };

  const stopCamera = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecordingVideo) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsRecordingVideo(false);
    setRecordingSeconds(0);
  };

  const flipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  };

  const takePhoto = async () => {
    if (!videoElementRef.current) return;
    setIsCapturing(true);
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    try {
      const video = videoElementRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // If user facing, mirror image for natural selfie
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const blob = await (await fetch(dataUrl)).blob();
        const saved = await saveMediaFile(blob, `live_photo_${Date.now()}.jpg`);
        setCapturedPhotoUrl(saved.objectUrl);
        stopCamera();
      }
    } catch (err) {
      console.error('Failed to capture photo:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const startVideoRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const thumb = await generateVideoThumbnail(new File([fullBlob], 'video.webm'));
        const saved = await saveMediaFile(fullBlob, `live_video_${Date.now()}.webm`, thumb);
        onPhotoCaptured(saved.objectUrl, 'video', {
          videoDuration: recordingSeconds,
          videoThumbnail: thumb
        });
        onClose();
      };

      recorder.start();
      setIsRecordingVideo(true);
      setRecordingSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 30) {
            stopVideoRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('MediaRecorder error:', err);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  const handleNativeCaptured = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const file = files[0];
      const saved = await saveMediaFile(file, file.name);
      onPhotoCaptured(saved.objectUrl, 'image');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
    }
  };

  const handleConfirmCapturedPhoto = () => {
    if (capturedPhotoUrl) {
      onPhotoCaptured(capturedPhotoUrl, 'image');
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    startCamera(facingMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      {/* Hidden native input fallbacks */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeCaptured}
      />
      <input
        ref={nativeGalleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleNativeCaptured}
      />

      <div className="relative w-full max-w-lg h-full sm:h-auto sm:max-h-[92vh] bg-slate-900 sm:rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-white">
        {/* Flash Effect Overlay */}
        {flashEffect && <div className="absolute inset-0 bg-white z-50 animate-fadeOut pointer-events-none" />}

        {/* Header Bar */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 z-20">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                <span>กล้องถ่ายรูปสด LocalHub</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/30">
                  ระบบจริง
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">ถ่ายภาพสดแล้วนำไปโพสต์ได้ทันที 1 คลิก</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
            title="ปิดกล้อง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative flex-1 bg-black min-h-[380px] sm:min-h-[460px] flex items-center justify-center overflow-hidden">
          {capturedPhotoUrl ? (
            /* Photo Review Screen */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPhotoUrl}
                alt="Captured Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-emerald-600/90 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>ภาพถ่ายพร้อมใช้งาน</span>
              </div>
            </div>
          ) : cameraError ? (
            /* Fallback & Error State */
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">กล้องสดในเบราว์เซอร์ไม่พร้อมทำงาน</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                  <span>เปิดกล้องมือถือของเครื่อง (Native Camera)</span>
                </button>
                <button
                  onClick={() => nativeGalleryInputRef.current?.click()}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>เลือกรูปถ่ายจากคลังแกลเลอรี</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Live Video Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoElementRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Live Overlay Guides */}
              <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-2xl flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-l-2 border-emerald-400 absolute top-2 left-2 rounded-tl-lg" />
                <div className="w-10 h-10 border-t-2 border-r-2 border-emerald-400 absolute top-2 right-2 rounded-tr-lg" />
                <div className="w-10 h-10 border-b-2 border-l-2 border-emerald-400 absolute bottom-2 left-2 rounded-bl-lg" />
                <div className="w-10 h-10 border-b-2 border-r-2 border-emerald-400 absolute bottom-2 right-2 rounded-br-lg" />
              </div>

              {/* Recording indicator */}
              {isRecordingVideo && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                  <span>บันทึกวิดีโอ {recordingSeconds}s / 30s</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shutter / Controls Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 z-20">
          {capturedPhotoUrl ? (
            /* Review Actions */
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-4 h-4" />
                <span>ถ่ายใหม่</span>
              </button>
              <button
                onClick={handleConfirmCapturedPhoto}
                className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
              >
                <span>ใช้ภาพนี้สร้างโพสต์ทันที</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Live Camera Controls */
            <div className="space-y-3">
              {/* Photo vs Video Mode Toggle */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode('photo')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    mode === 'photo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ถ่ายภาพนิ่ง
                </button>
                <button
                  type="button"
                  onClick={() => setMode('video')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    mode === 'video' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  บันทึกวิดีโอ (30s)
                </button>
              </div>

              {/* Shutter Button Row */}
              <div className="flex items-center justify-around pt-1">
                {/* Fallback to Native System Camera / Gallery */}
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition text-xs font-semibold flex flex-col items-center gap-1"
                  title="เปิดกล้องของระบบมือถือ"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px]">กล้องระบบ</span>
                </button>

                {/* Primary Shutter Button */}
                {mode === 'photo' ? (
                  <button
                    type="button"
                    onClick={takePhoto}
                    disabled={isCapturing || !stream}
                    className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center transition active:scale-90 hover:scale-105 shadow-2xl disabled:opacity-50 group"
                    title="กดชัตเตอร์เพื่อถ่ายภาพ"
                  >
                    <div className="w-full h-full rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
                    disabled={!stream}
                    className={`w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center transition active:scale-90 hover:scale-105 shadow-2xl ${
                      isRecordingVideo ? 'border-red-500 animate-pulse' : ''
                    }`}
                    title={isRecordingVideo ? 'หยุดบันทึก' : 'เริ่มบันทึกวิดีโอ'}
                  >
                    <div
                      className={`transition ${
                        isRecordingVideo
                          ? 'w-7 h-7 bg-red-600 rounded-md'
                          : 'w-full h-full rounded-full bg-red-600'
                      }`}
                    />
                  </button>
                )}

                {/* Flip Camera Button */}
                <button
                  type="button"
                  onClick={flipCamera}
                  disabled={!stream}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition text-xs font-semibold flex flex-col items-center gap-1 disabled:opacity-40"
                  title="สลับกล้องหน้า/หลัง"
                >
                  <RotateCw className="w-5 h-5" />
                  <span className="text-[10px]">สลับกล้อง</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
