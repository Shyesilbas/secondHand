import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../features/auth/services/authService';
import { ROUTES } from '../../constants/routes';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('E-posta adresi gereklidir');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          E-posta Gönderildi
        </h2>
        <p className="text-gray-600 mb-6">
          Şifre sıfırlama talimatları <strong>{email}</strong> adresine gönderildi.
          E-posta kutunuzu kontrol edin.
        </p>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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