import React from 'react';
import { useParams } from 'react-router-dom';

const ListingDetailPage = () => {
    const { id } = useParams();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                İlan Detayı
            </h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-gray-600">
                    İlan ID: {id}
                </p>
                <p className="text-gray-600 mt-2">
                    İlan detay sayfası yakında tamamlanacak...
                </p>
            </div>
        </div>
    );
};

export default ListingDetailPage;