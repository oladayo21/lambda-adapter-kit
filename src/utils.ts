export function normalizeHeaders(
  headers: Record<string, string | string[] | undefined>
): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      normalized[key] = value.join(', ');
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}

export function parseMultiValueHeaders(
  headers: Record<string, string | string[]>
): Record<string, string[]> {
  const parsed: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      parsed[key] = value;
    } else {
      parsed[key] = value.split(', ');
    }
  }

  return parsed;
}

export function isValidHttpMethod(method: string): boolean {
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  return validMethods.includes(method.toUpperCase());
}

export function sanitizePath(path: string): string {
  return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}
