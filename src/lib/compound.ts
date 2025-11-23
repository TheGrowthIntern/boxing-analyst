import { Fighter, Fight, Analysis } from './types';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'groq/compound';

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

