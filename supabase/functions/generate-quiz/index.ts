import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { factsText } = await req.json();

    if (!factsText || typeof factsText !== "string") {
      return new Response(
        JSON.stringify({ error: "factsText is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const prompt = `You are a quiz generator for students reviewing their notes.

Create a multiple choice quiz from the following study material:
${factsText}

Rules:
1. Generate exactly 1 question per distinct fact or concept in the input.
2. Mix question styles — some should test recall (e.g., "What is...?") and others should test application (e.g., "Which of the following describes...?" or "A student observes X. This is an example of...?").
3. Each question has 4 answer choices with exactly 1 correct answer.
4. Make distractors plausible — use related terms, similar concepts, or common misconceptions from the same subject area.
5. Keep all answer choices similar in length and detail.
6. Randomize the position of the correct answer across questions.
7. Difficulty should be appropriate for a study review session — challenging enough to confirm understanding, not trick questions.

Return ONLY a JSON array with this exact structure, no other text:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0
  }
]`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(
        JSON.stringify({ error: `Groq API error: ${response.status}`, details: errorBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    let jsonMatch = text.match(/(\[\s*\{.*\}\s*\])/s);
    let jsonText = jsonMatch ? jsonMatch[0] : text;
    jsonText = jsonText.replace(/```json|```/g, "").trim();
    jsonText = jsonText.replace(/\/\/.*$/gm, "");

    const quizData = JSON.parse(jsonText);

    if (!Array.isArray(quizData) || quizData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid quiz data structure from LLM" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify(quizData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
