import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { products, filters } = await req.json();

  const prompt = `
You are a PC hardware expert acting as a silent ranking engine.

The user wants a ${filters.category} with these preferences:
- Budget: up to $${filters.maxPrice}
- Brand: ${filters.brand}
${filters.category === "CPU" ? `- Socket: ${filters.socket}` : ""}
- Resolution: ${filters.resolution}
- Use Cases: ${filters.useCases.length > 0 ? filters.useCases.join(", ") : "General use"}
${filters.gpuModel ? `- Their GPU: ${filters.gpuModel}` : ""}

---

STEP 1 — DETERMINE REQUIRED PERFORMANCE TIER FROM USE CASES:

Before ranking anything, assess what performance tier the user's use cases actually demand.
Do NOT default to high-end just because the budget allows it — match the tier to the workload.

${filters.category === "GPU" ? `
GPU workload tiers:

LIGHT (budget/mid-range cards are ideal — RX 6600, RTX 4060 and below):
- Esports / competitive gaming: high FPS at 1080p low-medium settings, raw FPS > visual fidelity.
- General gaming at 1080p: mid-range is the sweet spot, overkill cards waste budget.
- Office / general use: integrated graphics or entry-level discrete only.

MEDIUM (mid-to-upper-mid cards — RTX 4070, RX 7700 XT range):
- AAA/Story games at 1080p–1440p: balance rasterization and price per frame.
- Content creation / video editing: prioritize VRAM (10GB+), encode/decode engines, driver maturity.
- CAD & Engineering: stable drivers and viewport performance, VRAM over raw compute.
- Streaming: encode/decode engine matters more than raw GPU power.

HIGH (high-end cards — RTX 4080, RX 7900 XT and above):
- AAA/Story games at 4K: prioritize rasterization headroom and VRAM (16GB+).
- 3D Rendering: maximize VRAM and compute (CUDA cores / stream processors).
- AI/ML: VRAM 16GB+ is mandatory, tensor performance, NVIDIA strongly preferred for CUDA.
- Workstation: stability, compute, professional driver support. Pro cards acceptable here only.

EXCLUSION RULE: NEVER recommend workstation/professional cards (RTX Ada, A-series, L-series) for any gaming or esports use case regardless of budget.
` : `
CPU workload tiers:

LIGHT (budget/mid-range — Ryzen 5 / i5 current gen is the ceiling):
- General use and office work: efficiency and value, raw performance not needed.
- Light gaming at 1080p: clock speed matters, but mid-range is more than enough.
- Streaming (software-only, casual): a few extra cores help but budget chips are fine.

MEDIUM (mid-to-upper-mid — Ryzen 5 high-end / Ryzen 7 low-end / i5 high-end / i7 low-end):
- Gaming at 1080p–1440p: strong single-threaded speed, 6–8 cores ideal.
- Content creation / video editing (non-professional): multi-threaded performance, 8–12 cores.
- Streaming (dedicated stream PC or dual-purpose): more cores help, i7/Ryzen 7 range.
- CAD & Engineering: single-threaded stability, mid-range is sufficient.

HIGH (high-end only — Ryzen 9 / i9 / Ryzen 7 top-end / i7 top-end):
- Professional video editing / heavy content creation: maximize core count and memory bandwidth.
- 3D Rendering: core count is king, more threads = faster renders.
- AI/ML: core count, memory bandwidth, platform support (AMD vs Intel matters here).
- VMs: thread count is the primary constraint, go as high as budget allows.
- Workstation: ECC support, reliability, sustained multi-threaded throughput.
- Heavy gaming + streaming simultaneously: needs headroom, high-end mid or better.
`}

---

STEP 2 — RESOLUTION MODIFIER:

Adjust the required tier upward if the resolution demands it:
- 1080p: no adjustment, use the tier from Step 1 as-is.
- 1440p: if the use case lands in LIGHT, push to MEDIUM minimum. MEDIUM stays MEDIUM.
- 4K: if the use case lands in LIGHT or MEDIUM, push to HIGH minimum. Anything below HIGH at 4K is a poor recommendation.

${filters.gpuModel ? `
---

STEP 3 — BOTTLENECK CHECK (only after Steps 1 and 2 are resolved):

The user owns a ${filters.gpuModel}. After determining the correct performance tier from use cases and resolution, verify the recommended CPU is not a bottleneck for this GPU.

GPU tier classification for bottleneck purposes:
- Entry-level (GTX 1650, RX 6500 XT, etc.): any modern mid-range CPU is sufficient.
- Mid-range (RTX 4060, RX 7600, RTX 3070, etc.): minimum Ryzen 5 7600X / i5-13600K.
- High-end (RTX 4080, RX 7900 XT, RTX 3090, etc.): minimum Ryzen 7 7700X / i7-13700K.
- Flagship (RTX 4090, RTX 5080, RTX 5090, RX 7900 XTX, etc.): minimum Ryzen 9 / i9 / top-end i7. An i3 or i5 of ANY generation paired with a ${filters.gpuModel} is an automatic disqualification from top rankings.

Classify ${filters.gpuModel} into the correct tier and enforce its minimum CPU floor.
If the use case tier from Steps 1–2 already meets or exceeds the bottleneck minimum, no change needed.
If the bottleneck minimum is HIGHER than the use case tier, raise the floor to match — but only as much as needed, do not over-correct.
At ${filters.resolution}, bottleneck risk is ${filters.resolution === "4K" ? "lower (GPU-bound workload) — apply bottleneck rules but weight them slightly less aggressively" : filters.resolution === "1440p" ? "significant — enforce bottleneck minimum strictly" : "high — enforce bottleneck minimum strictly at 1080p where CPU is the limiting factor"}.
` : ""}

---

FINAL RANKING RULES:
1. Use case fit is the primary ranking signal — a perfectly matched cheaper option beats an overpowered expensive one.
2. Never recommend more hardware than the workload justifies, even if the budget allows it.
3. Budget is a ceiling, not a target — do not pad recommendations toward the cap without justification.
4. Options that violate the tier floor from any step above must be ranked at the bottom.
5. Within the correct tier, rank by best price-to-performance for the specific use cases chosen.

Here are the available products with their IDs:
${products
  .map((p: any, i: number) => `${i + 1}. ID=${p.id} | ${p.name} | $${p.price}`)
  .join("\n")}

The ONLY valid IDs you can use are: [${products.map((p: any) => p.id).join(", ")}]

Rank ALL of these products from best to worst for the specified use case(s).

IMPORTANT:
- Reply with ONLY a JSON array of IDs.
- Do NOT use markdown.
- Do NOT use \`\`\`json.
- Do NOT explain anything.

Example:
[3,1,5,2,4]
`;
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a ranking engine. Respond ONLY with valid JSON. Never use markdown or code fences.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    }
  );

  const data = await response.json();

  console.log("FULL GROQ RESPONSE:");
  console.log(JSON.stringify(data, null, 2));

  const rawContent = data.choices?.[0]?.message?.content ?? "[]";

  console.log("RAW CONTENT:");
  console.log(rawContent);

  const cleanedContent = rawContent
    .replace(/json\s*/gi, "")
    .replace(/\s*/g, "")
    .trim();

  console.log("CLEANED CONTENT:");
  console.log(cleanedContent);

  try {
    const rankedIds = JSON.parse(cleanedContent);

    return NextResponse.json({
      rankedIds,
    });
  } catch (err) {
    console.error("JSON PARSE FAILED:", err);

    return NextResponse.json({
      rankedIds: [],
      rawContent,
      cleanedContent,
      debug: data,
    });
  }
}