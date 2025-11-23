import { NextRequest, NextResponse } from 'next/server';
import { getFighterById, getRecentFightsByFighter } from '@/lib/boxingData';
import { askCompoundQuestion } from '@/lib/compound';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fighterId, question } = body;

    if (!fighterId) {
      return NextResponse.json({ error: 'Missing fighterId' }, { status: 400 });
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Missing question text' }, { status: 400 });
    }

    const fighter = await getFighterById(fighterId);
    if (!fighter) {
      return NextResponse.json({ error: 'Fighter not found' }, { status: 404 });
    }

    const fights = await getRecentFightsByFighter(fighterId);
    const reply = await askCompoundQuestion(fighter, fights, question.trim());

    if (!reply) {
      return NextResponse.json({ error: 'Compound Beta did not return a response' }, { status: 502 });
    }

    return NextResponse.json({
      answer: reply.answer,
      sources: reply.sources ?? [],
    });
  } catch (error) {
    console.error('Compound question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

