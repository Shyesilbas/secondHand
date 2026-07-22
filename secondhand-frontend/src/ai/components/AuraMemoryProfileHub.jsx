import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiChatService } from '../services/aiChatService';
import { User, ShieldAlert, Sparkles, Plus, X, Check, BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
        <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
        <span className="text-xs text-text-muted font-medium">{t("loading_ai_memory", "Aura hafızası yükleniyor...")}</span>
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

  return (
    <div className="space-y-5 p-4 rounded-xl border border-border-light bg-background-primary shadow-sm text-left">
      <div className="flex items-center gap-2 pb-3 border-b border-border-light">
        <BrainCircuit className="w-5 h-5 text-primary shrink-0" />
        <div>
          <h3 className="text-xs font-bold text-text-primary">{t("aura_brain_hub", "Aura Hafıza Paneli")}</h3>
          <p className="text-[10px] text-text-muted leading-tight mt-0.5">{t("aura_remembers_your_chats", "Aura sizin hakkınızda bunları hatırlıyor.")}</p>
        </div>
      </div>

      {/* Name & Tone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-text-muted block mb-1">{t("how_to_address_you", "Nasıl Hitap Etsin?")}</label>
          <input 
            type="text" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)}
            onBlur={handleSaveField}
            placeholder={t("name_placeholder", "İsim")}
            className="w-full text-xs bg-background-secondary border border-border-light rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-text-primary font-semibold"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-muted block mb-1">{t("conversation_tone", "Konuşma Tonu")}</label>
          <select 
            value={preferredTone} 
            onChange={(e) => {
              setPreferredTone(e.target.value);
              // Save directly on select change
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
            className="w-full text-xs bg-background-secondary border border-border-light rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-text-primary font-semibold"
          >
            <option value="Friendly">{t("tone_friendly", "Samimi / Dostça")}</option>
            <option value="Formal">{t("tone_formal", "Resmi")}</option>
            <option value="Casual">{t("tone_casual", "Günlük / Rahat")}</option>
            <option value="Serious">{t("tone_serious", "Ciddi")}</option>
          </select>
        </div>
      </div>

      {/* Interests Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-text-muted block">{t("interests_label", "İlgi Alanları (Kelime/Kategori)")}</label>
        <div className="flex flex-wrap gap-1.5">
          {memory?.permanentInterests?.map(interest => (
            <span key={interest} className="inline-flex items-center gap-1 text-[10px] font-bold bg-secondary-light border border-border-light px-2 py-0.5 rounded-full text-text-secondary">
              {interest}
              <button type="button" onClick={() => handleRemoveInterest(interest)} className="hover:text-rose-500 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {(!memory?.permanentInterests || memory.permanentInterests.length === 0) && (
            <span className="text-[10px] text-text-muted font-medium italic">{t("no_saved_interests", "Kayıtlı ilgi alanı yok.")}</span>
          )}
        </div>
        <form onSubmit={handleAddInterest} className="flex gap-2">
          <input 
            type="text" 
            value={newInterest} 
            onChange={(e) => setNewInterest(e.target.value)} 
            placeholder={t("add_interest_placeholder", "İlgi alanı ekle... (örn: Bisiklet)")}
            className="flex-1 text-[11px] bg-background-secondary border border-border-light rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
          />
          <button type="submit" className="px-2.5 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover active:scale-95 transition-all">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Brands Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-text-muted block">{t("preferred_brands", "Tercih Ettiği Markalar")}</label>
        <div className="flex flex-wrap gap-1.5">
          {memory?.secondHandProfile?.brands?.map(brand => (
            <span key={brand} className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full text-primary">
              {brand}
              <button type="button" onClick={() => handleRemoveBrand(brand)} className="hover:text-rose-500 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {(!memory?.secondHandProfile?.brands || memory.secondHandProfile.brands.length === 0) && (
            <span className="text-[10px] text-text-muted font-medium italic">{t("no_saved_brands", "Kayıtlı marka yok.")}</span>
          )}
        </div>
        <form onSubmit={handleAddBrand} className="flex gap-2">
          <input 
            type="text" 
            value={newBrand} 
            onChange={(e) => setNewBrand(e.target.value)} 
            placeholder={t("add_brand_placeholder", "Marka ekle... (örn: Apple)")}
            className="flex-1 text-[11px] bg-background-secondary border border-border-light rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
          />
          <button type="submit" className="px-2.5 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover active:scale-95 transition-all">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Budget Preferences */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-text-muted block">{t("budget_preference", "Bütçe Tercihi")}</label>
        <div className="flex gap-2 items-center">
          <input 
            type="number" 
            placeholder={t("min", "Min")} 
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            onBlur={handleSaveField}
            className="w-full text-xs bg-background-secondary border border-border-light rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
          />
          <span className="text-text-muted text-xs">-</span>
          <input 
            type="number" 
            placeholder={t("max", "Max")} 
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            onBlur={handleSaveField}
            className="w-full text-xs bg-background-secondary border border-border-light rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
          />
          <select
            value={budgetCurrency}
            onChange={(e) => {
              setBudgetCurrency(e.target.value);
              // Save directly on currency change
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
            className="text-xs bg-background-secondary border border-border-light rounded-lg px-2 py-1.5 focus:outline-none text-text-primary"
          >
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* User Notes */}
      <div>
        <label className="text-[10px] font-bold text-text-muted block mb-1">{t("auras_special_notes", "Aura'nın Özel Notları (Hedefler, Tercihler)")}</label>
        <textarea 
          value={userNotes} 
          onChange={(e) => setUserNotes(e.target.value)}
          onBlur={handleSaveField}
          placeholder={t("special_notes_placeholder", "İlan arayışları, kargo kısıtlamaları veya özel notlar...")}
          rows={3}
          className="w-full text-xs bg-background-secondary border border-border-light rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary text-text-primary resize-none"
        />
      </div>

      {updateMutation.isPending && (
        <div className="flex items-center gap-1.5 text-[9px] text-primary font-bold">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          {t("saving", "Kaydediliyor...")}
        </div>
      )}
    </div>
  );
}
