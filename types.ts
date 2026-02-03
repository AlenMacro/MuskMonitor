export interface NewsSource {
  title: string;
  uri: string;
}

export interface TweetData {
  text: string;
  url: string; // URL to the specific tweet or profile
  date: string; // approximate string like "2h ago" or date
}

export interface AgentReport {
  generatedAt: string;
  germanSubject: string;
  germanBody: string;
  keyFacts: string[];
  tweet?: TweetData;
  sources: NewsSource[];
}

export interface StreamUpdate {
  stage: 'DISCOVERY' | 'WRITING' | 'COMPLETE';
  partialReport?: Partial<AgentReport>;
}

export enum AgentStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  SUMMARIZING = 'SUMMARIZING',
  TRANSLATING = 'TRANSLATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface UserConfig {
  email: string;
  frequencyDays: number;
}