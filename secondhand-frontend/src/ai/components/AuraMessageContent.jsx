import AuraPriceAdvisorGauge from './AuraPriceAdvisorGauge.jsx';

const GAUGE_RE = /<PriceAdvisorGauge\s+([^>]+)\s*\/?>/i;

const InlineText = ({ text, isUser }) => {
  // Parses **bold** and `code`.
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className={`font-semibold ${isUser ? 'text-white' : 'text-text-primary'}`}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={index} className="rounded-sm border border-border bg-background-tertiary px-1.5 py-0.5 font-mono text-xs text-text-primary">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
};

const FormattedText = ({ text, isUser }) => (
  <div className={`space-y-1.5 text-sm leading-relaxed ${isUser ? 'text-white' : 'text-text-primary'}`}>
    {text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-1.5" />;
      if (trimmed.startsWith('### ')) return <h4 key={i} className="mb-1 mt-2 text-sm font-semibold">{trimmed.slice(4)}</h4>;
      if (trimmed.startsWith('## ')) return <h3 key={i} className="mb-1 mt-3 text-base font-semibold">{trimmed.slice(3)}</h3>;
      if (/^[-•*] /.test(trimmed)) {
        return (
          <div key={i} className="flex items-start gap-2 py-0.5 pl-1">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${isUser ? 'bg-white' : 'bg-text-secondary'}`} />
            <span className="flex-1"><InlineText text={trimmed.slice(2)} isUser={isUser} /></span>
          </div>
        );
      }
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={i} className="flex items-start gap-2 py-0.5 pl-1">
            <span className={`shrink-0 tabular-nums ${isUser ? 'text-white/80' : 'text-text-tertiary'}`}>{numMatch[1]}.</span>
            <span className="flex-1"><InlineText text={numMatch[2]} isUser={isUser} /></span>
          </div>
        );
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={i} className={`my-1 border-l-2 py-1 pl-3 ${isUser ? 'border-white/40 text-white/90' : 'border-border text-text-secondary'}`}>
            <InlineText text={trimmed.slice(2)} isUser={isUser} />
          </blockquote>
        );
      }
      return <p key={i} className="whitespace-pre-wrap"><InlineText text={line} isUser={isUser} /></p>;
    })}
  </div>
);

// Renders assistant/user markdown-lite text; an embedded <PriceAdvisorGauge .../> tag becomes the gauge component.
const AuraMessageContent = ({ content, isUser }) => {
  if (typeof content !== 'string') return content;
  const match = content.match(GAUGE_RE);
  if (!match) return <FormattedText text={content} isUser={isUser} />;

  const attr = (name) => match[1].match(new RegExp(`${name}="([^"]+)"`, 'i'))?.[1] ?? null;
  const index = content.indexOf(match[0]);
  const before = content.substring(0, index).trim();
  const after = content.substring(index + match[0].length).trim();
  return (
    <div className="space-y-3">
      {before && <FormattedText text={before} isUser={isUser} />}
      <AuraPriceAdvisorGauge
        min={attr('min')}
        max={attr('max')}
        avg={attr('avg')}
        current={attr('current')}
        currency={attr('currency') || 'TRY'}
        status={attr('status') || 'Good Deal'}
      />
      {after && <FormattedText text={after} isUser={isUser} />}
    </div>
  );
};

export default AuraMessageContent;
