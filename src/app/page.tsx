'use client';

import { useState } from 'react';
import { Search, User, Activity, Brain, ChevronDown, ChevronUp, Trophy, Ban } from 'lucide-react';
import { Fighter, Fight, Analysis } from '@/lib/types';
import clsx from 'clsx';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Fighter[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState<Fighter | null>(null);
  const [recentFights, setRecentFights] = useState<Fight[]>([]);
  const [insights, setInsights] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError('');
    setResults([]);
    setSelectedFighter(null);
    setInsights(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.fighters || []);
      if (data.fighters?.length === 0) setError('No fighters found.');
    } catch (err) {
      setError('Failed to search fighters.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFighter = async (fighter: Fighter) => {
    setSelectedFighter(fighter);
    setResults([]); // Clear list to focus on profile
    setIsAnalyzing(true);
    setError('');
    setRecentFights([]);
    setInsights(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fighterId: fighter.id }),
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      // Update with full details if available
      if (data.fighter) setSelectedFighter(data.fighter);
      setRecentFights(data.fights || []);
      setInsights(data.insights || null);
    } catch (err) {
      setError('Failed to analyze fighter.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3ee] dark:bg-[#000000] text-[#000000] dark:text-[#ffffff] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#f43e01] dark:text-[#f43e01]">
           Groq-Powered Boxing Analyst
          </h1>
          <p className="text-lg text-[#69695d] dark:text-[#cececbf] max-w-xl mx-auto">
            Type a boxer's name, get stats and recent fights, and read instant AI analysis powered by Groq Compound.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a fighter (e.g. Canelo Alvarez)..."
            className="w-full px-6 py-4 rounded-full border-2 border-[#cececbf] dark:border-[#69695d] bg-white dark:bg-[#2d2f33] text-lg focus:outline-none focus:border-[#f43e01] dark:focus:border-[#f43e01] shadow-lg transition-all"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-3 top-3 p-2 bg-[#f43e01] text-white rounded-full hover:bg-[#c23101] disabled:opacity-50 transition-colors"
          >
            <Search className="w-6 h-6" />
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-[#ffd1a3] dark:bg-[#c23101]/30 text-[#c23101] dark:text-[#ffd1a3] rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((fighter) => (
              <button
                key={fighter.id}
                onClick={() => handleSelectFighter(fighter)}
                className="flex items-center justify-between p-4 bg-white dark:bg-[#2d2f33] rounded-xl shadow-sm hover:shadow-md hover:border-[#f43e01] border-2 border-transparent transition-all text-left group"
              >
                <div>
                  <h3 className="font-bold text-xl">{fighter.name}</h3>
                  <p className="text-sm text-[#69695d] dark:text-[#cececbf]">
                    {fighter.nationality} {fighter.division?.name ? `• ${fighter.division.name}` : ''}
                  </p>
                </div>
                <span className="text-[#f43e01] opacity-0 group-hover:opacity-100 font-medium transition-opacity">
                  Analyze →
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="text-center py-12 space-y-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-[#f43e01] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg font-medium text-[#69695d] dark:text-[#cececbf]">
              Analyzing fight data & generating insights...
            </p>
          </div>
        )}

        {/* Fighter Profile */}
        {selectedFighter && !isAnalyzing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-[#2d2f33] rounded-2xl p-6 shadow-xl border border-[#cececbf] dark:border-[#69695d]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold">{selectedFighter.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFighter.nationality && (
                      <span className="px-3 py-1 bg-[#ffd1a3] dark:bg-[#69695d] rounded-full text-sm font-medium">
                        {selectedFighter.nationality}
                      </span>
                    )}
                    {selectedFighter.division?.name && (
                      <span className="px-3 py-1 bg-[#ffd1a3] dark:bg-[#69695d] rounded-full text-sm font-medium">
                        {selectedFighter.division.name}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-[#f43e01] text-white rounded-full text-sm font-medium">
                      {selectedFighter.record || 'Record N/A'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center w-full md:w-auto">
                  <div>
                    <div className="text-xs uppercase text-[#69695d] font-semibold">Height</div>
                    <div className="font-mono text-lg">{selectedFighter.height || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-[#69695d] font-semibold">Reach</div>
                    <div className="font-mono text-lg">{selectedFighter.reach || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-[#69695d] font-semibold">Stance</div>
                    <div className="font-mono text-lg">{selectedFighter.stance || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Fights Column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-2 text-xl font-bold text-[#000000] dark:text-[#ffffff]">
                   Recent Fights
                </div>
                {recentFights.length > 0 ? (
                  <div className="space-y-3">
                    {recentFights.slice(0, 5).map((fight, i) => (
                      <div key={i} className="bg-white dark:bg-[#2d2f33] p-4 rounded-xl border border-[#cececbf] dark:border-[#69695d] shadow-sm flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-sm">
                            vs {typeof fight.opponent === 'string' ? fight.opponent : fight.opponent?.name}
                          </div>
                          <div className="text-xs text-[#69695d]">{fight.date} • {fight.method}</div>
                        </div>
                        <div className={clsx(
                          "px-3 py-1 rounded-lg text-xs font-bold uppercase",
                          fight.result === 'win' ? "bg-[#fe9e20] text-white" :
                          fight.result === 'loss' ? "bg-[#c23101] text-white" :
                          "bg-[#cececbf] text-[#000000]"
                        )}>
                          {fight.result}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#69695d] italic">No recent fight data available.</p>
                )}
              </div>

              {/* AI Insights Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 text-xl font-bold text-[#000000] dark:text-[#ffffff]">
                   AI Analysis
                </div>
                
                {insights ? (
                  <div className="bg-white dark:bg-[#2d2f33] rounded-2xl shadow-lg overflow-hidden border border-[#cececbf] dark:border-[#69695d]">
                    
                    {/* Summary */}
                    <div className="p-6 border-b border-[#cececbf] dark:border-[#69695d] bg-[#ffd1a3]/30 dark:bg-[#f43e01]/10">
                      <h3 className="font-semibold text-[#f43e01] dark:text-[#fe9e20] mb-2">Analyst Summary</h3>
                      <p className="text-[#000000] dark:text-[#ffffff] leading-relaxed">
                        {insights.summary}
                      </p>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-[#fe9e20]">
                          <ChevronUp className="w-4 h-4" /> Strengths
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-[#69695d] dark:text-[#cececbf]">
                          {insights.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>Not available</li>}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-[#c23101]">
                          <ChevronDown className="w-4 h-4" /> Weaknesses
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-[#69695d] dark:text-[#cececbf]">
                          {insights.weaknesses?.map((w, i) => <li key={i}>{w}</li>) || <li>Not available</li>}
                        </ul>
                      </div>

                      {/* Style */}
                      <div className="space-y-2">
                        <div className="font-semibold text-[#000000] dark:text-[#ffffff]">Fighting Style</div>
                        <p className="text-sm text-[#69695d] dark:text-[#cececbf]">{insights.style || 'N/A'}</p>
                      </div>

                      {/* Matchups */}
                      <div className="space-y-2">
                        <div className="font-semibold text-[#000000] dark:text-[#ffffff]">Strategic Notes</div>
                        <p className="text-sm text-[#69695d] dark:text-[#cececbf]">{insights.matchups || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-[#cececbf] dark:border-[#69695d] rounded-2xl text-[#69695d]">
                    Unable to generate AI insights at this time.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
  );
}
