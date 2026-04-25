import React, {useState} from 'react';
import {UpdatePhoneRequestDTO} from '../users.js';
import {formatPhoneForDisplay} from '../../common/utils/phoneFormatter.js';
import PhoneUpdateModal from '../../common/components/modals/PhoneUpdateModal.jsx';
import {Pencil} from 'lucide-react';

const ProfilePersonalInfo = ({user, onPhoneUpdate}) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneFormData, setPhoneFormData] = useState({...UpdatePhoneRequestDTO});

  const handlePhoneUpdate = async () => {
    const success = await onPhoneUpdate(phoneFormData);
    if (success) {
      setShowPhoneModal(false);
      setPhoneFormData({...UpdatePhoneRequestDTO});
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
      return d.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
    } catch {
      return 'Not provided';
    }
  };

  const fields = [
    {label: 'Full Name', value: `${user?.name || 'Not provided'} ${user?.surname || ''}`.trim()},
    {label: 'Email Address', value: user?.email || 'Not provided'},
    {
      label: 'Phone Number',
      value: user?.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : 'Not provided',
      action: {
        onClick: () => {
          setPhoneFormData({...UpdatePhoneRequestDTO, newPhone: user?.phoneNumber || ''});
          setShowPhoneModal(true);
        },
        title: 'Update phone number',
      },
    },
    {label: 'Gender', value: user?.gender || 'Not specified'},
    {label: 'Birth Date', value: formatDate(user?.birthdate)},
    {label: 'Member Since', value: formatDate(user?.accountCreationDate)},
  ];

  return (
    <>
      <div className="space-y-1">
        {fields.map((field, i) => (
          <div
            key={field.label}
            className={`flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-50 transition-colors duration-150 group ${
              i < fields.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="min-w-0">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">{field.label}</div>
              <div className={`text-sm font-semibold ${
                field.value === 'Not provided' || field.value === 'Not specified'
                  ? 'text-gray-400 italic'
                  : 'text-gray-900'
              }`}>
                {field.value}
              </div>
            </div>
            {field.action && (
              <button
                onClick={field.action.onClick}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title={field.action.title || 'Edit'}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Phone Update Modal */}
      {showPhoneModal && (
        <PhoneUpdateModal
          isOpen={showPhoneModal}
          formData={phoneFormData}
          handleChange={(field, value) =>
            setPhoneFormData((prev) => ({...prev, [field]: value}))
          }
          submit={handlePhoneUpdate}
          closeModal={() => setShowPhoneModal(false)}
          isUpdating={false}
        />
      )}
    </>
  );
};

export default ProfilePersonalInfo;
