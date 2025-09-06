import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { useNotification } from '../notification/NotificationContext.jsx';
import { authService } from './services/authService.js';
import { ROUTES } from '../common/constants/routes.js';
import AuthInput from '../common/components/ui/AuthInput.jsx';
import AuthButton from '../common/components/ui/AuthButton.jsx';
import PasswordInput from '../common/components/ui/PasswordInput.jsx';
import Alert from '../common/Alert.jsx';
import { LoginRequestDTO } from './auth.js';
import { API_BASE_URL } from '../common/constants/apiEndpoints.js';

const LoginPage = () => {
    const [formData, setFormData] = useState({ ...LoginRequestDTO });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const notification = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || ROUTES.HOME;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'E-mail is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await authService.login(formData.email, formData.password);
            await login(response);

            notification.showSuccess('Login Successful', 'Welcome back!', { autoCloseDelay: 1000 });
            setTimeout(() => navigate(from, { replace: true }), 1000);
        } catch (error) {
            console.error('Login error:', error);

            const message = error.response?.data?.message || 'Login failed. Please try again.';
            notification.showError('Login Failed', message, { autoClose: false });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome</h2>
                <p className="text-text-secondary">Login to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                    label="E-mail"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sample@email.com"
                    error={errors.email && <Alert type="error" message={errors.email} />}
                    required
                />

                <PasswordInput
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    error={errors.password && <Alert type="error" message={errors.password} />}
                    required
                />

                <div className="text-right">
                    <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-indigo-600 hover:text-indigo-500">
                        Forgot Your Password?
                    </Link>
                </div>

                <AuthButton type="submit" isLoading={isLoading} className="w-full">
                    {isLoading ? 'Login...' : 'Login'}
                </AuthButton>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-header-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-text-muted">Or</span>
                    </div>
                </div>

                <div>
                    <a
                        href={`${API_BASE_URL}/auth/oauth2/google`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-header-border rounded-md shadow-sm text-sm font-medium text-text-secondary bg-white hover:bg-app-bg"
                    >
                        Continue with Google
                    </a>
                </div>

                <div className="text-center">
                    <p className="text-text-secondary">
                        No Account?{' '}
                        <Link to={ROUTES.REGISTER} className="font-medium text-indigo-600 hover:text-indigo-500">
                            Register NOW
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
