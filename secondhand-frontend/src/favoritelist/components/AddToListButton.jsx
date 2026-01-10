import { useState } from 'react';
import { List } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import AddToListModal from './AddToListModal.jsx';

const AddToListButton = ({ listingId, listingTitle, size = 'sm', className = '' }) => {
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuth();

    if (!user) return null;

    const sizeClasses = {
        sm: 'h-7 w-7',
        md: 'h-9 w-9',
        lg: 'h-10 w-10',
    };

    const iconSizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const defaultClassName = `bg-background-primary/90 backdrop-blur hover:bg-background-primary text-text-secondary hover:text-accent-indigo-600 border-none ${sizeClasses[size]} rounded-full shadow-sm flex items-center justify-center transition-colors`;
    
    const buttonClassName = className || defaultClassName;

    return (
        <>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={buttonClassName}
                title="Listeye Ekle"
            >
                <List className={iconSizes[size]} />
            </button>

            {showModal && (
                <AddToListModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    listingId={listingId}
                    listingTitle={listingTitle}
                />
            )}
        </>
    );
};

export default AddToListButton;

