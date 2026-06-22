import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side proxy for OpenAI chat completions.
// The OpenAI key stays on the server (process.env) and is never sent to the
// browser. The browser cannot call api.openai.com directly (CORS), so all
// chatbot traffic must go through this endpoint.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Prefer the secret server-only var; fall back to the legacy VITE_ one so
  // this keeps working if only that is set in Vercel.
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured on the server' });
  }

  try {
    const { messages, model, temperature, max_tokens } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'A non-empty "messages" array is required' });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        max_tokens: typeof max_tokens === 'number' ? max_tokens : 500,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error('OpenAI API error:', data);
      return res.status(openaiRes.status).json({
        error: data?.error?.message || 'OpenAI request failed',
        code: data?.error?.code,
      });
    }

    const content = data?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ content });
  } catch (err) {
    console.error('Chat proxy error:', err);
    return res.status(500).json({ error: 'Failed to reach OpenAI' });
  }
}
