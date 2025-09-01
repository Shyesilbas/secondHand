import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from './services/authService.js';
import { ROUTES } from '../common/constants/routes.js';
import AuthInput from '../common/components/ui/AuthInput.jsx';
import AuthButton from '../common/components/ui/AuthButton.jsx';
import { ForgotPasswordRequestDTO } from './auth.js';
import { useNotification } from '../notification/NotificationContext.jsx';

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    ...ForgotPasswordRequestDTO
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resetForm, setResetForm] = useState({ email: '', verificationCode: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const notification = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError('E-posta adresi gereklidir');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await authService.forgotPassword(formData.email);
      // In dev, backend sends verificationCode for display
      if (res?.verificationCode) setVerificationCode(res.verificationCode);
      setResetForm(prev => ({ ...prev, email: formData.email, verificationCode: res?.verificationCode || '' }));
      setSuccess(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Bir hata oluştu';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Doğrulama Kodu Oluşturuldu</h2>
        <p className="text-gray-600 mb-2">Dev ortamında olduğumuz için kodu burada gösteriyoruz.</p>
        {verificationCode && (
          <div className="mb-4 p-3 border rounded bg-gray-50">
            <div className="text-sm text-gray-700">Doğrulama Kodu</div>
            <div className="text-xl font-mono tracking-widest">{verificationCode}</div>
          </div>
        )}
        <p className="text-gray-600 mb-6">Aşağıdan yeni şifrenizi belirleyebilirsiniz.</p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!resetForm.newPassword || resetForm.newPassword !== resetForm.confirmPassword) {
              return setError('Şifreler eşleşmiyor');
            }
            try {
              await authService.resetPassword({
                email: resetForm.email,
                verificationCode: resetForm.verificationCode,
                newPassword: resetForm.newPassword,
                confirmPassword: resetForm.confirmPassword,
              });
              setError('');
              notification.showSuccess('Başarılı', 'Şifreniz güncellendi. Giriş sayfasına yönlendiriliyorsunuz...', { autoCloseDelay: 1200 });
              setTimeout(() => {
                window.location.href = ROUTES.LOGIN;
              }, 1200);
            } catch (err) {
              setError(err.response?.data?.message || 'Şifre sıfırlama başarısız');
            }
          }}
          className="space-y-4 text-left"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">E-posta</label>
            <input className="mt-1 block w-full border rounded px-3 py-2" value={resetForm.email} onChange={(e)=> setResetForm({...resetForm, email: e.target.value})}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Doğrulama Kodu</label>
            <input className="mt-1 block w-full border rounded px-3 py-2" value={resetForm.verificationCode} onChange={(e)=> setResetForm({...resetForm, verificationCode: e.target.value})}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
            <input type="password" className="mt-1 block w-full border rounded px-3 py-2" value={resetForm.newPassword} onChange={(e)=> setResetForm({...resetForm, newPassword: e.target.value})}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Yeni Şifre (Tekrar)</label>
            <input type="password" className="mt-1 block w-full border rounded px-3 py-2" value={resetForm.confirmPassword} onChange={(e)=> setResetForm({...resetForm, confirmPassword: e.target.value})}/>
          </div>
          <AuthButton type="submit" className="w-full">Yeni Şifreyi Kaydet</AuthButton>
        </form>
        <Link
          to={ROUTES.LOGIN}
          className="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          ← Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Şifrenizi mi unuttunuz?
        </h2>
        <p className="text-gray-600">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="E-posta Adresi"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            email: e.target.value
          }))}
          placeholder="ornek@email.com"
          error={error}
          required
        />

        <AuthButton
          type="submit"
          isLoading={isLoading}
          className="w-full"
        >
          {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
        </AuthButton>

        <div className="text-center">
          <Link
            to={ROUTES.LOGIN}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Giriş sayfasına dön
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;