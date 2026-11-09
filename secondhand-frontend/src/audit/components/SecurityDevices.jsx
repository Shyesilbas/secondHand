import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Filter,
  X
} from 'lucide-react';
import { formatDateTime } from '../../common/formatters.js';

const parseUserAgentDetails = (userAgent = '', t) => {
  const tr = (k, def) => (t ? t(k, def) : def);
  if (!userAgent) {
    return {
      deviceType: 'desktop',
      deviceLabel: tr('unknown_device', 'Bilinmeyen Cihaz'),
      osLabel: tr('unknown_os', 'Bilinmeyen İS'),
      browserLabel: tr('unknown_browser', 'Bilinmeyen Tarayıcı'),
      shortBrowser: ''
    };
  }

  let browser = tr('browser', 'Tarayıcı');
  let browserVersion = '';
  let device = tr('desktop', 'Masaüstü');
  let os = '';
  let deviceType = 'desktop';

  if (userAgent.includes('Edg')) {
    browser = 'Edge';
    const match = userAgent.match(/Edg\/([\d]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/([\d]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/([\d]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/([\d.]+)/);
    if (match) browserVersion = match[1];
  }

  if (userAgent.includes('iPhone')) {
    device = 'iPhone';
    deviceType = 'mobile';
    const match = userAgent.match(/OS ([\d_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (userAgent.includes('iPad')) {
    device = 'iPad';
    deviceType = 'tablet';
    const match = userAgent.match(/OS ([\d_]+)/);
    os = match ? `iPadOS ${match[1].replace(/_/g, '.')}` : 'iPadOS';
  } else if (userAgent.includes('Android')) {
    device = tr('android_device', 'Android Cihaz');
    deviceType = userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'tablet';
    const match = userAgent.match(/Android ([\d.]+)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) {
    device = 'Mac';
    deviceType = 'laptop';
    const match = userAgent.match(/Mac OS X ([\d_]+)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (userAgent.includes('Windows')) {
    device = 'Windows PC';
    deviceType = 'desktop';
    if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else os = 'Windows';
  } else if (userAgent.includes('Linux')) {
    device = 'Linux PC';
    deviceType = 'desktop';
    os = 'Linux';
  }

  const browserLabel = browserVersion ? `${browser} ${browserVersion}` : browser;

  return {
    deviceType,
    deviceLabel: device,
    osLabel: os,
    browserLabel,
    shortBrowser: browser
  };
};

const DeviceIcon = ({ type }) => {
  switch (type) {
    case 'mobile':
      return <Smartphone className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />;
    case 'tablet':
      return <Tablet className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />;
    case 'laptop':
      return <Laptop className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />;
    default:
      return <Monitor className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />;
  }
};

const SecurityDevices = ({
  auditLogs = [],
  activeUserAgentFilter = '',
  onFilterByDevice
}) => {
  const { t } = useTranslation();

  const currentUA = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  const devices = useMemo(() => {
    const map = new Map();

    // Seed with current browser session first so it is always visible
    if (currentUA) {
      const parsed = parseUserAgentDetails(currentUA, t);
      const key = `${parsed.deviceLabel}|${parsed.browserLabel}`;
      map.set(key, {
        key,
        ...parsed,
        rawUserAgent: currentUA,
        ipAddress: null,
        lastSeen: null,
        lastEventType: 'ACTIVE_SESSION',
        eventCount: 0,
        isCurrentDevice: true
      });
    }

    auditLogs.forEach((log) => {
      if (!log?.userAgent && !log?.ipAddress) return;
      const parsed = parseUserAgentDetails(log.userAgent || '', t);
      const currentParsed = currentUA ? parseUserAgentDetails(currentUA, t) : null;
      const isSameAsCurrent =
        Boolean(currentUA && log.userAgent && log.userAgent === currentUA) ||
        Boolean(
          currentParsed &&
          parsed.deviceLabel === currentParsed.deviceLabel &&
          parsed.browserLabel === currentParsed.browserLabel
        );

      const key = isSameAsCurrent && currentParsed
        ? `${currentParsed.deviceLabel}|${currentParsed.browserLabel}`
        : `${parsed.deviceLabel}|${parsed.browserLabel}|${log.ipAddress || ''}`;

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          key,
          ...parsed,
          rawUserAgent: log.userAgent || '',
          ipAddress: log.ipAddress || null,
          lastSeen: log.createdAt || null,
          lastEventType: log.eventType || null,
          eventCount: 1,
          isCurrentDevice: isSameAsCurrent
        });
      } else {
        existing.eventCount += 1;
        if (!existing.ipAddress && log.ipAddress) {
          existing.ipAddress = log.ipAddress;
        }
        if (
          log.createdAt &&
          (!existing.lastSeen || new Date(log.createdAt) > new Date(existing.lastSeen))
        ) {
          existing.lastSeen = log.createdAt;
          existing.lastEventType = log.eventType;
          if (log.ipAddress) existing.ipAddress = log.ipAddress;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.isCurrentDevice && !b.isCurrentDevice) return -1;
      if (!a.isCurrentDevice && b.isCurrentDevice) return 1;
      if (!a.lastSeen) return 1;
      if (!b.lastSeen) return -1;
      return new Date(b.lastSeen) - new Date(a.lastSeen);
    });
  }, [auditLogs, currentUA, t]);

  return (
    <section
      aria-label={t('recognized_devices', 'Cihazlar ve Oturumlar')}
      className="mb-6 overflow-hidden rounded border border-border bg-background-primary"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Laptop className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
          <h2 className="text-sm font-semibold text-text-primary">
            {t('devices_and_sessions', 'Cihazlar ve Oturumlar')}
          </h2>
          <span className="rounded-sm border border-border-light bg-background-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
            {devices.length} {t('device_unit', 'cihaz')}
          </span>
        </div>

        {activeUserAgentFilter && (
          <button
            type="button"
            onClick={() => onFilterByDevice('')}
            className="inline-flex items-center gap-1.5 rounded border border-border-light bg-background-secondary px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            <span>{t('clear_device_filter', 'Cihaz Filtresini Kaldır')}</span>
          </button>
        )}
      </div>

      <div className="divide-y divide-border-light">
        {devices.map((device) => {
          const filterToken = device.shortBrowser || device.deviceLabel;
          const isFiltered =
            Boolean(activeUserAgentFilter) &&
            activeUserAgentFilter.toLowerCase() === filterToken.toLowerCase();

          return (
            <div
              key={device.key}
              className="flex flex-col justify-between gap-3 px-5 py-3.5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-start gap-3.5">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border-light bg-background-secondary">
                  <DeviceIcon type={device.deviceType} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-text-primary">
                      {device.deviceLabel}
                      {device.osLabel ? ` · ${device.osLabel}` : ''}
                    </h3>
                    <span className="rounded-sm bg-background-secondary px-1.5 py-0.5 text-xs font-medium text-text-secondary">
                      {device.browserLabel}
                    </span>

                    {device.isCurrentDevice ? (
                      <span className="inline-flex items-center gap-1.5 rounded-sm border border-border-light bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden />
                        <span>{t('current_device', 'Bu cihaz · Aktif')}</span>
                      </span>
                    ) : device.lastEventType === 'LOGOUT' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
                        <span className="h-1.5 w-1.5 rounded-full bg-text-muted" aria-hidden />
                        <span>{t('logged_out_device', 'Çıkış yapıldı')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                        <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary" aria-hidden />
                        <span>{t('recognized_device', 'Tanınan cihaz')}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
                    {device.ipAddress ? (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Globe className="h-3 w-3 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
                        <span>{device.ipAddress}</span>
                      </span>
                    ) : (
                      <span>{t('active_browser_session', 'Tarayıcı oturumu açık')}</span>
                    )}

                    {device.lastSeen && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="tabular-nums">
                          {t('last_activity_label', 'Son işlem:')}{' '}
                          {formatDateTime(device.lastSeen)}
                        </span>
                      </>
                    )}

                    {device.eventCount > 0 && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="tabular-nums">
                          {device.eventCount} {t('events', 'kayıt')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {device.eventCount > 0 && onFilterByDevice && (
                <div className="flex shrink-0 items-center sm:ml-4">
                  <button
                    type="button"
                    onClick={() =>
                      onFilterByDevice(isFiltered ? '' : filterToken)
                    }
                    className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${isFiltered
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-light bg-background-primary text-text-secondary hover:border-border hover:text-text-primary'
                      }`}
                  >
                    <Filter className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                    <span>
                      {isFiltered
                        ? t('filtered', 'Filtrelendi')
                        : t('view_device_logs', 'Hareketleri Gör')}
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SecurityDevices;

