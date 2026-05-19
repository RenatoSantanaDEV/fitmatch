import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat');
  const lng = req.nextUrl.searchParams.get('lng');

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!lat || !lng || !Number.isFinite(latNum) || !Number.isFinite(lngNum) ||
      latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return NextResponse.json({ error: 'lat e lng são obrigatórios.' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lngNum}&addressdetails=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'FitConnect-TCC/1.0' },
  }).catch(() => null);

  if (!res?.ok) {
    return NextResponse.json({ error: 'Falha ao obter localização.' }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  const address = data?.address ?? {};

  const city: string =
    address.city ?? address.town ?? address.village ?? address.municipality ?? '';

  const stateCode: string = address['ISO3166-2-lvl4']?.split('-')[1] ?? address.state_code ?? '';

  return NextResponse.json({ city, state: stateCode.toUpperCase().slice(0, 2) });
}
