/**
 * Input validation utilities for security and data integrity.
 * Never trust user input — always validate and sanitize.
 */

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 254;
}

export function validateUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateSlug(slug: string): boolean {
  const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return regex.test(slug) && slug.length > 0 && slug.length <= 200;
}

export function validateLength(value: string, min: number = 0, max: number = 10000): boolean {
  const len = (value || '').trim().length;
  return len >= min && len <= max;
}

export function sanitizeHtml(html: string): string {
  // Basic HTML escaping for user-generated content displayed as text
  // Note: For rich content, use a proper library like DOMPurify
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return html.replace(/[&<>"']/g, (m) => map[m]);
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic validation: allow digits, spaces, hyphens, parentheses, plus
  const regex = /^[\d\s\-()+]*$/;
  return regex.test(phone) && phone.length > 5 && phone.length <= 20;
}

export function validateYearLabel(label: string): boolean {
  // Allow years like "2024" or text like "Early Career"
  return validateLength(label, 2, 100);
}
