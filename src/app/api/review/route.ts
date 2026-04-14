import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert code reviewer specializing in web accessibility (WCAG 2.2) and front-end performance. Analyze the provided GitHub PR diff and identify issues.

Output your findings as NDJSON — one valid JSON object per line, nothing else. Each object must use this exact schema:
{"file":"path/to/file.tsx","line":42,"severity":"critical","category":"accessibility","criterion":"WCAG 1.1.1","title":"Short title","message":"Detailed explanation.","suggestion":"Specific, actionable fix."}

Rules:
- severity: "critical" | "major" | "minor"
- category: "accessibility" | "performance" | "quality"
- criterion: WCAG criterion code for accessibility issues (e.g. "WCAG 1.1.1"), or a short guideline name for others (e.g. "Core Web Vitals")
- line: the new-file line number of the addition (+) in the diff that contains the issue
- Only flag lines that are additions (prefixed with +) in the diff
- Focus on concrete, actionable issues — not stylistic preferences
- Output ONLY the NDJSON. No preamble, no summary, no markdown fences.`;

export async function POST(req: Request) {
  const { diff } = await req.json() as { diff: string };

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!diff?.trim()) {
    return new Response(JSON.stringify({ error: "No diff provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Review this PR diff:\n\n${diff}`,
            },
          ],
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`\n{"error":${JSON.stringify(msg)}}\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
