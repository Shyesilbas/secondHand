import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnums } from '../../hooks/useEnums';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import ListingBasics from '../../components/forms/ListingBasics';
import LocationFields from '../../components/forms/LocationFields';
import EnumDropdown from '../../components/ui/EnumDropdown';
import { useSports } from '../../features/sports/hooks/useSports';

const SportsEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const { enums } = useEnums();
  const { sports, isLoading, fetchSports, updateSports } = useSports(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchSports(id); }, [id]);
  useEffect(() => {
    if (sports) {
      setFormData({
        title: sports.title || '',
        description: sports.description || '',
        price: sports.price ?? '',
        currency: sports.currency || 'TRY',
        city: sports.city || '',
        district: sports.district || '',

        discipline: sports.discipline || '',
        equipmentType: sports.equipmentType || '',
        condition: sports.condition || '',
      });
    }
  }, [sports]);

  const steps = useMemo(() => ([
    { id: 1, title: 'Basic Information' },
    { id: 2, title: 'Sports Details' },
    { id: 3, title: 'Location' },
  ]), []);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title || !String(formData.title).trim()) newErrors.title = 'Title is required';
      if (!formData.description || !String(formData.description).trim()) newErrors.description = 'Description is required';
      if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Enter a valid price';
    }
    if (step === 2) {
      if (!formData.discipline) newErrors.discipline = 'Discipline is required';
      if (!formData.equipmentType) newErrors.equipmentType = 'Equipment Type is required';
      if (!formData.condition) newErrors.condition = 'Condition is required';
    }
    if (step === 3) {
      if (!formData.city || !String(formData.city).trim()) newErrors.city = 'City is required';
      if (!formData.district || !String(formData.district).trim()) newErrors.district = 'District is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, steps.length)); };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, steps.length));
      return;
    }
    const changed = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== (sports?.[key] ?? '')) changed[key] = formData[key];
    });
    if (Object.keys(changed).length === 0) { notification.showInfo('Info', 'No changes to save'); return; }
    try {
      await updateSports(id, changed);
      notification.showSuccess('Success', 'Listing updated successfully!');
      navigate(ROUTES.MY_LISTINGS);
    } catch (err) {
      notification.showError('Error', 'An error occurred while updating the listing');
    }
  };

  if (isLoading && !sports) {
    return (
      <div className="container mx-auto px-4 py-8"><div className="animate-pulse h-8 w-40 bg-slate-200 rounded" /></div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Sports Listing</h1>
        <p className="text-slate-600">Follow the steps to update</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-center">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${idx + 1 < currentStep ? 'bg-emerald-500 text-white' : idx + 1 === currentStep ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {idx + 1 < currentStep ? '✓' : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${idx + 1 < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-xl">📝</span></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                <p className="text-sm text-slate-600">Title, description and price</p>
              </div>
            </div>
            <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><span className="text-xl">🏅</span></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Sports Details</h3>
                <p className="text-sm text-slate-600">Discipline, equipment and condition</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div>
                <EnumDropdown label="Discipline *" enumKey="sportDisciplines" value={formData.discipline} onChange={(v) => setFormData(prev => ({...prev, discipline: v}))} />
                {errors.discipline && <p className="mt-1 text-sm text-red-600">{errors.discipline}</p>}
              </div>
              <div>
                <EnumDropdown label="Equipment Type *" enumKey="sportEquipmentTypes" value={formData.equipmentType} onChange={(v) => setFormData(prev => ({...prev, equipmentType: v}))} />
                {errors.equipmentType && <p className="mt-1 text-sm text-red-600">{errors.equipmentType}</p>}
              </div>
              <div>
                <EnumDropdown label="Condition *" enumKey="sportConditions" value={formData.condition} onChange={(v) => setFormData(prev => ({...prev, condition: v}))} />
                {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><span className="text-xl">📍</span></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Location</h3>
                <p className="text-sm text-slate-600">City and district</p>
              </div>
            </div>
            <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2 rounded-lg border text-slate-700 disabled:opacity-50">Back</button>
          {currentStep < steps.length ? (
            <button type="button" onClick={nextStep} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Next</button>
          ) : (
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Save</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SportsEditPage;


