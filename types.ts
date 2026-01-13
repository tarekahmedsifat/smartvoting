
export interface Nominee {
  id: string;
  name: string;
  iconBase64: string;
}

export interface BallotConfig {
  allowedSelections: number;
  nominees: Nominee[];
}

export interface AnalysisResult {
  pageNumber: number;
  selectedNomineeIds: string[];
  isValid: boolean;
  status: 'valid' | 'rejected';
  screenshot?: string;
  reason?: string;
}

export interface GlobalResults {
  totalBallots: number;
  validBallots: number;
  rejectedBallots: number;
  nomineeVotes: Record<string, number>;
  pageResults: AnalysisResult[];
}
