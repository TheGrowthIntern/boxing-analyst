import { Fighter, Fight } from './types';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'boxing-data-api.p.rapidapi.com';

// Debug log to verify key presence (don't log the full key)
console.log('RAPIDAPI_KEY status:', RAPIDAPI_KEY ? `Present (starts with ${RAPIDAPI_KEY.substring(0, 4)}...)` : 'Missing');

const HEADERS = {
  'X-RapidAPI-Key': RAPIDAPI_KEY || '',
  'X-RapidAPI-Host': RAPIDAPI_HOST,
};

const BASE_URL = 'https://boxing-data-api.p.rapidapi.com/v1';

export async function searchFighters(name: string): Promise<Fighter[]> {
  if (!name) return [];
  
  try {
    const url = `${BASE_URL}/fighters/?name=${encodeURIComponent(name)}`;
    console.log(`Searching fighters: ${url}`);
    
    const res = await fetch(url, { 
      headers: HEADERS,
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Boxing API Error (Search):', res.status, res.statusText, errorText);
      return [];
    }
    
    const data = await res.json();
    console.log('Raw Search Response:', JSON.stringify(data, null, 2));
    
    // Handle various potential response structures
    if (Array.isArray(data)) return data;
    if (data.fighters && Array.isArray(data.fighters)) return data.fighters;
    if (data.data && Array.isArray(data.data)) return data.data;
    
    // If data matches the single fighter shape directly (rare for search but possible)
    if (data.id && data.name) return [data];

    return [];
  } catch (error) {
    console.error('Error searching fighters:', error);
    return [];
  }
}

export async function getFighterById(id: string | number): Promise<Fighter | null> {
  try {
    const url = `${BASE_URL}/fighters/${id}/`;
    console.log(`Fetching fighter: ${url}`);
    const res = await fetch(url, { 
      headers: HEADERS,
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      console.error('Boxing API Error (Get Fighter):', res.status, res.statusText);
      return null;
    }
    
    const data = await res.json();
    console.log('Raw Fighter Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching fighter:', error);
    return null;
  }
}

export async function getRecentFightsByFighter(fighterId: string | number): Promise<Fight[]> {
  try {
    // UPDATED: According to API logic, usually fetching fights is separate.
    // However, the docs don't explicitly show a "/fighters/{id}/fights/" endpoint in the snippets you shared.
    // The docs show "Fights" as a top-level section.
    // It's likely "/fights?fighter_id={id}" OR "/fighters/{id}" might include fights in the details?
    // Let's try the standard REST pattern for this API: /fights/ with query param if it exists,
    // OR check if the main fighter object ALREADY contains the fights (some APIs do this).
    
    // Strategy 1: Check if fights are in the fighter details (we can't check here easily without refactoring, but let's try a different endpoint).
    // Strategy 2: Try /fights/?fighter_id=... (common pattern)
    
    const url = `${BASE_URL}/fights/?fighter_id=${fighterId}`; 
    console.log(`Fetching fights (new strategy): ${url}`);
    
    const res = await fetch(url, { 
      headers: HEADERS,
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Boxing API Error (Get Fights):', res.status, res.statusText, errorText);
      return [];
    }
    
    const data = await res.json();
    console.log('Raw Fights Response:', JSON.stringify(data, null, 2));
    
    const fights = Array.isArray(data) ? data : (data.fights || data.data || []);
    
    return fights.sort((a: Fight, b: Fight) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error('Error fetching fights:', error);
    return [];
  }
}
