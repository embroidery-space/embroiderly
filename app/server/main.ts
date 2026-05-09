export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle Sentry tunnel.
    if (url.pathname.startsWith("/errors")) return handleSentry(request);

    // Handle PostHog proxy.
    if (url.pathname.startsWith("/usage")) return handlePostHog(request, url, ctx);

    // Serve static assets for all other requests.
    return env.ASSETS.fetch(request);
  },
};

async function handleSentry(request: Request): Promise<Response> {
  const { readable, writable } = new TransformStream();
  request.body!.pipeTo(writable);

  const [header, body] = readable.tee();

  const decoder = new TextDecoder();
  let chunk = "";

  const headerReader = header.getReader();
  while (true) {
    const { done, value } = await headerReader.read();
    if (done) break;

    chunk += decoder.decode(value);

    const index = chunk.indexOf("\n");
    if (index >= 0) {
      const event = JSON.parse(chunk.slice(0, index));

      const dsn = new URL(event.dsn);
      const headers = new Headers(request.headers);
      headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP")!);

      return await fetch(`https://${dsn.host}/api${dsn.pathname}/envelope/`, { method: "POST", body, headers });
    }
  }

  return new Response("Invalid Sentry Payload", { status: 400 });
}

async function handlePostHog(request: Request, url: URL, ctx: ExecutionContext): Promise<Response> {
  const targetPath = url.pathname.replace("/usage", "");

  if (targetPath.startsWith("/static/") || targetPath.startsWith("/array/")) {
    let response = await caches.default.match(request);
    if (!response) {
      response = await fetch(`https://eu-assets.i.posthog.com${targetPath + url.search}`);
      ctx.waitUntil(caches.default.put(request, response.clone()));
    }
    return response;
  }

  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP")!);

  return await fetch(`https://eu.i.posthog.com${targetPath + url.search}`, {
    headers,
    method: request.method,
    body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : null,
    redirect: request.redirect,
  });
}
