import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../features/auth/services/authService';
import { agreementService } from '../../services/agreementService';
import { ROUTES } from '../../constants/routes';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';
import { EyeIcon, EyeSlashIcon, DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline';
import { RegisterRequestDTO, RegisterResponseDTO } from '../../types/auth';
import { AGREEMENT_TYPE_LABELS } from '../../types/agreements';
import { enumService } from '../../services/enumService';

const RegisterPage = () => {
    const fallbackGenderOptions = [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
    ];
    const [formData, setFormData] = useState({
        ...RegisterRequestDTO,
        confirmPassword: '' // Additional field for frontend validation
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [agreements, setAgreements] = useState([]);
    const [agreementsLoading, setAgreementsLoading] = useState(true);
    const [acceptedAgreements, setAcceptedAgreements] = useState(new Set());
    const [selectedAgreement, setSelectedAgreement] = useState(null);
    const [showAgreementModal, setShowAgreementModal] = useState(false);
    const [genderOptions, setGenderOptions] = useState([]);

    const navigate = useNavigate();
    const notification = useNotification();

    useEffect(() => {
        loadRequiredAgreements();
    }, []);

    useEffect(() => {
        const loadGenders = async () => {
            try {
                const genders = await enumService.getGenders();
                if (Array.isArray(genders) && genders.length > 0) {
                    setGenderOptions(genders);
                } else {
                    setGenderOptions(fallbackGenderOptions);
                }
            } catch (e) {
                console.error('Error loading genders:', e);
                setGenderOptions(fallbackGenderOptions);
            }
        };
        loadGenders();
    }, []);

    const loadRequiredAgreements = async () => {
        try {
            setAgreementsLoading(true);
            const requiredAgreements = await agreementService.getRequiredAgreements();
            setAgreements(requiredAgreements);
        } catch (error) {
            console.error('Error loading agreements:', error);
            notification.showError('Hata', 'Sözleşmeler yüklenirken bir hata oluştu.');
        } finally {
            setAgreementsLoading(false);
        }
    };

    const handleAgreementToggle = (agreementId) => {
        setAcceptedAgreements(prev => {
            const newSet = new Set(prev);
            if (newSet.has(agreementId)) {
                newSet.delete(agreementId);
            } else {
                newSet.add(agreementId);
            }
            return newSet;
        });
    };

    const handleAgreementClick = (agreement) => {
        setSelectedAgreement(agreement);
        setShowAgreementModal(true);
    };

    const handleCloseModal = () => {
        setShowAgreementModal(false);
        setSelectedAgreement(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Ad gereklidir';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Ad en az 2 karakter olmalıdır';
        }

        if (!formData.surname.trim()) {
            newErrors.surname = 'Soyad gereklidir';
        } else if (formData.surname.trim().length < 2) {
            newErrors.surname = 'Soyad en az 2 karakter olmalıdır';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-posta adresi gereklidir';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Telefon numarası gereklidir';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Geçerli bir telefon numarası giriniz';
        }

        if (!formData.gender || !formData.gender.trim()) {
            newErrors.gender = 'Gender is required';
        } else if (!(genderOptions.length ? genderOptions : fallbackGenderOptions).some(opt => opt.value === formData.gender)) {
            newErrors.gender = 'Select a valid gender';
        }

        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Şifre en az 8 karakter olmalıdır';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler uyuşmuyor';
        }

        // Check if all required agreements are accepted
        if (acceptedAgreements.size !== agreements.length) {
            newErrors.agreements = 'Tüm gerekli sözleşmeleri onaylamanız gerekmektedir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const registerData = {
                name: formData.name.trim(),
                surname: formData.surname.trim(),
                email: formData.email.trim(),
                password: formData.password,
                gender: formData.gender,
                phoneNumber: formData.phone.replace(/\s/g, ''),
                agreementsAccepted: acceptedAgreements.size === agreements.length
            };

            const response = await authService.register(registerData);
            setSuccess(true);
            
            // Display all messages from backend response
            if (response.welcomeMessage) {
                notification.showSuccess('Kayıt Başarılı', response.welcomeMessage);
            }
            if (response.importantMessage) {
                notification.showInfo('Önemli', response.importantMessage);
            }
            if (response.informationMessage) {
                notification.showInfo('Bilgi', response.informationMessage);
            }

            setTimeout(() => {
                navigate(ROUTES.LOGIN, {
                    state: { message: 'Registration successful! You can now log in.' }
                });
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            
            const errorMessage = error.response?.data?.message || 'Registration failed';
            
            // Check for specific error types
            if (error.response?.status === 400) {
                // Bad request - validation errors, duplicate email, etc.
                if (errorMessage.toLowerCase().includes('email') && 
                    errorMessage.toLowerCase().includes('already')) {
                    notification.showError('E-posta Hatası', 'Bu e-posta adresi zaten kayıtlı. Farklı bir e-posta kullanın veya giriş yapmayı deneyin.');
                } else if (errorMessage.toLowerCase().includes('validation') ||
                          errorMessage.toLowerCase().includes('invalid')) {
                    notification.showError('Doğrulama Hatası', errorMessage);
                } else {
                    notification.showError('Hata', 'Lütfen bilgilerinizi kontrol edin ve tekrar deneyin.');
                }
            } else if (error.response?.status === 409) {
                // Conflict - duplicate user
                notification.showError('Hesap Çakışması', 'Bu e-posta ile zaten bir hesap var. Farklı bir e-posta kullanın veya giriş yapmayı deneyin.');
            } else if (error.response?.status >= 500) {
                // Server errors
                notification.showError('Sunucu Hatası', 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
            } else {
                // Other errors or network issues
                notification.showError('Hata', errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Kayıt Başarılı!
                </h2>
                <p className="text-gray-600 mb-4">
                    Hesabınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Hesap Oluşturun
                </h2>
                <p className="text-gray-600">
                    SecondHand topluluğuna katılın
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Surname Row */}
                <div className="grid grid-cols-2 gap-4">
                    <AuthInput
                        label="Ad"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Adınız"
                        error={errors.name}
                        required
                    />
                    <AuthInput
                        label="Soyad"
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        placeholder="Soyadınız"
                        error={errors.surname}
                        required
                    />
                </div>

                {/* Email */}
                <AuthInput
                    label="E-posta Adresi"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    error={errors.email}
                    required
                />

                {/* Phone */}
                <AuthInput
                    label="Telefon Numarası"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0555 123 45 67"
                    error={errors.phone}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange} 
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.gender ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                    >
                        <option value="" disabled>Select Gender...</option>
                        {(genderOptions.length ? genderOptions : fallbackGenderOptions).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                    )}
                </div>

                {/* Password */}
                <div className="relative">
                    <AuthInput
                        label="Şifre"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        error={errors.password}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                    <AuthInput
                        label="Şifre Tekrarı"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        error={errors.confirmPassword}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/* Agreements Section */}
                {!agreementsLoading && agreements.length > 0 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">
                                Agreements
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                You must agree to the following terms and conditions to register.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {agreements.map((agreement) => (
                                <div key={agreement.agreementId} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            id={`agreement-${agreement.agreementId}`}
                                            checked={acceptedAgreements.has(agreement.agreementId)}
                                            onChange={() => handleAgreementToggle(agreement.agreementId)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <label 
                                                    htmlFor={`agreement-${agreement.agreementId}`}
                                                    className="flex items-center space-x-2 cursor-pointer"
                                                >
                                                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                                                    <span className="font-medium text-gray-900">
                                                        {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
                                                    </span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAgreementClick(agreement)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Read Agreement
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Version: {agreement.version}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {errors.agreements && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{errors.agreements}</p>
                            </div>
                        )}
                    </div>
                )}

                {agreementsLoading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Sözleşmeler yükleniyor...</span>
                    </div>
                )}

                {/* Submit Error */}
                {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                )}

                {/* Submit Button */}
                <AuthButton
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
                </AuthButton>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">veya</span>
                    </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-gray-600">
                        Zaten hesabınız var mı?{' '}
                        <Link
                            to={ROUTES.LOGIN}
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Giriş yapın
                        </Link>
                    </p>
                </div>
            </form>

            {/* Agreement Modal */}
            {showAgreementModal && selectedAgreement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {AGREEMENT_TYPE_LABELS[selectedAgreement.agreementType]}
                            </h3>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="prose prose-sm max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: selectedAgreement.content }} />
                            </div>
                        </div>
                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;