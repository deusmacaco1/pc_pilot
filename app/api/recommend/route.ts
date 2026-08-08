import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { products, filters } = await req.json();

    if (!Array.isArray(products) || !filters) {
      return NextResponse.json(
        { rankedIds: [], error: "Invalid request data" },
        { status: 400 }
      );
    }

    const category = filters.category;
    const maxPrice = filters.maxPrice;
    const brand = filters.brand;
    const socket = filters.socket;
    const resolution = filters.resolution;
    const refreshRate = filters.refreshRate;
    const useCases = Array.isArray(filters.useCases)
      ? filters.useCases
      : [];
    const gpuModel = filters.gpuModel || "";

    /*
     * DISPLAY EXPERIENCE
     *
     * Higher refresh rate = more CPU importance.
     * Higher resolution = more GPU importance.
     */

    let cpuWeight = 50;
    let gpuWeight = 50;
    let displayProfile = "Balanced CPU/GPU";

    if (resolution === "1080p") {
      if (refreshRate !== null && refreshRate >= 360) {
        cpuWeight = 85;
        gpuWeight = 15;
        displayProfile = "Extreme CPU priority";
      } else if (refreshRate !== null && refreshRate >= 240) {
        cpuWeight = 75;
        gpuWeight = 25;
        displayProfile = "Strong CPU priority";
      } else {
        cpuWeight = 65;
        gpuWeight = 35;
        displayProfile = "CPU-leaning";
      }
    } else if (resolution === "1440p") {
      if (refreshRate !== null && refreshRate >= 360) {
        cpuWeight = 70;
        gpuWeight = 30;
        displayProfile = "Strong CPU priority";
      } else if (refreshRate !== null && refreshRate >= 240) {
        cpuWeight = 60;
        gpuWeight = 40;
        displayProfile = "CPU/GPU balanced with CPU emphasis";
      } else if (refreshRate !== null && refreshRate >= 144) {
        cpuWeight = 50;
        gpuWeight = 50;
        displayProfile = "Balanced CPU/GPU";
      } else {
        cpuWeight = 40;
        gpuWeight = 60;
        displayProfile = "GPU-leaning";
      }
    } else if (resolution === "4K") {
      if (refreshRate !== null && refreshRate >= 240) {
        cpuWeight = 30;
        gpuWeight = 70;
        displayProfile = "Extreme GPU priority";
      } else if (refreshRate !== null && refreshRate >= 144) {
        cpuWeight = 25;
        gpuWeight = 75;
        displayProfile = "Strong GPU priority";
      } else {
        cpuWeight = 20;
        gpuWeight = 80;
        displayProfile = "Extreme GPU priority";
      }
    }

    if (resolution === "All" && refreshRate === null) {
      cpuWeight = 50;
      gpuWeight = 50;
      displayProfile = "No specific display target";
    }

    /*
     * REFRESH RATE RULES
     */

    let refreshRules = "No specific refresh-rate requirement.";

    if (refreshRate !== null) {
      if (refreshRate >= 360) {
        refreshRules = `
- 360Hz+ is an extreme high-refresh target.
- Strongly prioritize top-tier gaming CPUs.
- Prioritize single-core performance, IPC, cache, frame-time consistency,
  and 1% lows.
- Weak entry-level and mid-range CPUs should be heavily penalized.
`;
      } else if (refreshRate >= 240) {
        refreshRules = `
- 240Hz+ is a high-refresh target.
- Favor strong modern gaming CPUs.
- Prioritize frame-time consistency and 1% lows.
`;
      } else if (refreshRate >= 144) {
        refreshRules = `
- 144Hz+ is a high-refresh target.
- Favor hardware capable of maintaining high and stable frame rates.
`;
      }
    }

    /*
     * GPU PAIRING
     */

    const gpuPairingRules = gpuModel
      ? `
The user currently has this GPU:

"${gpuModel}"

When recommending a CPU, avoid severe CPU bottlenecks.
At lower resolutions and higher refresh rates, CPU performance becomes
more important.
At 4K, GPU performance generally becomes more dominant.
`
      : "No external GPU was provided.";

    /*
     * WORKLOADS
     */

    const workloadText =
      useCases.length > 0 ? useCases.join(", ") : "General Use";

    /*
     * PRODUCTS
     *
     * Keep the existing product format for compatibility.
     */

    const productList = products
      .map(
        (p: any) =>
          `ID=${p.id} | ${p.name} | $${p.price}`
      )
      .join("\n");

    const validIds = products.map((p: any) => p.id);

    /*
     * GROQ PROMPT
     */

    const prompt = `
You are PC Pilot's flagship AI Recommendation Engine,
a world-class PC hardware engineer and market analyst.

The user wants a ${category} recommendation.

USER REQUIREMENTS:

- Budget Ceiling: up to $${maxPrice}
- Brand Preference: ${brand}
${category === "CPU" ? `- Socket Preference: ${socket}` : ""}
- Resolution Target: ${resolution}
- Refresh Rate Target: ${
      refreshRate !== null ? `${refreshRate} Hz` : "Not specified"
    }
- Workloads / Use Cases: ${workloadText}
${gpuModel ? `- Paired GPU: ${gpuModel}` : ""}

DISPLAY EXPERIENCE PROFILE:

- ${displayProfile}
- CPU Priority: ${cpuWeight}%
- GPU Priority: ${gpuWeight}%

IMPORTANT DISPLAY LOGIC:

Higher refresh rates increase the importance of CPU performance,
especially at 1080p and 1440p.

Higher resolutions increase the importance of GPU performance.

Never evaluate refresh rate independently from resolution.

For example:

- 1080p 360Hz = heavily CPU-focused
- 1080p 240Hz = CPU-focused
- 1440p 240Hz = balanced with CPU emphasis
- 4K 60Hz = heavily GPU-focused
- 4K 144Hz = strongly GPU-focused
- 4K 240Hz = extremely GPU-demanding while still requiring an adequate CPU

${refreshRules}

${gpuPairingRules}

WORKLOAD PRIORITIES:

- Gaming / Esports:
  Prioritize gaming performance, frame-time consistency and 1% lows.

- AAA / Story Games:
  Consider both CPU and GPU performance, with resolution heavily
  affecting GPU importance.

- AI / Machine Learning:
  For GPUs, prioritize VRAM and compute capability.
  For CPUs, prioritize thread count and relevant instruction support.

- 3D Rendering:
  Prioritize multi-core CPU performance or GPU compute performance
  depending on the category.

- Video Editing / Content Creation:
  Consider multi-core performance, media capabilities and platform
  performance.

- CAD / Engineering:
  Consider strong single-threaded performance as well as adequate
  multi-core performance.

- General Use:
  Favor good value and avoid unnecessary overkill.

RANKING PRIORITIES:

1. Ability to satisfy the user's requirements
2. Display target compatibility
3. Workload compatibility
4. Bottleneck avoidance
5. Price-to-performance
6. Budget compliance
7. Brand and socket preference

IMPORTANT:

The budget is a STRICT MAXIMUM.

Do NOT automatically recommend the most expensive product.

A cheaper product should rank higher when it provides sufficient
performance for the user's target while offering substantially better
price-to-performance.

Only rank an expensive flagship product first when its additional
performance is actually useful for the user's target.

Only rank products from the supplied product list.

Do not invent products.

AVAILABLE PRODUCTS:

${productList}

VALID IDS:

[${validIds.join(", ")}]

OUTPUT:

Return ONLY a raw JSON array containing ranked product IDs.

Example:

[78,12,405,22,11]

Do not use Markdown.
Do not use code fences.
Do not include explanations.
Do not invent IDs.
`;

    /*
     * GROQ REQUEST
     */

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY is missing.");

      return NextResponse.json(
        { rankedIds: [], error: "GROQ_API_KEY is missing." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are a ranking engine. Respond ONLY with valid JSON. Never use Markdown or code fences.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    /*
     * GROQ API ERROR
     */

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "GROQ API ERROR:",
        response.status,
        errorText
      );

      return NextResponse.json(
        {
          rankedIds: [],
          error: "Groq API request failed.",
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    console.log("FULL GROQ RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

    const rawContent =
      data.choices?.[0]?.message?.content ?? "";

    console.log("RAW CONTENT:");
    console.log(rawContent);

    if (!rawContent) {
      return NextResponse.json({
        rankedIds: [],
      });
    }

    /*
     * CLEAN GROQ JSON
     *
     * Handles:
     *
     * [1,2,3]
     *
     * and:
     *
     * ```json
     * [1,2,3]
     * ```
     */

    let cleanedContent = rawContent.trim();

    cleanedContent = cleanedContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const firstBracket = cleanedContent.indexOf("[");
    const lastBracket = cleanedContent.lastIndexOf("]");

    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanedContent = cleanedContent.substring(
        firstBracket,
        lastBracket + 1
      );
    }

    console.log("CLEANED CONTENT:");
    console.log(cleanedContent);

    /*
     * PARSE JSON
     */

    let parsedIds: any;

    try {
      parsedIds = JSON.parse(cleanedContent);
    } catch (err) {
      console.error("JSON PARSE FAILED:", err);

      return NextResponse.json({
        rankedIds: [],
        rawContent,
        cleanedContent,
      });
    }

    /*
     * VALIDATE ARRAY
     */

    if (!Array.isArray(parsedIds)) {
      console.error("GROQ DID NOT RETURN AN ARRAY.");

      return NextResponse.json({
        rankedIds: [],
        rawContent,
        cleanedContent,
      });
    }

    /*
     * VALIDATE IDS
     */

    const validIdSet = new Set(validIds);

    const rankedIds = parsedIds.filter((id: any) =>
      validIdSet.has(id)
    );

    /*
     * REMOVE DUPLICATES
     */

    const uniqueRankedIds = Array.from(new Set(rankedIds));

    console.log("FINAL RANKED IDS:");
    console.log(uniqueRankedIds);

    return NextResponse.json({
      rankedIds: uniqueRankedIds,
    });
  } catch (error) {
    console.error("RECOMMENDATION API ERROR:", error);

    return NextResponse.json(
      {
        rankedIds: [],
        error: "Recommendation engine failed.",
      },
      { status: 500 }
    );
  }
}
