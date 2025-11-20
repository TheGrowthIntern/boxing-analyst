import { NextRequest, NextResponse } from 'next/server';
import { getFighterById, getRecentFightsByFighter } from '@/lib/boxingData';
import { analyzeFighter } from '@/lib/compound';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fighterId } = body;

    if (!fighterId) {
      return NextResponse.json({ error: 'Missing fighterId' }, { status: 400 });
    }

    // Fetch data in parallel
    const fighter = await getFighterById(fighterId);
    
    if (!fighter) {
      return NextResponse.json({ error: 'Fighter not found' }, { status: 404 });
    }

    const fights = await getRecentFightsByFighter(fighterId);

    // Generate insights
    const insights = await analyzeFighter(fighter, fights);

    return NextResponse.json({
      fighter,
      fights,
      insights
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

