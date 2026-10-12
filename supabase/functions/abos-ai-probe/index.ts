// Mission 00 security retirement.
// The temporary diagnostic endpoint exposed model probing behind a hard-coded query-string key.
// It is intentionally retired. Keep this stub until the function can be removed through the
// supported Supabase project controls.
Deno.serve((_req: Request) => {
  return new Response(
    JSON.stringify({ error: "This diagnostic endpoint has been retired." }),
    {
      status: 410,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
});
