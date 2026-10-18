const capitalize = (key) => key.charAt(0).toUpperCase() + key.slice(1);

export const getMinKey = (fieldKey) => `min${capitalize(fieldKey)}`;
export const getMaxKey = (fieldKey) => `max${capitalize(fieldKey)}`;

