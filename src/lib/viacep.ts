export type ViaCepResponse =
  | {
      cep: string;
      logradouro: string;
      complemento: string;
      bairro: string;
      localidade: string;
      uf: string;
    }
  | { erro: true };

export function normalizeCep(input: string): string {
  return input.replace(/\D/g, '').slice(0, 8);
}

export async function fetchViaCep(cepDigits: string): Promise<ViaCepResponse> {
  const clean = normalizeCep(cepDigits);
  if (clean.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos.');
  }

  const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    throw new Error('Falha ao consultar ViaCEP.');
  }

  const data = (await res.json()) as ViaCepResponse;
  return data;
}
