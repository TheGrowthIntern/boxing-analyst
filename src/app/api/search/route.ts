import { NextRequest, NextResponse } from 'next/server';
import { searchFightersWithCompound } from '@/lib/compound';

/**
 * Search for fighters using Compound Beta
 * AI-powered boxer search and matching
 * 
 * @param request - Next.js request with query parameter 'q' (search term)
 * @returns Array of matching fighters
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  try {
    const fighters = await searchFightersWithCompound(query);
    return NextResponse.json({ fighters });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

