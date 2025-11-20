export interface Division {
  name?: string;
}

export interface Fighter {
  id: string | number;
  name: string;
  nationality?: string;
  record?: string;
  height?: string;
  weight?: string;
  reach?: string;
  stance?: string;
  division?: Division;
  birthdate?: string;
  birthplace?: string;
  age?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  knockouts?: number;
  imageUrl?: string; // Optional additions
}

export interface Fight {
  id: string | number;
  date: string;
  division?: Division;
  opponent: Fighter; // or string if simplistic
  result: 'win' | 'loss' | 'draw' | 'nc';
  method?: string;
  round?: number;
  time?: string;
  notes?: string;
  venue?: string;
}

export interface Analysis {
  style?: string;
  strengths?: string[];
  weaknesses?: string[];
  recentForm?: string;
  matchups?: string;
  summary: string;
}

