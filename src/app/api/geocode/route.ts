import { NextRequest } from 'next/server';
import { auth } from '../../../lib/auth';
import { geocodeAddress } from '../../../lib/google/geocode';
import { geocodeLocationBodySchema } from '../../../validation/profile/updateLocationSchema';
import { badRequest, ok, unauthorized, unprocessable } from '../../../lib/apiResponse';

function buildAddressLine(parts: {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}): string {
  const postal = parts.postalCode?.replace(/\D/g, '');
  const cepFmt = postal && postal.length === 8 ? `${postal.slice(0, 5)}-${postal.slice(5)}` : parts.postalCode;
  return [parts.street, parts.city, parts.state, cepFmt, parts.country].filter(Boolean).join(', ');
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const raw = await req.json().catch(() => ({}));
  const parsed = geocodeLocationBodySchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) {
    return unprocessable(
      'Geocodificação indisponível: defina GOOGLE_MAPS_SERVER_API_KEY no servidor.',
    );
  }

  try {
    const addressLine = buildAddressLine(parsed.data);
    const result = await geocodeAddress(addressLine, apiKey);
    return ok(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Não foi possível obter coordenadas.';
    return unprocessable(message);
  }
}
