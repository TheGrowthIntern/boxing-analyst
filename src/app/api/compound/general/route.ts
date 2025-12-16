import { NextRequest, NextResponse } from 'next/server';
import { askGeneralQuestion } from '@/lib/compound';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Missing question text' }, { status: 400 });
    }

    const reply = await askGeneralQuestion(question.trim());
    if (!reply) {
      return NextResponse.json({ error: 'Compound Beta did not return a response' }, { status: 502 });
    }

    return NextResponse.json({
      answer: reply.answer,
      sources: reply.sources ?? [],
    });
  } catch (error) {
    console.error('Compound general question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


