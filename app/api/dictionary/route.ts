import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word')?.trim();

  if (!word) {
    return NextResponse.json({ error: 'Missing word parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Dictionary lookup failed' }, { status: response.status });
    }

    const payload = await response.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json({ error: 'No dictionary entry found' }, { status: 404 });
    }

    const entry = payload[0];
    const firstMeaning = entry.meanings?.[0]?.definitions?.[0]?.definition ?? 'Meaning not available.';
    const example = entry.meanings?.[0]?.definitions?.[0]?.example ?? '';

    return NextResponse.json({
      word: entry.word ?? word,
      meaning: firstMeaning,
      example
    });
  } catch {
    return NextResponse.json({ error: 'Dictionary service unavailable' }, { status: 502 });
  }
}
