import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Eye, 
  Crown, 
  Zap, 
  ExternalLink, 
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConfettiParticle = ({ index }) => {
  const randomX = useMemo(() => (Math.random() - 0.5) * 400, []);
  const randomY = useMemo(() => -150 - Math.random() * 250, []);
  const randomRotate = useMemo(() => Math.random() * 360, []);
  const randomScale = useMemo(() => 0.5 + Math.random() * 0.8, []);
  const color = useMemo(() => {
    const colors = ['#10b981', '#059669', '#14b8a6', '#047857', '#34d399', '#f59e0b'];
    return colors[index % colors.length];
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
      animate={{ 
        opacity: [1, 1, 0], 
        x: randomX, 
        y: randomY, 
        rotate: randomRotate + 360,
        scale: [0, randomScale, randomScale * 0.8]
      }}
      transition={{ 
        duration: 2 + Math.random() * 1.5, 
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: Math.random() * 0.2
      }}
      style={{ backgroundColor: color }}
      className={`absolute w-3 h-3 rounded-${index % 2 === 0 ? 'full' : 'sm'} pointer-events-none z-20`}
    />
  );
};

const ShowcaseSuccessModal = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  days,
  isExtension = false,
  listingImage = null
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const confettiCount = 30;

  const handleGoToListing = () => {
    onClose?.();
    if (listingId) {
      navigate(`/listings/${listingId}`);
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center my-auto"
        >
          {/* Confetti Container */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {Array.from({ length: confettiCount }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Banner Glow Background */}
          <div className="relative pt-10 pb-6 px-6 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent overflow-hidden">
            {/* Animated Pulsing Ring */}
            <div className="relative mx-auto w-24 h-24 mb-4">
              <motion.div 
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.15, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-500 to-emerald-600 blur-xl"
              />

              <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-slate-900 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 border-2 border-white">
                <Crown className="w-11 h-11 text-amber-300 animate-bounce-subtle" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200/80 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {isExtension ? 'Vitrin UZATILDI' : 'Vitrin AKTİF EDİLDİ'}
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isExtension ? 'Tebrikler! Süreniz Uzatıldı' : 'İlanınız Artık Vitrinde! 🚀'}
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-1 max-w-xs mx-auto">
                {isExtension 
                  ? `"${listingTitle}" ilanınızın vitrin yayın süresi ${days} gün daha uzatıldı.` 
                  : `"${listingTitle}" ilanınız ${days} gün boyunca tüm alıcıların en başında sergileniyor!`}
              </p>
            </motion.div>
          </div>

          {/* Listing Preview & Perks Card */}
          <div className="px-6 pb-6 space-y-4">
            {/* Listing Preview Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 flex items-center gap-3.5 text-left">
              {listingImage ? (
                <img 
                  src={listingImage} 
                  alt={listingTitle} 
                  className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs ring-2 ring-emerald-500/20"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black shrink-0 shadow-xs">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-300" /> VİTRİN İLAN
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                    {days} GÜN
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 truncate">
                  {listingTitle}
                </p>
              </div>
            </div>

            {/* Value Propositions Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900">5x Kat</span>
                <span className="text-[10px] font-extrabold text-slate-400">Fazla Gösterim</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 font-bold">
                  <Crown className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900">En Üst</span>
                <span className="text-[10px] font-extrabold text-slate-400">Arama Sırası</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 font-bold">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900">Hızlı</span>
                <span className="text-[10px] font-extrabold text-slate-400">Satış Şansı</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {listingId && (
                <button
                  type="button"
                  onClick={handleGoToListing}
                  className="w-full py-3.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  İlanı Görüntüle <ExternalLink className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl text-xs font-extrabold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Harika, Anladım
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ShowcaseSuccessModal;
