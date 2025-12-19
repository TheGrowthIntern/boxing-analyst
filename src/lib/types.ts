export interface Division {
  name?: string;
  id?: string | number;
}

export interface Fighter {
  id: string | number;
  name: string;
  nationality?: string;
  record?: string;
  height?: string | number;
  weight?: string | number;
  reach?: string | number;
  stance?: string;
  division?: Division;
  birthdate?: string;
  birthplace?: string;
  age?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  knockouts?: number;
  ko_percentage?: number;
  debut?: string;
  alias?: string;
  residence?: string;
  imageUrl?: string;
  // Additional fields that might come from API
  sex?: string;
  titles?: string[];
  ranking?: number;
  status?: string;
}

export interface Fight {
  id: string | number;
  date: string;
  division?: Division;
  opponent: Fighter | string;
  result: 'win' | 'loss' | 'draw' | 'nc' | string;
  method?: string;
  round?: number;
  scheduled_rounds?: number;
  time?: string;
  notes?: string;
  venue?: string;
  location?: string;
  title_fight?: boolean;
  weight_class?: string;
}

export interface Analysis {
  style?: string;
  strengths?: string[];
  weaknesses?: string[];
  recentForm?: string;
  matchups?: string;
  summary: string;
}

