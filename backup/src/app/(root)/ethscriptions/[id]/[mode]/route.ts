import { getEthscriptionDetailed } from '@/eths-library';
import { EnumAllDetailed } from '@/eths-library/types';

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ [key: string]: string }> },
) => {
  const url = new URL(req.url);
  const { id, mode } = await params;
  const host = req.headers.get('host') || '';
  const chain = host.toLowerCase().includes('sepolia') ? 'sepolia' : 'mainnet';
  const apiBaseUrl =
    chain === 'sepolia'
      ? 'https://sepolia-api-v2.ethscriptions.com'
      : 'https://api.ethscriptions.com/v2';

  const resp = await getEthscriptionDetailed(id.replaceAll(',', ''), mode as EnumAllDetailed, {
    baseURL: apiBaseUrl,
  });

  if (!resp.ok) {
    return Response.json({ error: resp.error }, { status: resp.error.httpStatus });
  }

  const { result, headers } = resp;

  if (result instanceof Uint8Array) {
    return new Response(result, { headers });
  }

  return Response.json({ result }, { headers });
};
