import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import Button from '../../common/components/ui/Button.jsx';
import ShowcaseModal from './ShowcaseModal.jsx';

const ShowcaseButton = ({ listingId, onSuccess }) => {
  const { t } = useTranslation();
  const {
    authState: { isAuthenticated }
  } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="w-full"
      >
        <Sparkles className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        <span>{t('add_to_showcase', 'Vitrine Çıkar')}</span>
      </Button>

      {isModalOpen && (
        <ShowcaseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          listingId={listingId}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default ShowcaseButton;
