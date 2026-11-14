import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import { ROUTES } from '../../common/constants/routes.js';

// Search is the main action of the landing page; it opens the listings page with the term applied.
const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `${ROUTES.LISTINGS}?q=${encodeURIComponent(q)}` : ROUTES.LISTINGS);
  };

  return (
    <section className="bg-gradient-to-b from-background-primary via-background-primary/70 to-background-secondary">
      <PageContainer className="py-10 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl">
            {t('hero.title', 'Doğrudan alıcı ve satıcıdan ikinci el.')}
          </h1>
          <p className="mt-3 text-base text-text-secondary sm:text-lg">
            {t('hero.subtitle_short', 'Ödemen, ürünü teslim aldığını onaylayana kadar güvencede kalır.')}
          </p>

          <form onSubmit={handleSubmit} role="search" className="mt-6 flex gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t('search_listings', 'İlanlarda ara')}</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <input
                type="search"
                value={term}
                onChange={e => setTerm(e.target.value)}
                placeholder={t('hero.search_placeholder', 'Ne arıyorsun? Telefon, bisiklet, kitap...')}
                className="h-12 w-full rounded border border-border bg-background-primary pl-10 pr-3 text-base text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
              />
            </label>
            <Button type="submit" className="h-12 shrink-0 px-5">
              {t('search_action', 'Ara')}
            </Button>
          </form>

          <p className="mt-4 text-sm text-text-secondary">
            {t('hero.sell_prompt', 'Kullanmadığın bir şey mi var?')}{' '}
            <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className={`${buttonClasses('ghost', 'sm')} -ml-1 text-text-primary`}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {t('create_listing', 'İlan ver')}
            </Link>
          </p>
        </div>
      </PageContainer>
    </section>
  );
};

export default HeroSection;
