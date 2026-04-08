import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowRight as ArrowRightIcon,
    Calendar as CalendarIcon,
    Phone as PhoneIcon,
} from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { useAuth } from '../AuthContext.jsx';
import { authService } from '../services/authService.js';
import { useGenderEnum } from '../../common/hooks/useGenderEnum.js';
import AuthInput from '../../common/components/ui/AuthInput.jsx';
import AuthButton from '../../common/components/ui/AuthButton.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';

const OAuthCompletePage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { genders, isLoading: gendersLoading } = useGenderEnum();

    const [form, setForm] = useState({ phone: '', gender: '', birthdate: '' });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const baseInfo = useMemo(() => ({
        email: params.get('email') || '',
        name: params.get('name') || '',
        surname: params.get('surname') || '',
        picture: params.get('picture') || '',
    }), [params]);

    const initials = [baseInfo.name?.[0], baseInfo.surname?.[0]].filter(Boolean).join('').toUpperCase();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const next = {};
        if (!form.phone.trim()) next.phone = 'Phone number is required';
        if (!form.gender) next.gender = 'Gender is required';
        if (!form.birthdate.trim()) next.birthdate = 'Birth date is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (!baseInfo.email) {
            setErrors({ submit: 'Missing email from OAuth provider.' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: baseInfo.name,
                surname: baseInfo.surname,
                email: baseInfo.email,
                phoneNumber: form.phone,
                gender: form.gender,
                birthdate: form.birthdate,
            };
            const loginResponse = await authService.completeOAuth(payload);
            await login(loginResponse);
            navigate(ROUTES.DASHBOARD, { replace: true });
        } catch (err) {
            setErrors({ submit: err.response?.data?.message || 'Registration failed. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-secondary-900 flex items-center justify-center shrink-0">
                    <span className="text-amber-400 text-base font-bold leading-none">S</span>
                </div>
                <span className="text-lg font-bold text-secondary-900 tracking-tight">SecondHand</span>
            </div>

            {/* User avatar + header */}
            <div className="flex items-center gap-4 mb-6">
                {baseInfo.picture ? (
                    <img
                        src={baseInfo.picture}
                        alt={baseInfo.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-secondary-200"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center shrink-0">
                        <span className="text-amber-700 font-bold text-sm">{initials || '?'}</span>
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
                        Almost there, {baseInfo.name}!
                    </h1>
                    <p className="mt-0.5 text-sm text-secondary-500">
                        Just a few more details to complete your account.
                    </p>
                </div>
            </div>

            {/* Error banner */}
            {errors.submit && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {errors.submit}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="text-[11px] font-semibold text-secondary-400 uppercase tracking-widest">
                    Missing Information
                </p>

                {/* Read-only prefilled fields */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-secondary-400">First Name</label>
                        <div className="px-3 py-2.5 rounded-xl bg-secondary-50 border border-secondary-200 text-sm text-secondary-500">
                            {baseInfo.name || '—'}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-secondary-400">Last Name</label>
                        <div className="px-3 py-2.5 rounded-xl bg-secondary-50 border border-secondary-200 text-sm text-secondary-500">
                            {baseInfo.surname || '—'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-secondary-400">Email</label>
                    <div className="px-3 py-2.5 rounded-xl bg-secondary-50 border border-secondary-200 text-sm text-secondary-500">
                        {baseInfo.email || '—'}
                    </div>
                </div>

                <div className="border-t border-secondary-100 pt-4 flex flex-col gap-4">
                    <AuthInput
                        label="Phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+90 5XX XXX XX XX"
                        required
                        error={errors.phone}
                        leftIcon={<PhoneIcon className="h-4 w-4" />}
                        inputClassName="rounded-xl"
                        labelClassName="text-secondary-700 text-xs"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-secondary-700">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            {gendersLoading ? (
                                <div className="flex items-center gap-2 px-3 py-2.5 border border-secondary-200 rounded-xl text-sm text-secondary-500">
                                    <LoadingIndicator size="h-4 w-4" />
                                    <span>Loading...</span>
                                </div>
                            ) : (
                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-secondary-200 rounded-xl text-sm text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    required
                                >
                                    <option value="">Select gender</option>
                                    {genders.map((g) => (
                                        <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                </select>
                            )}
                            {errors.gender && (
                                <p className="text-xs text-red-600">{errors.gender}</p>
                            )}
                        </div>

                        <AuthInput
                            label="Birth Date"
                            name="birthdate"
                            value={form.birthdate}
                            onChange={handleChange}
                            placeholder="DD/MM/YYYY"
                            required
                            error={errors.birthdate}
                            leftIcon={<CalendarIcon className="h-4 w-4" />}
                            inputClassName="rounded-xl"
                            labelClassName="text-secondary-700 text-xs"
                        />
                    </div>
                </div>

                <AuthButton
                    type="submit"
                    isLoading={submitting}
                    size="lg"
                    className="rounded-xl mt-1"
                    rightIcon={!submitting ? <ArrowRightIcon className="h-4 w-4" /> : null}
                >
                    {submitting ? 'Saving...' : 'Save and Continue'}
                </AuthButton>
            </form>
        </div>
    );
};

export default OAuthCompletePage;
