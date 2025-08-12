import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ResetPasswordRequestDTO } from '../../types/auth';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    ...ResetPasswordRequestDTO,
    token: token || '', // Initialize with token from URL
    confirmPassword: '' // Additional field for frontend validation
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Yeni Şifre Oluşturun
        </h2>
        <p className="text-gray-600">
          Hesabınız için güvenli bir şifre belirleyin
        </p>
      </div>
      <form className="space-y-6">
        <p className="text-gray-500">Reset password sayfası yakında tamamlanacak...</p>
      </form>
    </div>
  );
};

export default ResetPasswordPage;