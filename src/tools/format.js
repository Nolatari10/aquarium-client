export function formatLabel(key, t) {
  const label = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

  if (!t) return label;

  const byKey = t(key);
  if (byKey !== key) return byKey;

  const byLabel = t(label);
  if (byLabel !== label) return byLabel;

  return label;
}

export function formatCellValue(value, key, t) {
  if (value === null || value === undefined) return '';
  const keyLower = (key || '').toLowerCase();
  if (typeof value === 'number') {
    if (/cost|value|revenue|amount|price/.test(keyLower)) {
      return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
    return value.toLocaleString();
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleDateString();
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) return String(value.length);
  if (typeof value === 'boolean') {
    if (!t) return value ? 'Yes' : 'No';
    return value ? t('Yes') : t('No');
  }
  return String(value);
}
