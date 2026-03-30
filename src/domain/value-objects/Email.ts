export type Email = string & { readonly __brand: 'Email' };

export function makeEmail(raw: string): Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    throw new Error('Invalid email address');
  }
  return raw as Email;
}
