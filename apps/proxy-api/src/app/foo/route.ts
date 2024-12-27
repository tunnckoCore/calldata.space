export const GET = (_req: Request) => {
  const data = { ok: true };
  return Response.json(data);
};
