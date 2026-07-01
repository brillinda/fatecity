import { NextResponse } from 'next/server';

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getSentenceCount(text: string) {
  return text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean).length;
}

function buildFeedback(accuracy: number, coverage: number, fluency: number, pronunciation: number, repetitionRate: number, sentenceCoverage: number) {
  const strengths: string[] = [];
  const issues: string[] = [];
  const actionPlan: string[] = [];

  if (accuracy >= 75) {
    strengths.push('You matched the source vocabulary closely and kept the main meaning intact.');
  } else {
    issues.push('Rehearse the key phrases and sentence rhythm so the spoken output aligns more closely with the source.');
  }

  if (coverage >= 70) {
    strengths.push('Your delivery covered the important content of the article.');
  } else {
    issues.push('Try to include more of the article-specific phrases and important details in the next recording.');
  }

  if (fluency >= 70) {
    strengths.push('Your pacing was steady enough to follow the article without frequent interruptions.');
  } else {
    issues.push('Slow down slightly and pause after commas and full stops to improve clarity.');
  }

  if (pronunciation >= 70) {
    strengths.push('Your pronunciation was clear enough for the core message to be understood.');
  } else {
    issues.push('Focus on stressed syllables and repeated chunks from the article to improve pronunciation.');
  }

  if (repetitionRate > 0.2) {
    issues.push('Reduce repeated words and phrases by reading the passage once, then replaying and shadowing it again.');
  }

  if (sentenceCoverage < 60) {
    issues.push('Work through the article sentence by sentence so each paragraph is represented in your spoken response.');
  }

  if (accuracy < 70) {
    actionPlan.push('Read one paragraph at a time and repeat it until the rhythm feels natural.');
  }

  if (coverage < 70) {
    actionPlan.push('Use the full-text recitation view and try to cover each paragraph in the next take.');
  }

  if (fluency < 70) {
    actionPlan.push('Use the playback review and shadow the article in smaller chunks to improve pacing.');
  }

  if (actionPlan.length === 0) {
    actionPlan.push('Keep using the replay tool and schedule one more shadowing round before your next review.');
  }

  return { strengths, issues, actionPlan };
}

export async function POST(request: Request) {
  let body: { source?: string; transcript?: string; title?: string; summary?: string } | null = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  if (!body?.source || !body?.transcript) {
    return NextResponse.json({ error: 'Missing source or transcript.' }, { status: 400 });
  }

  const sourceTokens = tokenize(body.source);
  const transcriptTokens = tokenize(body.transcript);
  const sourceSet = new Set(sourceTokens);
  const transcriptSet = new Set(transcriptTokens);

  const matched = transcriptTokens.filter((token) => sourceSet.has(token)).length;
  const uniqueSourceMatches = sourceTokens.filter((token) => transcriptSet.has(token)).length;
  const accuracy = clamp(Math.round((uniqueSourceMatches / Math.max(sourceTokens.length, 1)) * 100), 0, 100);
  const coverage = clamp(Math.round((matched / Math.max(transcriptTokens.length, 1)) * 100), 0, 100);
  const fluency = clamp(
    Math.round(100 - Math.min(35, Math.abs(transcriptTokens.length - sourceTokens.length) / Math.max(sourceTokens.length, 1) * 100)),
    0,
    100
  );
  const pronunciation = clamp(Math.round((accuracy + coverage) / 2), 0, 100);
  const repetitionRate = transcriptTokens.length === 0
    ? 0
    : 1 - (transcriptSet.size / Math.max(transcriptTokens.length, 1));
  const sentenceCoverage = Math.round((getSentenceCount(body.transcript) / Math.max(getSentenceCount(body.source), 1)) * 100);

  const feedback = buildFeedback(accuracy, coverage, fluency, pronunciation, repetitionRate, sentenceCoverage);

  return NextResponse.json({
    accuracy,
    fluency,
    pronunciation,
    coverage,
    repetitionRate,
    sentenceCoverage,
    strengths: feedback.strengths,
    issues: feedback.issues,
    actionPlan: feedback.actionPlan,
    summary: `Your ${body.title ?? 'article'} reading shows ${accuracy}% alignment with the source, ${coverage}% content coverage, and ${fluency}% fluency. The score is generated immediately from the current transcript and source text.`
  });
}
