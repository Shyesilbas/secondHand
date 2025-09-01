import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../common/constants/routes.js';
import { useAuth } from './AuthContext.jsx';
import { authService } from './services/authService.js';
import { API_ENDPOINTS } from '../common/constants/apiEndpoints.js';

const OAuthCompletePage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        phone: '',
        gender: '',
        birthdate: '', // dd/MM/yyyy
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const baseInfo = useMemo(() => ({
        email: params.get('email') || '',
        name: params.get('name') || '',
        surname: params.get('surname') || '',
        picture: params.get('picture') || '',
    }), [params]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!baseInfo.email) {
            setError('Missing email from OAuth provider.');
            return;
        }
        if (!form.phone || !form.gender || !form.birthdate) {
            setError('Please fill all fields.');
            return;
        }

        setSubmitting(true);
        try {
            // Register with collected fields
            // Complete OAuth registration without password
            const registerPayload = {
                name: baseInfo.name,
                surname: baseInfo.surname,
                email: baseInfo.email,
                phoneNumber: form.phone,
                gender: form.gender,
                birthdate: form.birthdate,
            };
            const loginResponse = await authService.completeOAuth(registerPayload);
            await login(loginResponse);
            navigate(ROUTES.DASHBOARD, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Complete Your Profile</h1>
            <p className="text-sm text-gray-600 mb-6">Welcome {baseInfo.name} {baseInfo.surname}. Please provide the missing required information to complete your account.</p>

            {error && (
                <div className="mb-4 p-3 border border-red-200 text-red-700 rounded">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" placeholder="+90..." required />
                </div>
                {/* No password for social login */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" required>
                        <option value="" disabled>Choose...</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Birthdate</label>
                    <input name="birthdate" type="text" placeholder="dd/MM/yyyy" value={form.birthdate} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" required />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700">
                    {submitting ? 'Saving...' : 'Save and Continue'}
                </button>
            </form>
        </div>
    );
};

export default OAuthCompletePage;


