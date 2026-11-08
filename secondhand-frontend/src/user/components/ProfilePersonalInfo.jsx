import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UpdatePhoneRequestDTO } from '../users.js';
import { formatPhoneForDisplay } from '../../common/utils/phoneFormatter.js';
import { formatDate } from '../../common/formatters.js';
import PhoneUpdateModal from '../../common/components/modals/PhoneUpdateModal.jsx';
import Button from '../../common/components/ui/Button.jsx';
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

  const notSpecifiedLabel = t('not_specified', 'Belirtilmedi');

  const getGenderLabel = (g) => {
    if (!g) return null;
    const lower = String(g).toLowerCase();
    if (lower === 'male' || lower === 'erkek') return t('male', 'Erkek');
    if (lower === 'female' || lower === 'kadın') return t('female', 'Kadın');
    if (lower === 'other' || lower === 'diğer') return t('other', 'Diğer');
    return g;
  };

  const fullName = `${user?.name || ''} ${user?.surname || ''}`.trim();
  const formattedPhone = user?.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : null;
  const formattedBirthDate = formatDate(user?.birthdate);
  const formattedMemberSince = formatDate(user?.accountCreationDate);

  const fields = [
    {
      key: 'fullName',
      label: t('full_name', 'Ad Soyad'),
      value: fullName
    },
    {
      key: 'email',
      label: t('email_address', 'E-posta Adresi'),
      value: user?.email || null,
      mono: false
    },
    {
      key: 'phone',
      label: t('phone_number', 'Telefon Numarası'),
      value: formattedPhone,
      tabular: true,
      action: {
        label: formattedPhone ? t('edit', 'Düzenle') : t('add', 'Ekle'),
        onClick: () => {
          setPhoneFormData({ ...UpdatePhoneRequestDTO, newPhone: user?.phoneNumber || '' });
          setShowPhoneModal(true);
        },
        title: t('update_phone_number', 'Telefon numarasını güncelle')
      }
    },
    {
      key: 'gender',
      label: t('gender', 'Cinsiyet'),
      value: getGenderLabel(user?.gender)
    },
    {
      key: 'birthDate',
      label: t('birth_date', 'Doğum Tarihi'),
      value: formattedBirthDate,
      tabular: true
    },
    {
      key: 'memberSince',
      label: t('member_since_label', 'Üyelik Tarihi'),
      value: formattedMemberSince,
      tabular: true
    }
  ];

  return (
    <div>
      <dl className="divide-y divide-border-light">
        {fields.map((field) => {
          const hasValue = Boolean(field.value);

          return (
            <div
              key={field.key}
              className="py-3.5 first:pt-0 last:pb-0 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4"
            >
              <dt className="text-xs sm:text-sm font-medium text-text-secondary">
                {field.label}
              </dt>
              <dd className="mt-1 flex items-center justify-between gap-4 sm:col-span-2 sm:mt-0">
                <span
                  className={`text-sm ${
                    hasValue
                      ? `font-medium text-text-primary ${field.tabular ? 'tabular-nums' : ''}`
                      : 'text-text-muted'
                  }`}
                >
                  {hasValue ? field.value : notSpecifiedLabel}
                </span>

                {field.action && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={field.action.onClick}
                    title={field.action.title}
                    className="shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    <span>{field.action.label}</span>
                  </Button>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

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
