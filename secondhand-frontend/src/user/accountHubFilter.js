export const filterAccountHubSections = (sections, query) => {
  if (!query || !query.trim()) {
    return sections;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const title = item.title.toLowerCase();
        const desc = item.desc.toLowerCase();
        return title.startsWith(normalizedQuery) || title.includes(normalizedQuery) || desc.includes(normalizedQuery);
      })
    }))
    .filter((section) => section.items.length > 0);
};
