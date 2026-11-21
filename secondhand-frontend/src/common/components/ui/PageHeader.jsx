// Standard page header: keeps H1 size, tracking, subtitle rhythm and action alignment uniform across pages.
// No decorative icon next to the title (icon diet); the title carries the page.
const PageHeader = ({
  title,
  subtitle,
  eyebrow,
  badge,
  back,
  actions,
  bottomBorder = false,
  className = '',
  titleClassName = '',
}) => {
  const borderClass = bottomBorder ? 'pb-4 border-b border-border-light' : '';

  return (
    <div className={`${borderClass} ${className}`.trim()}>
      {back && <div className="mb-2">{back}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1.5 text-sm font-medium text-text-tertiary">{eyebrow}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={`text-2xl font-semibold tracking-tight text-text-primary ${titleClassName}`.trim()}>
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-base text-text-secondary">{subtitle}</p>
            )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
