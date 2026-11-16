// Allowlist sanitizer for server-provided rich text (agreement content). The content is admin-authored, but a
// compromised admin account or database must not turn it into script execution in every user's browser.
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'small', 'sub', 'sup', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);
// Removed together with their content; every other unknown element is unwrapped and keeps its text.
const DROPPED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript', 'svg', 'math', 'form']);
const SAFE_HREF = /^(https?:|mailto:|\/|#)/i;

const cleanNode = (node) => {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const tag = child.tagName.toLowerCase();
    if (DROPPED_TAGS.has(tag)) {
      child.remove();
      return;
    }
    cleanNode(child);
    if (!ALLOWED_TAGS.has(tag)) {
      child.replaceWith(...child.childNodes);
      return;
    }

    const href = tag === 'a' ? (child.getAttribute('href') || '').trim() : '';
    [...child.attributes].forEach((attr) => child.removeAttribute(attr.name));
    if (tag === 'a' && SAFE_HREF.test(href)) {
      child.setAttribute('href', href);
      child.setAttribute('target', '_blank');
      child.setAttribute('rel', 'noopener noreferrer');
    }
  });
};

export const sanitizeHtml = (html) => {
  if (!html || typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  cleanNode(doc.body);
  return doc.body.innerHTML;
};
