import React from 'react';
import RealEstateCreateForm from './components/RealEstateCreateForm.jsx';

const CreateRealEstatePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <RealEstateCreateForm />
      </div>
    </div>
  );
};

export default CreateRealEstatePage;
