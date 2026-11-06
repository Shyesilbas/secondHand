import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { getPageName } from '../../utils/getPageName.js';

const POINTS = [
  { id: 'escrow', Icon: ShieldCheck, title: 'Paran güvende', text: 'Ödemen, ürünü teslim alıp onaylayana kadar emanette bekler.' },
  { id: 'offers', Icon: MessageCircle, title: 'Teklif ver, sor', text: 'Satıcıya mesaj at, fiyat için teklif gönder.' },
  { id: 'shipping', Icon: Truck, title: 'Siparişini takip et', text: 'Ödemeden teslimata kadar her adımı gör.' },
];

/**
 * Split screen for the signed-out flows: the form column on the left, a short, static
 * "why SecondHand" panel on the right from lg up.
 */
const AuthLayout = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-background-primary" data-page={getPageName(pathname) ?? undefined} data-path={pathname}>
      <main className="flex min-h-screen w-full flex-col px-4 py-8 sm:px-8 lg:w-7/12">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <Outlet />
        </div>
        <p className="mt-10 text-center text-xs text-text-tertiary">
          {t('auth_footer', { defaultValue: '© {{year}} SecondHand', year: new Date().getFullYear() })}
        </p>
      </main>

      <aside className="sticky top-0 hidden h-screen border-l border-border-light bg-background-secondary lg:flex lg:w-5/12 lg:items-center lg:justify-center">
        <div className="max-w-sm px-10">
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            {t('auth_panel_title', 'İkinci el alışverişin güvenli yolu')}
          </h2>
          <ul className="mt-8 space-y-6">
            {POINTS.map(({ id, Icon, title, text }) => (
              <li key={id} className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t(`auth_panel_${id}_title`, title)}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{t(`auth_panel_${id}_text`, text)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default AuthLayout;
