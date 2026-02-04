import React, {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from './AuthContext.jsx';
import {useNotification} from '../notification/NotificationContext.jsx';
import {authService} from './services/authService.js';
import {ROUTES} from '../common/constants/routes.js';
import {API_BASE_URL} from '../common/constants/apiEndpoints.js';
import {
    ArrowRightIcon,
    CheckCircleIcon,
    EnvelopeIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {LoginRequestDTO} from './auth.js';

const LoginPage = () => {
    const [formData, setFormData] = useState({ ...LoginRequestDTO });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const notification = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || ROUTES.HOME;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await authService.login(formData.email, formData.password, formData.rememberMe);
            await login(response);

            notification.showSuccess('Welcome Back!', 'You have successfully logged in.', { autoCloseDelay: 1000 });
            setTimeout(() => navigate(from, { replace: true }), 1000);
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
            notification.showError('Login Failed', message, { autoClose: false });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-[#F8FAFC] flex items-start justify-center pt-4 px-4 pb-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-[2rem] p-6 shadow-2xl shadow-slate-200/50">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">Welcome Back</h1>
                        <p className="text-xs text-slate-600 tracking-tight">Sign in to continue to your account</p>
                    </div>
                    <form className="space-y-3.5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1.5 tracking-tight">
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-2xl text-sm tracking-tight bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${
                                        errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                    }`}
                                    placeholder="Email"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-600 tracking-tight">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1.5 tracking-tight">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-2xl text-sm tracking-tight bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${
                                        errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                    }`}
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-4 w-4 text-slate-400 hover:text-indigo-600 transition-colors" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4 text-slate-400 hover:text-indigo-600 transition-colors" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-600 tracking-tight">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-1.5 text-slate-700 tracking-tight">
                                    Remember me
                                </label>
                            </div>
                            <Link
                                to={ROUTES.FORGOT_PASSWORD}
                                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors tracking-tight"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-5 py-3 border border-transparent rounded-2xl shadow-xl shadow-slate-900/10 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 tracking-tight"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="tracking-tight">Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span className="tracking-tight">Sign In</span>
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-white text-slate-500 tracking-tight">Or continue with</span>
                            </div>
                        </div>

                        <a
                            href={`${API_BASE_URL}/auth/oauth2/google`}
                            className="w-full inline-flex items-center justify-center px-5 py-2.5 border border-slate-100 rounded-2xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 tracking-tight"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                                <path d="M533.5 278.4c0-18.5-1.7-36.4-4.9-53.6H272.1v101.5h147.1c-6.3 34.2-25.5 63.2-54.4 82.6v68h87.7c51.3-47.2 81-116.8 81-198.5z" fill="#4285F4"/>
                                <path d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.4l-87.7-68c-24.3 16.3-55.5 26-91.9 26-70.7 0-130.6-47.7-152-111.8h-90.9v70.2c44.7 88.6 136.2 148.9 243 148.9z" fill="#34A853"/>
                                <path d="M120.1 325.1c-10.2-30.2-10.2-62.9 0-93.1V161.8h-90.9c-38.2 76.3-38.2 168.4 0 244.7l90.9-81.4z" fill="#FBBC05"/>
                                <path d="M272.1 107.7c39.8-.6 78 14.5 107.3 42.4l80.1-80.1C406.9 24 344.9-.1 272.1 0 165.3 0 73.8 60.2 29.2 148.8l90.9 70.2c21.4-64.1 81.3-111.8 152-111.3z" fill="#EA4335"/>
                            </svg>
                            <span className="tracking-tight">Continue with Google</span>
                        </a>

                        <div className="text-center pt-1">
                            <p className="text-xs text-slate-600 tracking-tight">
                                Don't have an account?{' '}
                                <Link 
                                    to={ROUTES.REGISTER} 
                                    className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight"
                                >
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </form>
                    
                    <div className="text-center mt-4 pt-4 border-t border-slate-100 flex items-center justify-center space-x-5">
                        <div className="flex items-center space-x-1.5">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Secure</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <ShieldCheckIcon className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Verified</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
