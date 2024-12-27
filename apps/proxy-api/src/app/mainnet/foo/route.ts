export const GET = (_req: Request) => {
  const data = { ok: true, qux: 1 };
  return Response.json(data);
};
