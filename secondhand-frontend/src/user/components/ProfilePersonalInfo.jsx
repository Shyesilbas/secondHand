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
              action={{
                onClick: () => {
                  setPhoneFormData({
                    ...UpdatePhoneRequestDTO,
                    newPhone: user?.phoneNumber || '',
                  });
                  setShowPhoneModal(true);
                },
                title: "Update phone number"
              }}
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
  <div className="space-y-2 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-[0.05em]">{label}</label>
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-900 tracking-tight">{value}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
          title={action.title || "Edit"}
        >
          {action.icon || (
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
          )}
        </button>
      )}
    </div>
  </div>
);

export default ProfilePersonalInfo;
