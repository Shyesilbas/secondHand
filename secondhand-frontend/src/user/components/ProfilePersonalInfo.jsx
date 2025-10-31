import React, { useState } from 'react';
import { UpdatePhoneRequestDTO } from '../users.js';
import { formatPhoneForDisplay } from '../../common/utils/phoneFormatter.js';
import PhoneUpdateModal from '../../common/components/modals/PhoneUpdateModal.jsx';

const ProfilePersonalInfo = ({ user, onPhoneUpdate }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneFormData, setPhoneFormData] = useState({ ...UpdatePhoneRequestDTO });

  const handlePhoneUpdate = async () => {
    const success = await onPhoneUpdate(phoneFormData);
    if (success) {
      setShowPhoneModal(false);
      setPhoneFormData({ ...UpdatePhoneRequestDTO });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      let d;
      if (typeof dateString === 'number') {
        d = new Date(dateString);
      } else if (typeof dateString === 'string') {
        const trimmed = dateString.trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
          d = new Date(trimmed);
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
          const [day, month, year] = trimmed.split('/').map(Number);
          d = new Date(year, month - 1, day);
        } else {
          const ts = Date.parse(trimmed);
          d = isNaN(ts) ? null : new Date(ts);
        }
      }
      if (!d || isNaN(d.getTime())) return 'Not provided';
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Not provided';
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Personal Information
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Your basic account details and contact information
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField
              label="Full Name"
              value={`${user?.name || 'Not provided'} ${
                user?.surname || ''
              }`.trim()}
            />
            <InfoField
              label="Email Address"
              value={user?.email || 'Not provided'}
            />
            <InfoField
              label="Phone Number"
              value={user?.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : 'Not provided'}
              action={
                <button
                  onClick={() => {
                    setPhoneFormData({
                      ...UpdatePhoneRequestDTO,
                      newPhone: user?.phoneNumber || '',
                    });
                    setShowPhoneModal(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Update phone number"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              }
            />
            <InfoField
              label="Gender"
              value={user?.gender || 'Not specified'}
            />
            <InfoField label="Birth Date" value={formatDate(user?.birthdate)} />
            <InfoField
              label="Member Since"
              value={formatDate(user?.accountCreationDate)}
            />
          </div>
        </div>
      </div>

      {/* Phone Update Modal */}
      {showPhoneModal && (
        <PhoneUpdateModal
          isOpen={showPhoneModal}
          formData={phoneFormData}
          handleChange={(field, value) =>
            setPhoneFormData((prev) => ({ ...prev, [field]: value }))
          }
          submit={handlePhoneUpdate}
          closeModal={() => setShowPhoneModal(false)}
          isUpdating={false}
        />
      )}
    </>
  );
};

const InfoField = ({ label, value, action }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center justify-between">
      <p className="text-gray-900">{value}</p>
      {action}
    </div>
  </div>
);

export default ProfilePersonalInfo;
