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
    .map(f => `${f.date}: ${f.result} vs ${typeof f.opponent === 'string' ? f.opponent : f.opponent?.name} (${f.method})`)
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
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert boxing analyst providing insights for a web application. Output JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" } // If supported by the model, otherwise just prompt.
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

    try {
      const analysis = JSON.parse(content);
      console.log('Parsed AI Analysis:', analysis);
      
      // Ensure strengths and weaknesses are arrays
      const strengths = Array.isArray(analysis.strengths) 
        ? analysis.strengths 
        : (typeof analysis.strengths === 'string' 
          ? [analysis.strengths] 
          : ['Not available']);
      
      const weaknesses = Array.isArray(analysis.weaknesses)
        ? analysis.weaknesses
        : (typeof analysis.weaknesses === 'string'
          ? [analysis.weaknesses]
          : ['Not available']);
      
      return {
        style: analysis.style || 'Style analysis not available',
        strengths,
        weaknesses,
        recentForm: analysis.recentForm || 'Recent form analysis not available',
        matchups: analysis.matchups || 'Matchup analysis not available',
        summary: analysis.summary || content,
      };
    } catch (e) {
      console.error('Failed to parse Groq response:', e);
      console.error('Raw content:', content);
      
      // Try to extract structured data even from unstructured text
      return {
        summary: content,
        style: 'Unable to parse style',
        strengths: ['Analysis parsing failed'],
        weaknesses: ['Analysis parsing failed'],
        recentForm: content,
        matchups: 'Unable to parse matchups'
      };
    }

  } catch (error) {
    console.error('Error calling Groq:', error);
    return null;
  }
}

