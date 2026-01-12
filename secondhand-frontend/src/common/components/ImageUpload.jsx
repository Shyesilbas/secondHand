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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Fotoğraf</h3>
          <p className="text-xs text-slate-500 mt-1 tracking-tight">Ürün fotoğrafınızı yükleyin</p>
        </div>

        {imageUrl ? (
          <div className="relative group">
            <div className="w-full h-80 bg-slate-50 rounded-xl overflow-hidden border-2 border-slate-200 flex items-center justify-center">
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
                  className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-red-50 transition-colors flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 tracking-tight"
                >
                  <X className="w-5 h-5" />
                  Fotoğrafı Kaldır
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`
              w-full h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden
              ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'}
              ${disabled ? 'cursor-not-allowed opacity-50 bg-slate-50' : ''}
              ${isUploading ? 'pointer-events-none' : ''}
              ${error ? 'border-red-300 bg-red-50/50' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            {isUploading ? (
              <div className="flex flex-col items-center z-10">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm font-semibold text-indigo-600 tracking-tight">Yükleniyor...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center z-10 p-8 text-center">
                <div className={`p-5 rounded-2xl mb-5 transition-colors ${dragActive ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                  {dragActive ? (
                    <Upload className="w-10 h-10 text-indigo-600" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <p className="text-base font-semibold text-slate-900 mb-2 tracking-tight">
                  {dragActive ? 'Bırakmak için tıklayın' : 'Sürükle bırak veya tıkla'}
                </p>
                <p className="text-xs text-slate-500 tracking-tight">
                  PNG, JPG veya GIF (maks. 10MB)
                </p>
              </div>
            )}
            
            {!isUploading && !imageUrl && (
              <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
                 <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-600 tracking-tight">
            <X className="w-5 h-5 shrink-0 mt-0.5" />
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
