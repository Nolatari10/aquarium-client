import i18n from './i18n'

const t = i18n.t.bind(i18n)

// Extracts a human-readable error message from API responses (ProblemDetails, string, etc.)
export function extractErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) return error?.message || t('An unexpected error occurred');

  // ProblemDetails object from ASP.NET Core
  if (typeof data === 'object') {
    // Validation errors (e.g. {type, title, status, errors: {...}})
    if (data.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).flat();
      return messages.join('; ') || data.title || t('Validation failed');
    }
    return data.title || data.message || t('Request failed');
  }

  return String(data);
}
