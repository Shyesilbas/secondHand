import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { getToken, isCookieBasedAuth } from '../services/storage/tokenStorage.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const ImageUpload = ({ onImageUpload, onImageRemove, imageUrl, disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { isAuthenticated } = useAuth();

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

    const token = getToken();
    const isCookieAuth = isCookieBasedAuth();

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const requestOptions = {
        method: 'POST',
        body: formData,
        credentials: 'include'
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      requestOptions.signal = controller.signal;

      if (!isCookieAuth && token) {
        requestOptions.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.IMAGES.UPLOAD}`, requestOptions);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = 'Failed to upload image.';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // ignore
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onImageUpload(data.imageUrl);
    } catch (error) {
      console.error('Image upload error:', error);
      if (error.name === 'AbortError') {
        setError('Upload timed out. Please try again.');
      } else {
        setError(error.message || 'Failed to upload image.');
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
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-indigo-500" />
        Product Photo
      </label>
      
      {imageUrl ? (
        <div className="relative group">
          <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 flex items-center justify-center shadow-inner">
            <img
              src={imageUrl}
              alt="Product"
              className="w-full h-full object-contain"
            />
          </div>
          {!disabled && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-red-50 transition-colors flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              >
                <X className="w-4 h-4" />
                Remove Photo
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`
            w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden
            ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
            ${disabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : ''}
            ${isUploading ? 'pointer-events-none' : ''}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {isUploading ? (
            <div className="flex flex-col items-center z-10">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-indigo-600">Uploading your image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center z-10 p-6 text-center">
              <div className={`p-4 rounded-full mb-4 transition-colors ${dragActive ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-indigo-50'}`}>
                {dragActive ? (
                  <Upload className="w-8 h-8 text-indigo-600" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-base font-semibold text-gray-700 mb-1">
                {dragActive ? 'Drop it like it\'s hot!' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 max-w-xs">
                SVG, PNG, JPG or GIF (max. 10MB)
              </p>
            </div>
          )}
          
          {/* Background decoration */}
          {!isUploading && !imageUrl && (
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
               <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-600 animate-fade-in">
          <X className="w-4 h-4 shrink-0 mt-0.5" />
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
