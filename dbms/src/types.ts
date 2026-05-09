export interface Team {
  id: string;
  name: string;
  hq: string;
  principal: string;
}

export interface Driver {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
}

export interface Circuit {
  id: string;
  name: string;
  location: string;
  lengthKm: number;
}

export interface Race {
  id: string;
  circuitId: string;
  name: string;
  date: string;
  laps: number;
}

export interface Session {
  id: string;
  raceId: string;
  type: 'Practice' | 'Qualifying' | 'Race';
  startTime: string;
  weather: string;
}

export interface LapRecord {
  id: string;
  sessionId: string;
  driverId: string;
  lapNumber: number;
  lapTime: string; // MM:SS.ms
  sectorTime1: string;
  sectorTime2: string;
  sectorTime3: string;
  tireType: 'Soft' | 'Medium' | 'Hard' | 'Intermediate' | 'Wet';
}

export interface Result {
  raceId: string;
  driverId: string;
  gridPosition: number;
  finishPosition: number;
  points: number;
  status: 'Finished' | 'DNF' | 'DNS' | 'DSQ';
}

export interface Prediction {
  id: string;
  raceId: string;
  driverId: string;
  predictedPosition: number;
  userId: string;
  predictiontimestamp: string;  // Changed from 'timestamp'
}

export interface Standing {
  id: string;
  raceId: string;
  teamId: string;
  cumulativePoints: number;
  rank: number;
}
