import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return new Response(JSON.stringify({ advice: "Mentor is currently calibrating neural pathways. Keep coding with precision." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { name, score, domain, languages } = await req.json();

    const prompt = `You are a world-class engineering mentor. 
    Analyze this developer profile:
    - Name: ${name}
    - Developer IQ: ${score}/1000
    - Primary Domain: ${domain}
    - Tech Stack: ${Object.keys(languages || {}).join(", ")}

    Provide exactly ONE sentence of high-impact, professional career advice. Be concise and profound.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
        const errData = await response.text();
        console.error("Gemini API Error:", errData);
        throw new Error("Gemini API failed");
    }

    const result = await response.json();
    const advice = result.candidates[0].content.parts[0].text.trim();

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ advice: "Focus on mastering deep architectural patterns in your core stack to reach the next tier." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
