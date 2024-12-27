export const GET = (req: Request) => {
  const url = new URL(req.url);

  return Response.json({ ok: true, url: url.toString() });
};
