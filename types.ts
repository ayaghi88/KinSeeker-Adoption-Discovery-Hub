
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  text: string;
  sources: GroundingSource[];
}

export interface QuestionResult extends SearchResult {
  percentage: number;
  confidence: string;
}

export interface PaternityResult extends SearchResult {
  paternityProbability: number;
  explanation: string;
}

export interface ResourceLink {
  name: string;
  url: string;
  category: 'Archives' | 'DNA' | 'Legal' | 'Support' | 'Medical';
  description: string;
}

export interface SignOfAdoption {
  title: string;
  description: string;
  type: 'Medical' | 'Documentation' | 'Social' | 'Physical';
}

export interface SearchFilters {
  dateRange?: string;
  location?: string;
  recordType: ('archived' | 'commercial' | 'orphan' | 'all')[];
}

export interface GeneticInsight {
  snp: string;
  finding: string;
  significance: string;
  sources: GroundingSource[];
}
