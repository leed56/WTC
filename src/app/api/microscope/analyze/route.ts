import { NextRequest, NextResponse } from 'next/server';
import { INCLUSION_DIAGNOSTIC_RULES } from '@/lib/gemConstantsDb';

function parseDataUrl(dataUrl: string): { mimeType: string; base64Data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    base64Data: match[2]
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageDataUrl,
      provider = 'gemini',
      apiKey,
      model,
      refractiveIndex,
      specificGravity,
      species,
      variety,
      color
    } = body;

    if (!imageDataUrl) {
      return NextResponse.json(
        { success: false, error: 'Please upload a microscope photomicrograph first.' },
        { status: 400 }
      );
    }

    const resolvedKey =
      apiKey?.trim() ||
      (provider === 'openai'
        ? process.env.OPENAI_API_KEY
        : process.env.GEMINI_API_KEY) ||
      '';

    if (!resolvedKey) {
      return NextResponse.json(
        {
          success: false,
          needsKey: true,
          error:
            provider === 'openai'
              ? 'No OpenAI API Key configured. Click "AI Settings" in Stage 04 to enter your OpenAI key.'
              : 'No Gemini API Key configured. Click "AI Settings" in Stage 04 to enter your Google Gemini API key.'
        },
        { status: 400 }
      );
    }

    const rulesList = INCLUSION_DIAGNOSTIC_RULES.map(
      (r) => `- id: "${r.id}" | category: "${r.category}" | label: "${r.label}"`
    ).join('\n');

    const promptText =
      `You are a Senior Gemologist specializing in photomicrography and inclusion analysis.\n` +
      `Analyze the attached gemstone microscope photomicrograph together with these bench measurements:\n` +
      `- Candidate Species: ${species || 'Unknown'}\n` +
      `- Candidate Variety: ${variety || 'Unknown'}\n` +
      `- Color: ${color || 'Unknown'}\n` +
      `- Refractive Index (R.I.): ${refractiveIndex || 'Not specified'}\n` +
      `- Specific Gravity (S.G.): ${specificGravity || 'Not specified'}\n\n` +
      `Available Diagnostic Rule IDs:\n${rulesList}\n\n` +
      `Inspect the photomicrograph carefully for: natural rutile silk needles (intact 60°/120° vs. dotted/resorbed), ` +
      `discoid thermal stress halos ("lily-pad"), multi-phase fluid inclusions, angular growth zoning, ` +
      `fissure flash-effect / clarity fillers, curved growth striae, spherical/tadpole gas bubbles, wispy flux veils, ` +
      `platinum platelets, or hydrothermal chevron growth.\n\n` +
      `Return ONLY valid JSON with this exact schema:\n` +
      `{\n` +
      `  "detectedFeatures": ["short bullet 1", "short bullet 2"],\n` +
      `  "matchedRuleIds": ["rule-id-from-list"],\n` +
      `  "suggestedClassification": "Natural" | "Heated" | "Treated" | "Synthetic",\n` +
      `  "confidenceScore": 0-100,\n` +
      `  "gemologistNotes": "Concise 1-2 sentence formal microscopic observation suitable for an official gemological report.",\n` +
      `  "cautionNote": "Any lighting, focus, or magnification caveat for the verifying gemologist."\n` +
      `}`;

    if (provider === 'openai') {
      const openaiModel = model || 'gpt-4o';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resolvedKey}`
        },
        body: JSON.stringify({
          model: openaiModel,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: promptText },
                {
                  type: 'image_url',
                  image_url: { url: imageDataUrl, detail: 'high' }
                }
              ]
            }
          ],
          max_tokens: 800
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            error: data?.error?.message || `OpenAI API error (HTTP ${res.status})`
          },
          { status: 502 }
        );
      }

      const rawText = data?.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawText);

      return NextResponse.json({
        success: true,
        provider: 'openai',
        model: openaiModel,
        analysis: parsed
      });
    }

    // Default: Google Gemini Vision API
    const parsedImg = parseDataUrl(imageDataUrl);
    if (!parsedImg) {
      return NextResponse.json(
        {
          success: false,
          error: 'Microscope image must be a valid uploaded image file (base64 data URL).'
        },
        { status: 400 }
      );
    }

    const geminiModel = model || 'gemini-2.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      geminiModel
    )}:generateContent?key=${encodeURIComponent(resolvedKey)}`;

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: parsedImg.mimeType,
                  data: parsedImg.base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.error?.message || `Gemini API error (HTTP ${res.status})`
        },
        { status: 502 }
      );
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(rawText);

    return NextResponse.json({
      success: true,
      provider: 'gemini',
      model: geminiModel,
      analysis: parsed
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Unexpected error analyzing microscope photomicrograph.'
      },
      { status: 500 }
    );
  }
}
