export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };

export function makePhoneNumber(raw: string): PhoneNumber {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    throw new Error('Invalid phone number');
  }
  return raw as PhoneNumber;
}
