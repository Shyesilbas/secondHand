/** API bazen Long, JWT/localStorage bazen string id döner */
export const sameChatId = (a, b) =>
  a != null && b != null && String(a) === String(b);
