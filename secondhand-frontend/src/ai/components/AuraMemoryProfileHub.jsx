import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiChatService } from '../services/aiChatService';
import { Plus, X, BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/common/components/ui/Button';

export default function AuraMemoryProfileHub() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newInterest, setNewInterest] = useState('');
  const [newBrand, setNewBrand] = useState('');
  
  // Local state for editable form fields
  const [userName, setUserName] = useState('');
  const [preferredTone, setPreferredTone] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('TRY');

  const { data: memory, isLoading } = useQuery({
    queryKey: ['ai', 'memory'],
    queryFn: aiChatService.getMemory,
    select: (res) => res?.data
  });

  const updateMutation = useMutation({
    mutationFn: aiChatService.updateMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'memory'] });
    }
  });

  // Sync server data to local inputs
  useEffect(() => {
    if (memory) {
      setUserName(memory.userName || '');
      setPreferredTone(memory.preferredTone || 'Friendly');
      setUserNotes(memory.userNotes || '');
      setBudgetMin(memory.secondHandProfile?.budget?.min ?? '');
      setBudgetMax(memory.secondHandProfile?.budget?.max ?? '');
      setBudgetCurrency(memory.secondHandProfile?.budget?.currency || 'TRY');
    }
  }, [memory]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <BrainCircuit className="h-6 w-6 text-text-muted animate-pulse" strokeWidth={1.5} />
        <span className="text-sm text-text-muted">{t("loading_ai_memory", "Bellek yükleniyor...")}</span>
      </div>
    );
  }

  const handleSaveField = () => {
    const updatedProfile = {
      categories: memory?.secondHandProfile?.categories || [],
      brands: memory?.secondHandProfile?.brands || [],
      budget: {
        min: budgetMin !== '' ? Number(budgetMin) : null,
        max: budgetMax !== '' ? Number(budgetMax) : null,
        currency: budgetCurrency
      }
    };

    updateMutation.mutate({
      userName,
      preferredTone,
      permanentInterests: memory?.permanentInterests || [],
      userNotes,
      secondHandProfile: updatedProfile
    });
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    
    const interests = [...(memory?.permanentInterests || [])];
    if (!interests.includes(newInterest.trim())) {
      interests.push(newInterest.trim());
      updateMutation.mutate({
        ...memory,
        userName,
        preferredTone,
        userNotes,
        permanentInterests: interests,
        secondHandProfile: memory?.secondHandProfile
      });
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (interestToRemove) => {
    const interests = (memory?.permanentInterests || []).filter(i => i !== interestToRemove);
    updateMutation.mutate({
      ...memory,
      userName,
      preferredTone,
      userNotes,
      permanentInterests: interests,
      secondHandProfile: memory?.secondHandProfile
    });
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrand.trim()) return;

    const brands = [...(memory?.secondHandProfile?.brands || [])];
    if (!brands.includes(newBrand.trim())) {
      brands.push(newBrand.trim());
      updateMutation.mutate({
        ...memory,
        userName,
        preferredTone,
        userNotes,
        secondHandProfile: {
          ...memory?.secondHandProfile,
          brands
        }
      });
    }
    setNewBrand('');
  };

  const handleRemoveBrand = (brandToRemove) => {
    const brands = (memory?.secondHandProfile?.brands || []).filter(b => b !== brandToRemove);
    updateMutation.mutate({
      ...memory,
      userName,
      preferredTone,
      userNotes,
      secondHandProfile: {
        ...memory?.secondHandProfile,
        brands
      }
    });
  };

  const inputClass = "w-full rounded border border-border bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none";

  return (
    <div className="space-y-4 text-left">
      {/* Name & Tone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-1">{t("how_to_address_you", "Hitap Şekli")}</label>
          <input 
            type="text" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)}
            onBlur={handleSaveField}
            placeholder={t("name_placeholder", "İsminiz")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-1">{t("conversation_tone", "İletişim Tonu")}</label>
          <select 
            value={preferredTone} 
            onChange={(e) => {
              setPreferredTone(e.target.value);
              const updatedProfile = {
                categories: memory?.secondHandProfile?.categories || [],
                brands: memory?.secondHandProfile?.brands || [],
                budget: {
                  min: budgetMin !== '' ? Number(budgetMin) : null,
                  max: budgetMax !== '' ? Number(budgetMax) : null,
                  currency: budgetCurrency
                }
              };
              updateMutation.mutate({
                userName,
                preferredTone: e.target.value,
                permanentInterests: memory?.permanentInterests || [],
                userNotes,
                secondHandProfile: updatedProfile
              });
            }}
            className={inputClass}
          >
            <option value="Friendly">{t("tone_friendly", "Dostane")}</option>
            <option value="Formal">{t("tone_formal", "Resmi")}</option>
            <option value="Casual">{t("tone_casual", "Samimi")}</option>
            <option value="Serious">{t("tone_serious", "Ciddi")}</option>
          </select>
        </div>
      </div>

      {/* Interests Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary block">{t("interests_label", "İlgi Alanları & Kategoriler")}</label>
        <div className="flex flex-wrap gap-1.5">
          {memory?.permanentInterests?.map(interest => (
            <span key={interest} className="inline-flex items-center gap-1.5 text-xs font-medium bg-background-tertiary border border-border-light px-2.5 py-1 rounded-sm text-text-primary">
              {interest}
              <button type="button" onClick={() => handleRemoveInterest(interest)} aria-label={`${interest} kaldır`} className="text-text-muted hover:text-status-error transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {(!memory?.permanentInterests || memory.permanentInterests.length === 0) && (
            <span className="text-xs text-text-tertiary">{t("no_saved_interests", "Henüz kayıtlı ilgi alanı yok.")}</span>
          )}
        </div>
        <form onSubmit={handleAddInterest} className="flex gap-2">
          <input 
            type="text" 
            value={newInterest} 
            onChange={(e) => setNewInterest(e.target.value)} 
            placeholder={t("add_interest_placeholder", "Yeni ilgi alanı ekleyin...")}
            className={inputClass}
          />
          <Button type="submit" variant="secondary" size="md">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Ekle</span>
          </Button>
        </form>
      </div>

      {/* Brands Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary block">{t("preferred_brands", "Tercih Edilen Markalar")}</label>
        <div className="flex flex-wrap gap-1.5">
          {memory?.secondHandProfile?.brands?.map(brand => (
            <span key={brand} className="inline-flex items-center gap-1.5 text-xs font-medium bg-background-tertiary border border-border-light px-2.5 py-1 rounded-sm text-text-primary">
              {brand}
              <button type="button" onClick={() => handleRemoveBrand(brand)} aria-label={`${brand} kaldır`} className="text-text-muted hover:text-status-error transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {(!memory?.secondHandProfile?.brands || memory.secondHandProfile.brands.length === 0) && (
            <span className="text-xs text-text-tertiary">{t("no_saved_brands", "Henüz kayıtlı marka yok.")}</span>
          )}
        </div>
        <form onSubmit={handleAddBrand} className="flex gap-2">
          <input 
            type="text" 
            value={newBrand} 
            onChange={(e) => setNewBrand(e.target.value)} 
            placeholder={t("add_brand_placeholder", "Yeni marka ekleyin...")}
            className={inputClass}
          />
          <Button type="submit" variant="secondary" size="md">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Ekle</span>
          </Button>
        </form>
      </div>

      {/* Budget Preferences */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary block">{t("budget_preference", "Bütçe Aralığı")}</label>
        <div className="flex gap-2 items-center">
          <input 
            type="number" 
            placeholder={t("min", "Min")} 
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            onBlur={handleSaveField}
            className={inputClass}
          />
          <span className="text-text-tertiary text-sm">–</span>
          <input 
            type="number" 
            placeholder={t("max", "Max")} 
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            onBlur={handleSaveField}
            className={inputClass}
          />
          <select
            value={budgetCurrency}
            onChange={(e) => {
              setBudgetCurrency(e.target.value);
              const updatedProfile = {
                categories: memory?.secondHandProfile?.categories || [],
                brands: memory?.secondHandProfile?.brands || [],
                budget: {
                  min: budgetMin !== '' ? Number(budgetMin) : null,
                  max: budgetMax !== '' ? Number(budgetMax) : null,
                  currency: e.target.value
                }
              };
              updateMutation.mutate({
                userName,
                preferredTone,
                permanentInterests: memory?.permanentInterests || [],
                userNotes,
                secondHandProfile: updatedProfile
              });
            }}
            className="w-24 rounded border border-border bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* User Notes */}
      <div>
        <label className="text-sm font-medium text-text-secondary block mb-1">{t("auras_special_notes", "Aura İçin Özel Notlar")}</label>
        <textarea 
          value={userNotes} 
          onChange={(e) => setUserNotes(e.target.value)}
          onBlur={handleSaveField}
          placeholder={t("special_notes_placeholder", "Örn: Teknolojik aletlerde pil sağlığına dikkat ederim...")}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {updateMutation.isPending && (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span>{t("saving", "Kaydediliyor...")}</span>
        </div>
      )}
    </div>
  );
}
