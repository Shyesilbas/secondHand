import { useTranslation } from "react-i18next";
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, X, CheckCircle2 } from 'lucide-react';
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
  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {imageUrl ? (
          <div key="preview" className="relative overflow-hidden rounded border border-border-light bg-background-secondary">
            <div className="flex h-56 w-full items-center justify-center p-3">
              <img
                src={imageUrl}
                alt={t("product", "Product")}
                className="h-full w-full object-contain"
              />
            </div>
            {!disabled && (
              <div className="flex items-center justify-between border-t border-border-light bg-background-primary px-3.5 py-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                  <span>{t("uploaded", "Yüklendi")}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-1 rounded border border-border-light bg-background-primary px-2.5 py-1 text-xs font-semibold text-status-error transition-colors hover:bg-background-secondary"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>{t("remove", "Kaldır")}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            key="dropzone"
            className={`relative flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded border border-dashed transition-colors ${
              dragActive
                ? 'border-primary bg-background-secondary'
                : error
                ? 'border-status-error bg-background-secondary/30'
                : 'border-border bg-background-secondary/20 hover:border-card-border-hover hover:bg-background-secondary/50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${isUploading ? 'pointer-events-none' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            {isUploading ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
                <p className="text-xs font-semibold text-text-primary">{t("uploading", "Yükleniyor...")}</p>
                <p className="mt-0.5 text-xs text-text-muted">{t("compressing_and_uploading_your_image", "Görsel işleniyor ve yükleniyor")}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center p-4 text-center">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded bg-background-tertiary text-text-secondary">
                  {dragActive ? <Upload className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                </div>
                <p className="text-xs font-semibold text-text-primary">
                  {dragActive ? t("drop_to_upload", "Yüklemek için bırakın") : t("drag_drop_click", "Görsel yüklemek için sürükleyin veya seçin")}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">{t("png_jpg_or_gif_max_10mb", "PNG, JPG veya GIF (maks. 10MB)")}</p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-2.5 flex items-start gap-2 rounded border border-border-light bg-background-secondary px-3 py-2 text-xs text-status-error">
          <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};
export default ImageUpload;