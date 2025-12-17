/**
 * Constants used throughout the application
 */

/**
 * List of famous boxers used for the "Surprise me" feature.
 * Includes legends, current champions, and popular fighters.
 */
export const FAMOUS_BOXERS = [
  // Legends
  'Muhammad Ali',
  'Mike Tyson',
  'Sugar Ray Leonard',
  'George Foreman',
  'Joe Frazier',
  'Larry Holmes',
  'Marvin Hagler',
  'Thomas Hearns',
  'Roberto Duran',
  'Julio Cesar Chavez',
  'Lennox Lewis',
  'Evander Holyfield',
  
  // Modern Era
  'Floyd Mayweather',
  'Manny Pacquiao',
  'Oscar De La Hoya',
  'Roy Jones Jr',
  'Bernard Hopkins',
  'Shane Mosley',
  
  // Current Stars
  'Canelo Alvarez',
  'Anthony Joshua',
  'Tyson Fury',
  'Deontay Wilder',
  'Gennady Golovkin',
  'Terence Crawford',
  'Errol Spence Jr',
  'Naoya Inoue',
  'Oleksandr Usyk',
  'Vasyl Lomachenko',
  'Ryan Garcia',
  'Shakur Stevenson',
  'Tank Davis',
  'Jake Paul',
] as const;

/**
 * Initial welcome message shown when chat starts
 */
export const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: 'Search for any boxer to explore their stats, fight history, and AI-powered analysis.',
};

/**
 * Regex pattern to detect general questions (vs fighter search)
 */
export const GENERAL_QUESTION_PATTERN = /^(what|when|who|why|how|where|which|tell me|list|show|give|upcoming|next|schedule|groq|fight|fights)/i;

