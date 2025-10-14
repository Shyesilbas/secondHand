import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { getToken, isCookieBasedAuth } from '../services/storage/tokenStorage.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const ImageUpload = ({ onImageUpload, onImageRemove, imageUrl, disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen sadece resim dosyası seçin.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    if (!isAuthenticated) {
      alert('Lütfen önce giriş yapın.');
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

      // 30 saniye timeout ekle
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

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        let errorMessage = 'Resim yüklenirken hata oluştu';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} - ${responseText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }
      
      onImageUpload(data.imageUrl);
    } catch (error) {
      console.error('Image upload error:', error);
      if (error.name === 'AbortError') {
        alert('Resim yükleme işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.');
      } else {
        alert(error.message || 'Resim yüklenirken hata oluştu');
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
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Ürün Fotoğrafı
      </label>
      
      {imageUrl ? (
        <div className="relative">
          <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={imageUrl}
              alt="Ürün fotoğrafı"
              className="w-full h-full object-cover"
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`
            w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
            ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            ${isUploading ? 'pointer-events-none' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-600">Yükleniyor...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-3 mb-3">
                  {dragActive ? (
                    <Upload className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 text-center mb-1">
                  {dragActive ? 'Dosyayı buraya bırakın' : 'Fotoğraf yüklemek için tıklayın'}
                </p>
                <p className="text-xs text-gray-500 text-center">
                  veya sürükleyip bırakın
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  PNG, JPG, GIF (max. 10MB)
                </p>
              </div>
            </>
          )}
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
