/**
 * Safe string conversion - handles objects, errors, and primitives
 */
export function safeString(value: any): string {
  if (value === null || value === undefined) {
    return String(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Error) {
    return value.message || value.toString();
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }
  try {
    return String(value);
  } catch {
    return '[Unable to convert to string]';
  }
}

/**
 * Ensures an Error object - converts any value to Error
 */
export function ensureError(value: any): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  if (typeof value === 'object' && value !== null) {
    const message = (value as any).message || JSON.stringify(value);
    return new Error(message);
  }
  return new Error(String(value));
}
