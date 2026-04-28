import { NextRequest } from 'next/server';
import { auth } from '../../../lib/auth';
import { fetchViaCep, normalizeCep } from '../../../lib/viacep';
import { badRequest, ok, unauthorized, unprocessable } from '../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const cep = req.nextUrl.searchParams.get('cep') ?? '';
  const clean = normalizeCep(cep);
  if (clean.length !== 8) {
    return badRequest('Informe um CEP com 8 dígitos.');
  }

  try {
    const data = await fetchViaCep(clean);
    if ('erro' in data && data.erro) {
      return unprocessable('CEP não encontrado.');
    }
    return ok(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao buscar CEP.';
    return unprocessable(message);
  }
}
