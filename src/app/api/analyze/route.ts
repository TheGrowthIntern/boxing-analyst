import { NextRequest, NextResponse } from 'next/server';
import { getFighterProfileWithCompound } from '@/lib/compound';

/**
 * Get complete fighter profile using Compound Beta
 * Generates comprehensive stats, fight history, and AI analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fighterId, fighterName } = body;

    if (!fighterId && !fighterName) {
      return NextResponse.json({ error: 'Missing fighterId or fighterName' }, { status: 400 });
    }

    // Get complete profile from Compound Beta
    const name = fighterName || fighterId;
    const result = await getFighterProfileWithCompound(name, fighterId);

    return NextResponse.json({
      fighter: result.fighter,
      fights: result.fights,
      insights: result.insights
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

