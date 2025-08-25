import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../features/auth/services/authService';
import { ROUTES } from '../../constants/routes';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { RegisterRequestDTO } from '../../types/auth';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { enumService } from '../../services/enumService';
import AgreementsSection from '../../components/agreements/AgreementsSection';
import AgreementModal from '../../components/agreements/AgreementModal';
import { useRegisterAgreements } from '../../features/auth/hooks/useRegisterAgreements';
import { validateRegisterForm } from '../../utils/validators/registerValidator';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ ...RegisterRequestDTO, confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [genderOptions, setGenderOptions] = useState([]);

    const {
        agreements,
        agreementsLoading,
        acceptedAgreements,
        setAcceptedAgreements,
        selectedAgreement,
        showAgreementModal,
        handleAgreementToggle,
        handleAgreementClick,
        handleCloseModal
    } = useRegisterAgreements();

    const navigate = useNavigate();
    const notification = useNotification();

    useEffect(() => {
        const loadGenders = async () => {
            try {
                const genders = await enumService.getGenders();
                setGenderOptions(Array.isArray(genders) ? genders : []);
            } catch {
                setGenderOptions([]);
            }
        };
        loadGenders();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = validateRegisterForm(formData, acceptedAgreements, agreements);
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
            
            if (response.welcomeMessage) notification.showSuccess('Register Successful', response.welcomeMessage);
            if (response.importantMessage) notification.showInfo('Important', response.importantMessage);
            if (response.informationMessage) notification.showInfo('Information', response.informationMessage);

            navigate(ROUTES.LOGIN, { state: { message: 'Registration successful! You can now log in.' } });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            notification.showError('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
                <p className="text-gray-600">Join to the community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <AuthInput label="Ad" type="text" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
                    <AuthInput label="Soyad" type="text" name="surname" value={formData.surname} onChange={handleChange} error={errors.surname} required />
                </div>

                <AuthInput label="E-posta Adresi" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                <AuthInput label="Telefon Numarası" type="tel" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} required />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.gender ? 'border-red-300' : 'border-gray-300'}`}
                        required
                    >
                        <option value="" disabled>Select Gender...</option>
                        {genderOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                </div>

                <div className="relative">
                    <AuthInput label="Şifre" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} error={errors.password} required />
                    <button type="button" className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>

                <div className="relative">
                    <AuthInput label="Şifre Tekrarı" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
                    <button type="button" className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>

                {!agreementsLoading && (
                    <AgreementsSection
                        agreements={agreements}
                        acceptedAgreements={acceptedAgreements}
                        onToggle={handleAgreementToggle}
                        onRead={handleAgreementClick}
                        error={errors.agreements}
                    />
                )}

                {agreementsLoading && (
                    <div className="flex justify-center items-center py-8">
                        <LoadingIndicator size="h-8 w-8" />
                        <span className="ml-2 text-gray-600">Loading Agreements...</span>
                    </div>
                )}

                {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                )}

                <AuthButton type="submit" isLoading={isLoading} className="w-full">
                    {isLoading ? 'Registering...' : 'Register'}
                </AuthButton>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
                </div>

                <div className="text-center">
                    <p className="text-gray-600">
                        Already Have an account?{' '}
                        <Link to={ROUTES.LOGIN} className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </form>

            <AgreementModal agreement={selectedAgreement} open={showAgreementModal} onClose={handleCloseModal} />
        </div>
    );
};

export default RegisterPage;
