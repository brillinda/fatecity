import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Translation service unavailable' }, { status: 502 });
    }

    const payload = await response.json();
    const translated = payload?.responseData?.translatedText ?? payload?.responseData?.match?.[0]?.translation ?? '';

    if (!translated) {
      return NextResponse.json({ error: 'No translation returned' }, { status: 502 });
    }

    return NextResponse.json({ translation: translated });
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
