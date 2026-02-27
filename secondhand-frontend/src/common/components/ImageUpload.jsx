import React, {useRef, useState} from 'react';
import {Image as ImageIcon, Loader2, Upload, X} from 'lucide-react';
import {API_ENDPOINTS} from '../constants/apiEndpoints.js';
import {useAuthState} from '../../auth/AuthContext.jsx';
import apiClient from '../services/api/interceptors.js';
import logger from '../utils/logger.js';

const ImageUpload = ({ onImageUpload, onImageRemove, imageUrl, disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { isAuthenticated } = useAuthState();

  const handleFileSelect = async (file) => {
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
      const formData = new FormData();
      formData.append('image', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await apiClient.post(API_ENDPOINTS.IMAGES.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal,
        timeout: 30000,
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e) => {
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
      <div className="bg-white rounded-lg border border-gray-100 p-5">
        <div className="pb-3 border-b border-gray-50 mb-5">
          <h3 className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em]">Photo</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Upload a product image</p>
        </div>

        {imageUrl ? (
          <div className="relative group">
            <div className="w-full h-72 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Product"
                className="w-full h-full object-contain"
              />
            </div>
            {!disabled && (
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-white text-red-600 px-4 py-2 rounded-lg text-[13px] font-medium shadow-sm hover:bg-red-50 transition-colors flex items-center gap-1.5 focus:outline-none"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`
              w-full h-56 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-150
              ${dragActive ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}
              ${disabled ? 'cursor-not-allowed opacity-40 bg-gray-50' : ''}
              ${isUploading ? 'pointer-events-none' : ''}
              ${error ? 'border-red-300 bg-red-50/30' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
                <p className="text-[13px] font-medium text-gray-500">Uploading…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center p-6 text-center">
                <div className={`p-3 rounded-lg mb-3 transition-colors ${dragActive ? 'bg-gray-200' : 'bg-gray-50'}`}>
                  {dragActive ? (
                    <Upload className="w-6 h-6 text-gray-500" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <p className="text-[13px] font-medium text-gray-700 mb-1">
                  {dragActive ? 'Drop to upload' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-[11px] text-gray-400">
                  PNG, JPG or GIF (max 10MB)
                </p>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-3 px-3 py-2 bg-red-50/80 border border-red-100 rounded-lg flex items-start gap-2 text-[12px] text-red-600">
            <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
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
    </div>
  );
};

export default ImageUpload;
