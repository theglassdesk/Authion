import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, provider, messages, apiKey: clientApiKey } = await req.json();

    // Determine the actual API key to use
    let apiKey = clientApiKey;
    let baseURL: string | undefined = undefined;

    if (provider === 'OpenAI') {
      apiKey = clientApiKey || process.env.OPENAI_API_KEY;
      baseURL = 'https://api.openai.com/v1';
    } else if (provider === 'OpenRouter') {
      apiKey = clientApiKey || process.env.OPENROUTER_API_KEY;
      baseURL = 'https://openrouter.ai/api/v1';
    } else if (provider === 'Local') {
      // For local LLMs running on the client's machine (e.g. Ollama),
      // we usually fetch directly from the client side because server
      // is running in a sandbox. But if we need a proxy for standard completion APIs:
      // Return error instructing client to fetch directly
      return NextResponse.json(
        { error: 'Requests to local LLMs should be made directly from the client browser.' },
        { status: 400 }
      );
    } else {
      // Default to Gemini
      apiKey = process.env.GEMINI_API_KEY;
    }

    if (!apiKey && provider !== 'Local') {
      return NextResponse.json({ error: `API Key for ${provider || 'Google'} is missing.` }, { status: 401 });
    }

    // Since we support multiple providers, we'll route dynamically.
    // For OpenAI / OpenRouter, we use standard fetch to their chat completions API
    if (provider === 'OpenAI' || provider === 'OpenRouter') {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(provider === 'OpenRouter' ? {
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'Authion',
          } : {})
        },
        body: JSON.stringify({
          model: model || (provider === 'OpenRouter' ? 'anthropic/claude-3-haiku' : 'gpt-3.5-turbo'),
          messages: messages || [{ role: 'user', content: prompt }],
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to fetch from LLM');
      }

      return NextResponse.json({ text: data.choices[0].message.content });
    }

    // Default: Google Gemini
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (err: any) {
    console.error('AI Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
