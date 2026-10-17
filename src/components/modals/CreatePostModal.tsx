import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Camera,
  Video as VideoIcon,
  MapPin,
  Tag,
  Trash2,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileVideo
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Post } from '../../types';
import { saveMediaFile, generateVideoThumbnail, formatBytes } from '../../utils/mediaStorage';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'camera' | 'gallery' | 'video' | 'standard';
  initialImages?: string[];
  onOpenReportAlert?: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'standard',
  initialImages = [],
  onOpenReportAlert
}) => {
  const { createPost, location, showToast } = useCommunity();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Post['category']>('news');
  const [tagInput, setTagInput] = useState('');

  // Media states
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [videoFileSize, setVideoFileSize] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Live in-app camera viewfinder states
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const videoStreamRef = useRef<HTMLVideoElement>(null);

  // Hidden file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);

  // Sync initial props and cleanup when modal closes
  useEffect(() => {
    if (isOpen) {
      if (initialImages && initialImages.length > 0) {
        setImages(initialImages);
      }
      if (initialMode === 'camera') {
        // Automatically start live camera viewfinder
        startLiveCamera('environment');
      }
    } else {
      stopLiveCamera();
      resetForm();
    }
  }, [isOpen, initialMode, initialImages]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('news');
    setTagInput('');
    setImages([]);
    setVideoUrl('');
    setVideoThumbnail('');
    setVideoFileName('');
    setVideoFileSize(0);
    setVideoDuration(0);
    setImageUrlInput('');
    setShowUrlInput(false);
    setIsProcessingMedia(false);
    setIsLiveCameraOpen(false);
  };

  // Start in-app live camera
  const startLiveCamera = async (facing: 'user' | 'environment' = 'environment') => {
    try {
      if (liveStream) {
        liveStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setLiveStream(stream);
      setIsLiveCameraOpen(true);
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        videoStreamRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Unable to start live camera, opening system camera instead:', err);
      showToast('กำลังเปิดกล้องถ่ายภาพของอุปกรณ์...', 'info');
      cameraInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (liveStream) {
      liveStream.getTracks().forEach(track => track.stop());
      setLiveStream(null);
    }
    setIsLiveCameraOpen(false);
  };

  const flipCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  const capturePhotoFromLiveCamera = async () => {
    if (!videoStreamRef.current) return;
    try {
      const video = videoStreamRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Convert dataURL to blob and save in IndexedDB
        const blob = await (await fetch(dataUrl)).blob();
        setIsProcessingMedia(true);
        setProcessingStatus('กำลังบันทึกภาพถ่าย...');
        const saved = await saveMediaFile(blob, `camera_${Date.now()}.jpg`);
        setImages(prev => [...prev, saved.objectUrl]);
        showToast('📸 ถ่ายรูปภาพสำเร็จ! พร้อมโพสต์', 'success');
      }
    } catch (err) {
      console.error('Error capturing photo:', err);
      showToast('เกิดข้อผิดพลาดในการถ่ายภาพ', 'error');
    } finally {
      setIsProcessingMedia(false);
      stopLiveCamera();
    }
  };

  // Handle direct camera photo capture from input
  const handleCameraPhotoCaptured = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingMedia(true);
    setProcessingStatus('กำลังบันทึกภาพจากกล้อง...');
    try {
      const file = files[0];
      const saved = await saveMediaFile(file, file.name);
      setImages(prev => [...prev, saved.objectUrl]);
      showToast('📸 ถ่ายภาพจากกล้องเรียบร้อย!', 'success');
    } catch (err) {
      console.error('Failed to save camera photo:', err);
      showToast('ไม่สามารถบันทึกภาพถ่ายได้', 'error');
    } finally {
      setIsProcessingMedia(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // Handle multiple photo files from Gallery
  const handleGalleryPhotosSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingMedia(true);
    setProcessingStatus(`กำลังอัปโหลด ${files.length} รูปภาพจากแกลเลอรี...`);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const saved = await saveMediaFile(file, file.name);
        uploadedUrls.push(saved.objectUrl);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
      showToast(`เพิ่มรูปภาพจากแกลเลอรี ${uploadedUrls.length} รูปเรียบร้อย!`, 'success');
    } catch (err) {
      console.error('Failed to load gallery photos:', err);
      showToast('เกิดข้อผิดพลาดในการโหลดรูปภาพ', 'error');
    } finally {
      setIsProcessingMedia(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Handle Video file upload / video camera recording
  const handleVideoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessingMedia(true);
    setProcessingStatus(`กำลังประมวลผลวิดีโอ (${formatBytes(file.size)})...`);

    try {
      // 1. Generate video thumbnail frame
      setProcessingStatus('กำลังสร้างภาพตัวอย่างวิดีโอ...');
      const thumb = await generateVideoThumbnail(file);

      // 2. Save video blob into high-capacity IndexedDB
      setProcessingStatus('กำลังบันทึกไฟล์วิดีโอลงระบบ...');
      const saved = await saveMediaFile(file, file.name, thumb);

      setVideoUrl(saved.objectUrl);
      setVideoThumbnail(thumb);
      setVideoFileName(file.name);
      setVideoFileSize(file.size);

      // Read video duration
      const tempVideo = document.createElement('video');
      tempVideo.src = saved.objectUrl;
      tempVideo.onloadedmetadata = () => {
        setVideoDuration(Math.round(tempVideo.duration));
      };

      showToast(`🎬 อัปโหลดวิดีโอสำเร็จ (${formatBytes(file.size)}) พร้อมแสดงผล!`, 'success');
    } catch (err) {
      console.error('Error uploading video:', err);
      showToast('ไม่สามารถอัปโหลดวิดีโอได้ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsProcessingMedia(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
      if (videoCameraInputRef.current) videoCameraInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
    setShowUrlInput(false);
    showToast('เพิ่มรูปภาพจาก URL เรียบร้อย', 'success');
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeVideo = () => {
    setVideoUrl('');
    setVideoThumbnail('');
    setVideoFileName('');
    setVideoFileSize(0);
    setVideoDuration(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('กรุณากรอกหัวข้อและเนื้อหาโพสต์', 'error');
      return;
    }

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    let mediaType: Post['mediaType'] = undefined;
    if (images.length > 0 && videoUrl) mediaType = 'mixed';
    else if (videoUrl) mediaType = 'video';
    else if (images.length > 0) mediaType = 'image';

    createPost({
      title: title.trim(),
      content: content.trim(),
      category,
      images: images.length > 0 ? images : undefined,
      videoUrl: videoUrl || undefined,
      videoThumbnail: videoThumbnail || undefined,
      videoDuration: videoDuration || undefined,
      mediaFileName: videoFileName || undefined,
      mediaFileSize: videoFileSize || undefined,
      mediaType,
      tags: tags.length > 0 ? tags : undefined
    });

    showToast('สร้างโพสต์ข้อมูลข่าวสารเรียบร้อยแล้ว!', 'success');
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Hidden native inputs for maximum device compatibility */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraPhotoCaptured}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleGalleryPhotosSelected}
        />
        <input
          ref={videoFileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/*"
          className="hidden"
          onChange={handleVideoSelected}
        />
        <input
          ref={videoCameraInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={handleVideoSelected}
        />

        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">สร้างโพสต์แจ้งข้อมูลข่าวสาร</h3>
              <p className="text-[11px] text-slate-500">ถ่ายรูปสด แกลเลอรี และวิดีโอคลิป</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {/* Location Badge */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>
              โพสต์ในพื้นที่: <strong className="text-slate-800">{location.province} {location.district ? `(${location.district})` : ''}</strong>
            </span>
          </div>

          {/* ======================================================== */}
          {/* CAMERA & MEDIA ATTACHMENT SECTION - PLACED AT THE TOP    */}
          {/* ======================================================== */}
          <div className="p-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>📷 ถ่ายรูปสด & แนบสื่อ (Direct Camera & Media)</span>
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-200/60 px-2 py-0.5 rounded-md">
                พร้อมใช้งาน
              </span>
            </div>

            {/* Media Action Buttons Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Button 1: Direct Native Camera Snap (Photo) */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isProcessingMedia}
                className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-emerald-50 border-2 border-emerald-400 rounded-xl text-emerald-800 transition active:scale-95 shadow-xs group"
                title="เปิดกล้องมือถือถ่ายภาพทันที"
              >
                <div className="p-2 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 mb-1 transition">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-black">ถ่ายรูปสด</span>
                <span className="text-[9px] text-emerald-600">เข้ากล้องตรง</span>
              </button>

              {/* Button 2: Gallery Upload (Photo) */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isProcessingMedia}
                className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-blue-50 border border-blue-300 rounded-xl text-blue-700 hover:text-blue-800 transition active:scale-95 shadow-2xs group"
                title="เลือกรูปภาพจากคลังแกลเลอรี"
              >
                <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 text-blue-700 mb-1 transition">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">แกลเลอรี</span>
                <span className="text-[9px] text-slate-500">เลือกรูปในเครื่อง</span>
              </button>

              {/* Button 3: Video File Upload */}
              <button
                type="button"
                onClick={() => videoFileInputRef.current?.click()}
                disabled={isProcessingMedia}
                className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-purple-50 border border-purple-300 rounded-xl text-purple-700 hover:text-purple-800 transition active:scale-95 shadow-2xs group"
                title="อัปโหลดไฟล์คลิปวิดีโอ"
              >
                <div className="p-2 rounded-full bg-purple-100 group-hover:bg-purple-200 text-purple-700 mb-1 transition">
                  <FileVideo className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">อัปโหลดวิดีโอ</span>
                <span className="text-[9px] text-slate-500">ไฟล์ MP4 / MOV</span>
              </button>

              {/* Button 4: Record Video with Camera */}
              <button
                type="button"
                onClick={() => videoCameraInputRef.current?.click()}
                disabled={isProcessingMedia}
                className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-rose-50 border border-rose-300 rounded-xl text-rose-700 hover:text-rose-800 transition active:scale-95 shadow-2xs group"
                title="บันทึกคลิปวิดีโอด้วยกล้อง"
              >
                <div className="p-2 rounded-full bg-rose-100 group-hover:bg-rose-200 text-rose-700 mb-1 transition">
                  <VideoIcon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">ถ่ายวิดีโอ</span>
                <span className="text-[9px] text-slate-500">บันทึกคลิปสด</span>
              </button>
            </div>

            {/* In-app live camera trigger */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
              <button
                type="button"
                onClick={() => isLiveCameraOpen ? stopLiveCamera() : startLiveCamera('environment')}
                className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-bold"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isLiveCameraOpen ? 'ปิดช่องมองภาพในจอ' : '📸 เปิดช่องมองกล้องสดในจอ (Live Viewfinder)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-slate-500 hover:text-slate-700 hover:underline text-[11px]"
              >
                {showUrlInput ? 'ซ่อนใส่ URL' : '+ ใส่ลิงก์ URL รูป'}
              </button>
            </div>

            {/* Live Camera Viewfinder Overlay */}
            {isLiveCameraOpen && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-emerald-500 shadow-lg">
                <video
                  ref={videoStreamRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between">
                  <button
                    type="button"
                    onClick={flipCamera}
                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs transition"
                    title="สลับกล้องหน้า/หลัง"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={capturePhotoFromLiveCamera}
                    className="p-3.5 rounded-full bg-emerald-500 text-white hover:scale-105 active:scale-95 shadow-xl transition flex items-center justify-center font-bold"
                    title="กดชัตเตอร์ถ่ายภาพทันที"
                  >
                    <Camera className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                    title="ปิดกล้อง"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Optional URL Image Input */}
            {showUrlInput && (
              <div className="flex gap-2 pt-1 animate-fadeIn">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-1.5 bg-white outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  เพิ่ม
                </button>
              </div>
            )}

            {/* Media Processing Loading indicator */}
            {isProcessingMedia && (
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-900 flex items-center gap-2.5 text-xs font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>{processingStatus || 'กำลังประมวลผลไฟล์สื่อ...'}</span>
              </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                  <span>📸 รูปภาพที่แนบแล้ว ({images.length} รูป)</span>
                  <button
                    type="button"
                    onClick={() => setImages([])}
                    className="text-red-600 hover:underline text-[11px]"
                  >
                    ลบทั้งหมด
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border-2 border-emerald-400 shadow-sm">
                      <img
                        src={img}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
                        title="ลบรูปนี้"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Preview Player */}
            {videoUrl && (
              <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 animate-fadeIn border border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <FileVideo className="w-4 h-4 text-purple-400" />
                    <span>วิดีโอพร้อมเผยแพร่</span>
                    {videoFileSize > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200">
                        {formatBytes(videoFileSize)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบวิดีโอ</span>
                  </button>
                </div>

                <div className="relative rounded-lg overflow-hidden bg-black max-h-56">
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-56 object-contain bg-black"
                  />
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  ชื่อไฟล์: {videoFileName || 'video.mp4'} {videoDuration > 0 ? `• ความยาว: ${videoDuration} วินาที` : ''}
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">หมวดหมู่โพสต์ฟีดชุมชน</label>
              <span className="text-[10px] text-slate-500 font-medium">💬 โพสต์ทั่วไปจะไม่ขึ้นบนแผนที่รอบตัว</span>
            </div>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value as Post['category'];
                if (val === 'alert' && onOpenReportAlert) {
                  onClose();
                  onOpenReportAlert();
                  return;
                }
                setCategory(val);
              }}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="news">📰 ข่าวสาร / ประกาศสำคัญ</option>
              <option value="general">💬 พูดคุยทั่วไปในชุมชน</option>
              <option value="help">🤝 ขอความช่วยเหลือ / ของหาย</option>
              <option value="activity">🎉 กิจกรรม / รวมกลุ่ม</option>
              <option value="alert">🚨 แจ้งเหตุด่วน (สลับไปปักหมุดบนแผนที่ Google Maps)</option>
            </select>
          </div>

          {/* Emergency Alert Switch Helper Banner */}
          {onOpenReportAlert && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 text-xs">
              <div className="text-rose-900 leading-tight">
                <span className="font-bold">ต้องการแจ้งเหตุด่วน อุบัติเหตุ หรือภัยพิบัติ?</span>
                <p className="text-[11px] text-rose-700 mt-0.5">ระบบจะปักหมุดบนแผนที่และมีปุ่มนำทาง Google Maps</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReportAlert();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold shrink-0 transition active:scale-95 shadow-xs"
              >
                ปักหมุดแจ้งเหตุ
              </button>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อโพสต์ *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น แจ้งเตือนน้ำท่วมขัง, ปิดถนนซ่อมแซม, กิจกรรมชุมชน..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">เนื้อหา *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="เล่ารายละเอียด สิ่งที่เกิดขึ้น หรือข้อมูลที่เป็นประโยชน์ต่อเพื่อนบ้าน..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">แท็ก (คั่นด้วยจุลภาค ,)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="เช่น ข่าวชุมชน, ของหาย, เตือนภัย, แนะนำร้านค้า"
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isProcessingMedia}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              โพสต์เลย
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
