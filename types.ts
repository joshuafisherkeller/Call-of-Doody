export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RestroomPlace {
  title: string;
  uri: string;
  source: 'maps' | 'web';
  rating?: number; // Inferred or mock if not available directly from chunks usually
  address?: string; // Sometimes available in chunks, otherwise inferred
}

export interface SearchResult {
  textSummary: string;
  places: RestroomPlace[];
}

export enum AppState {
  IDLE = 'IDLE',
  REQUESTING_LOCATION = 'REQUESTING_LOCATION',
  FETCHING_DATA = 'FETCHING_DATA',
  DISPLAY_RESULTS = 'DISPLAY_RESULTS',
  ERROR = 'ERROR',
}

// Internal types for Gemini Grounding
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[];
    }[];
  };
}