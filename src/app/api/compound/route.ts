import { NextRequest, NextResponse } from 'next/server';
import { askCompoundQuestion, getFighterProfileWithCompound } from '@/lib/compound';
import { Fighter, Fight } from '@/lib/types';

/**
 * Ask a question about a fighter using Compound Beta
 * Accepts fighter context or fetches it dynamically
 * 
 * @param request - Next.js request with body containing question and optional fighter data
 * @returns Answer with optional sources
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fighterId, fighterName, question, fighter: providedFighter, fights: providedFights } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Missing question text' }, { status: 400 });
    }

    let fighter: Fighter;
    let fights: Fight[];

    // Use provided data if available, otherwise generate fighter profile
    if (providedFighter) {
      fighter = providedFighter;
      fights = providedFights || [];
    } else {
      // Generate fighter profile with AI
      const name = fighterName || fighterId;
      if (!name) {
        return NextResponse.json({ error: 'Missing fighter identifier' }, { status: 400 });
      }
      
      const profile = await getFighterProfileWithCompound(name, fighterId);
      fighter = profile.fighter;
      fights = profile.fights;
    }

    const reply = await askCompoundQuestion(fighter, fights, question.trim());

    if (!reply) {
      return NextResponse.json({ error: 'Failed to generate answer' }, { status: 502 });
    }

    return NextResponse.json({
      answer: reply.answer,
      sources: reply.sources ?? [],
    });
  } catch (error) {
    console.error('Question processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


