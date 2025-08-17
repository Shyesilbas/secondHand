import React, { useState } from 'react';
import { useEnums } from '../../hooks/useEnums';
import VehicleCreateForm from '../../features/vehicles/components/VehicleCreateForm';
import ElectronicCreateForm from '../../features/electronics/components/ElectronicCreateForm';
import RealEstateCreateForm from '../../features/realEstates/components/RealEstateCreateForm';
import ClothingCreateForm from '../../features/clothing/components/ClothingCreateForm';

const CreateListingPage = () => {
    const [selectedType, setSelectedType] = useState(null);
    const { enums } = useEnums();

    const handleTypeSelect = (type) => {
        setSelectedType(type);
    };

    const handleBackToSelection = () => {
        setSelectedType(null);
    };

    if (selectedType === 'VEHICLE') {
        return <VehicleCreateForm onBack={handleBackToSelection} />;
    }

  if (selectedType === 'ELECTRONICS') {
      return <ElectronicCreateForm onBack={handleBackToSelection} />;
  }

  if (selectedType === 'REAL_ESTATE') {
      return <RealEstateCreateForm onBack={handleBackToSelection} />;
  }

  if (selectedType === 'CLOTHING') {
      return <ClothingCreateForm onBack={handleBackToSelection} />;
  }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                İlan Ver
            </h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    İlan Tipini Seçin
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enums.listingTypes?.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => handleTypeSelect(type.value)}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="text-3xl">
                                    {type.icon || '📦'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                                        {type.label}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {getTypeDescription(type.value)}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {selectedType && selectedType !== 'VEHICLE' && selectedType !== 'ELECTRONICS' && selectedType !== 'REAL_ESTATE' && selectedType !== 'CLOTHING' && (
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                            {selectedType} tipi için form henüz hazır değil. Şimdilik sadece Vehicle, Electronics, Real Estate ve Clothing listingleri desteklenmektedir.
                        </p>
                        <button
                            onClick={handleBackToSelection}
                            className="mt-2 text-yellow-600 hover:text-yellow-800 underline"
                        >
                            Geri dön
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const getTypeDescription = (type) => {
    switch (type) {
        case 'VEHICLE':
            return 'Araba, motor, bisiklet vb.';
        case 'ELECTRONICS':
            return 'Telefon, laptop, TV vb.';
        case 'REAL_ESTATE':
            return 'Ev, apartman, arsa vb.';
        case 'CLOTHING':
            return 'Giyim ve aksesuar ürünleri';
        case 'BOOKS':
            return 'Kitap, dergi vb.';
        case 'SPORTS':
            return 'Spor malzemeleri';
        case 'OTHER':
            return 'Diğer kategoriler';
        default:
            return 'Ürün kategorisi';
    }
};

export default CreateListingPage;