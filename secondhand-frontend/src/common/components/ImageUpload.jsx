import { useTranslation } from "react-i18next";
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Loader2, Upload, X, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import apiClient from '../services/api/interceptors.js';
import logger from '../utils/logger.js';
import { compressImage } from '../utils/imageOptimizer.js';
const ImageUpload = ({
  onImageUpload,
  onImageRemove,
  imageUrl,
  disabled = false
}) => {
  const {
    t
  } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const {
    isAuthenticated
  } = useAuthState();
  const handleFileSelect = async file => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    if (!isAuthenticated) {
      setError('Please login to upload images.');
      return;
    }
    setIsUploading(true);
    try {
      // Compress the image before uploading
      const compressedFile = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8
      });
      const formData = new FormData();
      formData.append('image', compressedFile);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await apiClient.post(API_ENDPOINTS.IMAGES.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        signal: controller.signal,
        timeout: 30000
      });
      clearTimeout(timeoutId);
      onImageUpload(response.data.imageUrl);
    } catch (error) {
      logger.error('Image upload error:', error);
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        setError('Upload timed out. Please try again.');
      } else {
        const errorMessage = error.response?.data?.message || error.userMessage || 'Failed to upload image.';
        setError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  };
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove();
    }
    setError(null);
  };
  return <div className="w-full">
      <AnimatePresence mode="wait">
        {imageUrl ? <motion.div key="preview" initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} className="relative group">
            <div className="w-full h-72 bg-zinc-50/50 rounded-xl overflow-hidden border border-zinc-200/40 flex items-center justify-center shadow-sm">
              <img src={imageUrl} alt={t("product")} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]" />
            </div>
            {!disabled && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-5 rounded-xl">
                <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} type="button" onClick={handleRemoveImage} className="bg-white/95 backdrop-blur-sm text-red-600 px-5 py-2.5 rounded-xl text-[13px] font-medium shadow-lg hover:bg-white transition-colors flex items-center gap-1.5 focus:outline-none">
                  <X className="w-4 h-4" />{t("remove")}</motion.button>
              </div>}
            {/* Success badge */}
            <motion.div initial={{
          opacity: 0,
          scale: 0,
          y: 10
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} transition={{
          delay: 0.2,
          type: 'spring',
          stiffness: 400,
          damping: 20
        }} className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
              <CheckCircle2 className="w-3 w-3" />{t("uploaded")}</motion.div>
          </motion.div> : <motion.div key="dropzone" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className={`
              w-full h-56 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden
              ${dragActive ? 'bg-zinc-50 shadow-inner' : 'bg-white hover:bg-zinc-50/50'}
              ${disabled ? 'cursor-not-allowed opacity-40 bg-zinc-50' : ''}
              ${isUploading ? 'pointer-events-none' : ''}
              ${error ? 'bg-red-50/30' : ''}
            `} style={{
        border: dragActive ? '2px dashed #71717a' : error ? '2px dashed #fca5a5' : '2px dashed #d4d4d8'
      }} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={handleClick}>
            {/* Animated background pattern when dragging */}
            {dragActive && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 0.05
        }} className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #18181b 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />}

            {isUploading ? <div className="flex flex-col items-center relative z-10">
                <div className="relative mb-4">
                  <div className="w-12 h-12 rounded-full border-[3px] border-zinc-200 border-t-zinc-600 animate-spin" />
                </div>
                <p className="text-[13px] font-medium text-zinc-600">{t("uploading")}</p>
                <p className="mt-1 text-[11px] text-zinc-400">{t("compressing_and_uploading_your_image")}</p>
              </div> : <div className="flex flex-col items-center p-6 text-center relative z-10">
                <motion.div animate={dragActive ? {
            scale: 1.1,
            y: -4
          } : {
            scale: 1,
            y: 0
          }} transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20
          }} className={`p-3.5 rounded-xl mb-3 transition-colors ${dragActive ? 'bg-zinc-200/60' : 'bg-zinc-100/60'}`}>
                  {dragActive ? <Upload className="w-6 h-6 text-zinc-600" /> : <ImageIcon className="w-6 h-6 text-zinc-400" />}
                </motion.div>
                <p className="text-[13px] font-medium text-zinc-700 mb-1">
                  {dragActive ? 'Drop to upload' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-[11px] text-zinc-400">{t("png_jpg_or_gif_max_10mb")}</p>
              </div>}
          </motion.div>}
      </AnimatePresence>
        
      <AnimatePresence>
        {error && <motion.div initial={{
        opacity: 0,
        y: -4
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -4
      }} className="mt-3 px-3.5 py-2.5 bg-red-50/80 border border-red-100 rounded-xl flex items-start gap-2 text-[12px] text-red-600">
            <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>}
      </AnimatePresence>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={disabled || isUploading} />
    </div>;
};
export default ImageUpload;