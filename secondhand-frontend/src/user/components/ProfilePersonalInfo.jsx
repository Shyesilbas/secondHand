import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UpdatePhoneRequestDTO } from '../users.js';
import { formatPhoneForDisplay } from '../../common/utils/phoneFormatter.js';
import { formatDate as formatDateShared } from '../../common/formatters.js';
import PhoneUpdateModal from '../../common/components/modals/PhoneUpdateModal.jsx';
import { Pencil } from 'lucide-react';

const ProfilePersonalInfo = ({ user, onPhoneUpdate, isUpdatingPhone }) => {
  const { t } = useTranslation();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneFormData, setPhoneFormData] = useState({ ...UpdatePhoneRequestDTO });

  const handlePhoneUpdate = async () => {
    const success = await onPhoneUpdate(phoneFormData);
    if (success) {
      setShowPhoneModal(false);
      setPhoneFormData({ ...UpdatePhoneRequestDTO });
    }
  };

  const formatDate = (dateString) => formatDateShared(dateString) || t('not_provided', 'Belirtilmedi');

  const getGenderLabel = (g) => {
    if (!g) return t('not_specified', 'Belirtilmedi');
    const lower = String(g).toLowerCase();
    if (lower === 'male' || lower === 'erkek') return t('male', 'Erkek');
    if (lower === 'female' || lower === 'kadın') return t('female', 'Kadın');
    if (lower === 'other' || lower === 'diğer') return t('other', 'Diğer');
    return g;
  };

  const fields = [
    {
      label: t('full_name', 'Ad Soyad'),
      value: `${user?.name || ''} ${user?.surname || ''}`.trim() || t('not_provided', 'Belirtilmedi')
    },
    {
      label: t('email_address', 'E-posta Adresi'),
      value: user?.email || t('not_provided', 'Belirtilmedi')
    },
    {
      label: t('phone_number', 'Telefon Numarası'),
      value: user?.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : t('not_provided', 'Belirtilmedi'),
      action: {
        onClick: () => {
          setPhoneFormData({ ...UpdatePhoneRequestDTO, newPhone: user?.phoneNumber || '' });
          setShowPhoneModal(true);
        },
        title: t('update_phone_number', 'Telefon numarasını güncelle')
      }
    },
    {
      label: t('gender', 'Cinsiyet'),
      value: getGenderLabel(user?.gender)
    },
    {
      label: t('birth_date', 'Doğum Tarihi'),
      value: formatDate(user?.birthdate)
    },
    {
      label: t('member_since', 'Üyelik Tarihi'),
      value: formatDate(user?.accountCreationDate)
    }
  ];

  return (
    <div>
      <div className="divide-y divide-border-light">
        {fields.map((field) => {
          const isPlaceholder =
            field.value === t('not_provided', 'Belirtilmedi') ||
            field.value === t('not_specified', 'Belirtilmedi');

          return (
            <div
              key={field.label}
              className="flex items-center justify-between py-3 sm:py-3.5 px-2 hover:bg-background-secondary/60 rounded transition-colors group"
            >
              <div className="min-w-0 pr-4">
                <div className="text-xs font-medium text-text-muted mb-0.5">{field.label}</div>
                <div className={`text-sm ${isPlaceholder ? 'text-text-muted italic' : 'font-medium text-text-primary'}`}>
                  {field.value}
                </div>
              </div>
              {field.action && (
                <button
                  type="button"
                  onClick={field.action.onClick}
                  className="flex h-8 w-8 items-center justify-center rounded text-text-muted hover:bg-background-tertiary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  title={field.action.title}
                  aria-label={field.action.title}
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          );
        })}
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
          isUpdating={isUpdatingPhone}
        />
      )}
    </div>
  );
};

export default ProfilePersonalInfo;
