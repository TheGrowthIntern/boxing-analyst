/**
 * Compound Beta Integration - Groq-Powered Boxing Intelligence
 * 
 * This module handles ALL data operations using Groq's Compound Beta.
 * 
 * Architecture:
 * ─────────────────────────────────────────────────────────────────
 * 1. Fighter Search: AI-powered search and suggestions
 * 2. Fighter Profiles: Complete profiles with stats, records, and biography
 * 3. Fight History: Recent fight records and results
 * 4. AI Analysis: Tactical insights, strengths, weaknesses, and matchup analysis
 * 5. Q&A: Contextual questions about fighters and general boxing knowledge
 * 
 * Benefits:
 * ─────────────────────────────────────────────────────────────────
 * - Single, intelligent source for all boxing data
 * - Real-time, up-to-date information from Groq's knowledge base
 * - Contextual understanding across queries
 * - Intelligent data synthesis and natural language responses
 */

import { Fighter, Fight, Analysis } from './types';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'groq/compound';
const GROQ_FAST_MODEL = 'groq/compound-mini'; // Fast model for search

/**
 * Search for fighters by name using fast Groq model
 * Uses llama-3.3-70b-versatile for quick responses
 * Returns a list of fighters with basic info
 */
export async function searchFightersWithCompound(searchQuery: string): Promise<Fighter[]> {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set');
    return [];
  }

  const prompt = `List of professional and legendary boxers matching (men and women) "${searchQuery}". Return JSON: {"fighters":[{"id":"slug","name":"Full Name","nationality":"Country","record":"W-L-D","division":{"name":"Weight Class"},"alias":"Nickname","stance":"Orthodox/Southpaw"}]}. Max 5 results, real boxers only, lowercase-hyphenated ids.`;

  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_FAST_MODEL, // Use fast model for search
        messages: [
          { role: 'system', content: 'You are a boxing expert. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      console.error('Groq Search Error:', res.status, err);
      return [];
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content;
    if (!content) return [];

    try {
      // Parse response - handle both array and object with fighters array
      const parsed = JSON.parse(content);
      const fighters = Array.isArray(parsed) ? parsed : (parsed.fighters || parsed.results || []);
      
      return fighters.map((f: any) => ({
        id: f.id || f.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
        name: f.name || 'Unknown',
        nationality: f.nationality || '',
        record: f.record || '',
        division: f.division || { name: '' },
        alias: f.alias || '',
        stance: f.stance || '',
      }));
    } catch (e) {
      console.error('Failed to parse search results:', e);
      return [];
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Search timeout - request took too long');
    } else {
      console.error('Error searching:', error);
    }
    return [];
  }
}

/**
 * Get complete fighter profile with stats and recent fights
 * Uses fast model for quick data retrieval
 */
export async function getFighterProfileWithCompound(fighterName: string, fighterId?: string): Promise<{
  fighter: Fighter;
  fights: Fight[];
  insights: Analysis | null;
}> {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set');
    return {
      fighter: { id: fighterId || 'unknown', name: fighterName },
      fights: [],
      insights: null,
    };
  }

  const prompt = `Boxing profile for ${fighterName}. JSON: {fighter:{id,name,nationality,birthplace,age,record,wins,losses,draws,knockouts,ko_percentage,height,reach,stance,division:{name},alias,debut,status,titles[]},recentFights:[{id,date,opponent,result,method,round,location,title_fight}],analysis:{style,strengths[],weaknesses[],recentForm,matchups,summary}}. 6-8 fights max. Factual data.`;

  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_FAST_MODEL, // Use fast model for profile generation too
        messages: [
          { role: 'system', content: 'Boxing database expert. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      console.error('Groq Profile Error:', res.status, err);
      return {
        fighter: { id: fighterId || 'unknown', name: fighterName },
        fights: [],
        insights: null,
      };
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      return {
        fighter: { id: fighterId || 'unknown', name: fighterName },
        fights: [],
        insights: null,
      };
    }

    try {
      const parsed = JSON.parse(content);
      
      // Extract fighter data
      const fighterData = parsed.fighter || {};
      const fighter: Fighter = {
        id: fighterData.id || fighterId || fighterName.toLowerCase().replace(/\s+/g, '-'),
        name: fighterData.name || fighterName,
        nationality: fighterData.nationality || '',
        birthplace: fighterData.birthplace || '',
        birthdate: fighterData.birthdate || '',
        age: fighterData.age,
        record: fighterData.record || '',
        wins: fighterData.wins,
        losses: fighterData.losses,
        draws: fighterData.draws,
        knockouts: fighterData.knockouts,
        ko_percentage: fighterData.ko_percentage,
        height: fighterData.height || '',
        reach: fighterData.reach || '',
        stance: fighterData.stance || '',
        division: fighterData.division || { name: '' },
        alias: fighterData.alias || '',
        debut: fighterData.debut || '',
        status: fighterData.status || '',
        titles: fighterData.titles || [],
      };

      // Extract fights
      const fightsData = parsed.recentFights || parsed.fights || [];
      const fights: Fight[] = fightsData.map((f: any, idx: number) => ({
        id: f.id || `fight-${idx}`,
        date: f.date || '',
        opponent: f.opponent || 'Unknown',
        result: f.result || 'unknown',
        method: f.method || '',
        round: f.round,
        location: f.location || '',
        title_fight: f.title_fight || false,
        notes: f.notes || '',
      }));

      // Extract analysis
      const analysisData = parsed.analysis || {};
      const insights: Analysis = {
        style: analysisData.style || '',
        strengths: analysisData.strengths || [],
        weaknesses: analysisData.weaknesses || [],
        recentForm: analysisData.recentForm || '',
        matchups: analysisData.matchups || '',
        summary: analysisData.summary || '',
      };

      return { fighter, fights, insights };
    } catch (e) {
      console.error('Failed to parse fighter profile:', e);
      return {
        fighter: { id: fighterId || 'unknown', name: fighterName },
        fights: [],
        insights: null,
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Profile fetch timeout - request took too long');
    } else {
      console.error('Error getting profile:', error);
    }
    return {
      fighter: { id: fighterId || 'unknown', name: fighterName },
      fights: [],
      insights: null,
    };
  }
}

export async function analyzeFighter(fighter: Fighter, recentFights: Fight[]): Promise<Analysis | null> {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set');
    return null;
  }

  const fightsText = recentFights
    .slice(0, 5)
    .map(
      (f) =>
        `${f.date}: ${f.result} vs ${typeof f.opponent === 'string' ? f.opponent : f.opponent?.name} (${f.method})`,
    )
    .join('\n');

  const prompt = `
    Analyze the professional boxer ${fighter.name}.
    
    Stats:
    Record: ${fighter.record || 'N/A'}
    Height: ${fighter.height || 'N/A'}
    Reach: ${fighter.reach || 'N/A'}
    Stance: ${fighter.stance || 'N/A'}
    
    Recent Fights:
    ${fightsText || 'No recent fight data available.'}
    
    Provide a detailed analysis in JSON format with the following exact structure:
    {
      "style": "Brief description of fighting style (1-2 sentences)",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
      "recentForm": "Assessment of recent performance (2-3 sentences)",
      "matchups": "Suggested matchups or strategy notes (2-3 sentences)",
      "summary": "A concise overall summary (2-3 sentences)"
    }
    
    CRITICAL REQUIREMENTS:
    - "strengths" must be an array of 3-5 short strings (each 5-10 words max)
    - "weaknesses" must be an array of 3-5 short strings (each 5-10 words max)
    - Do NOT use prose paragraphs for strengths/weaknesses
    - Ensure the tone is professional, analytical, and factual like a boxing commentator
    - Return ONLY valid JSON with no additional text
  `;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert boxing analyst providing insights for a web application. Output JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Groq API Error:', res.status, err);
      return null;
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) return null;

    // Helper function to extract JSON from potentially wrapped content
    const extractJSON = (text: string): string => {
      // Remove markdown code blocks
      let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // Try to find JSON object boundaries
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      return cleaned;
    };

    try {
      const cleanedContent = extractJSON(content);
      const analysis = JSON.parse(cleanedContent);
      console.log('Parsed AI Analysis:', analysis);
      
      // Safely extract and validate each field
      const extractArray = (value: any, fallback: string[]): string[] => {
        if (Array.isArray(value)) {
          return value.filter(item => typeof item === 'string' && item.trim().length > 0);
        }
        if (typeof value === 'string' && value.trim().length > 0) {
          // Try to parse as JSON array string
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              return parsed.filter(item => typeof item === 'string' && item.trim().length > 0);
            }
          } catch {
            // If not JSON, split by common delimiters
            return value.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
          }
        }
        return fallback;
      };

      const extractString = (value: any, fallback: string): string => {
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }
        return fallback;
      };

      const strengths = extractArray(analysis.strengths, []);
      const weaknesses = extractArray(analysis.weaknesses, []);
      
      return {
        style: extractString(analysis.style, 'Style analysis not available'),
        strengths: strengths.length > 0 ? strengths : ['Not available'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['Not available'],
        recentForm: extractString(analysis.recentForm, 'Recent form analysis not available'),
        matchups: extractString(analysis.matchups, 'Matchup analysis not available'),
        summary: extractString(analysis.summary, content.substring(0, 200)),
      };
    } catch (e) {
      console.error('Failed to parse Groq response:', e);
      console.error('Raw content:', content);
      
      // Try to extract readable information even if JSON parsing fails
      const readableSummary = content.length > 500 ? content.substring(0, 500) + '...' : content;
      
      return {
        summary: readableSummary,
        style: 'Style analysis unavailable',
        strengths: ['Analysis data unavailable'],
        weaknesses: ['Analysis data unavailable'],
        recentForm: readableSummary,
        matchups: 'Matchup analysis unavailable',
      };
    }
  } catch (error) {
    console.error('Error calling Groq:', error);
    return null;
  }
}

function buildFightsText(fights: Fight[]) {
  return fights
    .slice(0, 5)
    .map(
      (f) =>
        `${f.date}: ${f.result} vs ${typeof f.opponent === 'string' ? f.opponent : f.opponent?.name} (${f.method})`,
    )
    .join('\n');
}

function buildBaseStats(fighter: Fighter) {
  return `
    Stats:
    Record: ${fighter.record || 'N/A'}
    Height: ${fighter.height || 'N/A'}
    Reach: ${fighter.reach || 'N/A'}
    Stance: ${fighter.stance || 'N/A'}
  `;
}

export type SourceCitation = {
  label: string;
  url: string;
};

export type CompoundAnswer = {
  answer: string;
  sources?: SourceCitation[];
};

export async function askGeneralQuestion(question: string): Promise<CompoundAnswer | null> {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set');
    return null;
  }

  const prompt = `
    You are an expert boxing analyst with strong general sports knowledge.
    Answer the question concisely and factually. If the question is about Groq, explain clearly what it is.

    Question: ${question}

    Response guidelines:
    - Answer directly and succinctly.
    - If relevant, include notable upcoming fights or recent news.
    - If citing sources, provide short labels and URLs.
    - Return ONLY valid JSON with the following structure:
    {
      "answer": "direct, concise answer",
      "sources": [
        { "label": "Source Name", "url": "https://..." }
      ]
    }
  `;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a concise, factual boxing and sports analyst.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Groq API Error (general):', res.status, err);
      return null;
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content;
    if (!content) return null;

    try {
      const parsed: CompoundAnswer = JSON.parse(content);
      return {
        answer: parsed.answer?.trim() || content.trim(),
        sources: parsed.sources?.map((source) => ({
          label: source.label,
          url: source.url,
        })),
      };
    } catch (error) {
      console.error('Unable to parse general answer JSON:', error);
      return {
        answer: (typeof content === 'string' ? content : JSON.stringify(content)).trim(),
        sources: [],
      };
    }
  } catch (error) {
    console.error('Error calling Groq for general question:', error);
    return null;
  }
}

export async function askCompoundQuestion(
  fighter: Fighter,
  recentFights: Fight[],
  question: string,
): Promise<CompoundAnswer | null> {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set');
    return null;
  }

  const prompt = `
    You are an expert boxing analyst.
    Use the fighter context and recent fights below to answer the question succinctly and professionally.

    Fighter: ${fighter.name}
    ${buildBaseStats(fighter)}
    
    Recent Fights:
    ${buildFightsText(recentFights) || 'No recent fight data available.'}

    Question: ${question}
    The system should analyze the provided fighter statistics and generate a direct, data-driven answer to the user’s question.

    Response guidelines:
    - Always answer the question explicitly and directly.
    - Use the fighter’s stats (height, reach, stance, record, style, etc.) to support reasoning.
    - Include relevant context or interpretation about fighting styles, strengths, weaknesses, and matchup tendencies.
    - Keep the tone analytical and grounded in data, not speculative or opinionated.
    - You may reference comparative insights (e.g., ideal opponents, problem matchups) if it helps answer the question, but do not force a specific format or section structure.
    - Return ONLY valid JSON with the following structure:

    {
      "answer": "natural language answer grounded in the data",
      "sources": [
        { "label": "Source Name", "url": "https://..." }
      ]
    }

  `;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a boxing analyst. Stay on topic and answer using the provided context.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.65,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Groq API Error (question):', res.status, err);
      return null;
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content;

    if (!content) return null;

    try {
      const parsed: CompoundAnswer = JSON.parse(content);
      return {
        answer: parsed.answer?.trim() || content.trim(),
        sources: parsed.sources?.map((source) => ({
          label: source.label,
          url: source.url,
        })),
      };
    } catch (error) {
      console.error('Unable to parse compound answer JSON:', error);
      return {
        answer: (typeof content === 'string' ? content : JSON.stringify(content)).trim(),
        sources: [],
      };
    }
  } catch (error) {
    console.error('Error calling Groq for question:', error);
    return null;
  }
}

