import { NextRequest, NextResponse } from 'next/server';
import { searchFighters } from '@/lib/boxingData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  try {
    const fighters = await searchFighters(query);
    return NextResponse.json({ fighters });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

