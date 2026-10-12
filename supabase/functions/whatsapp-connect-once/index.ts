// Retired one-shot helper. Intentionally inert.
Deno.serve(() =>
  new Response(JSON.stringify({ ok: false, error: "This helper has been retired" }), {
    status: 410,
    headers: { "Content-Type": "application/json" },
  })
);
