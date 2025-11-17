export async function POST(req: Request) {
  try {
    const { question, model, temperature } = await req.json();

    const backendRes = await fetch(process.env.PY_BACKEND_URL + "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, model, temperature }),
    });

    if (!backendRes.ok) {
      return new Response("Backend error", { status: backendRes.status });
    }

    // Stream the backend response directly to the client
    return new Response(backendRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}