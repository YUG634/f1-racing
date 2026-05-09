import { Team, Driver, Circuit, Race, Session } from './types.ts';

export const INITIAL_TEAMS: Team[] = [
  { id: 't1', name: 'Red Bull Racing', hq: 'Milton Keynes, UK', principal: 'Christian Horner' },
  { id: 't2', name: 'Mercedes-AMG Petronas', hq: 'Brackley, UK', principal: 'Toto Wolff' },
  { id: 't3', name: 'Scuderia Ferrari', hq: 'Maranello, Italy', principal: 'Frédéric Vasseur' },
  { id: 't4', name: 'McLaren Formula 1 Team', hq: 'Woking, UK', principal: 'Andrea Stella' },
  { id: 't5', name: 'Aston Martin Aramco', hq: 'Silverstone, UK', principal: 'Mike Krack' },
];

export const INITIAL_DRIVERS: Driver[] = [
  { id: 'd1', teamId: 't1', firstName: 'Max', lastName: 'Verstappen', nationality: 'Dutch', dob: '1997-09-30' },
  { id: 'd2', teamId: 't1', firstName: 'Sergio', lastName: 'Perez', nationality: 'Mexican', dob: '1990-01-26' },
  { id: 'd3', teamId: 't2', firstName: 'Lewis', lastName: 'Hamilton', nationality: 'British', dob: '1985-01-07' },
  { id: 'd4', teamId: 't2', firstName: 'George', lastName: 'Russell', nationality: 'British', dob: '1998-02-15' },
  { id: 'd5', teamId: 't3', firstName: 'Charles', lastName: 'Leclerc', nationality: 'Monegasque', dob: '1997-10-16' },
  { id: 'd6', teamId: 't3', firstName: 'Carlos', lastName: 'Sainz', nationality: 'Spanish', dob: '1994-09-01' },
];

export const INITIAL_CIRCUITS: Circuit[] = [
  { id: 'c1', name: 'Bahrain International Circuit', location: 'Sakhir, Bahrain', lengthKm: 5.412 },
  { id: 'c2', name: 'Circuit de Monaco', location: 'Monte Carlo, Monaco', lengthKm: 3.337 },
  { id: 'c3', name: 'Silverstone Circuit', location: 'Silverstone, UK', lengthKm: 5.891 },
  { id: 'c4', name: 'Suzuka International Racing Course', location: 'Suzuka, Japan', lengthKm: 5.807 },
];

export const INITIAL_RACES: Race[] = [
  { id: 'r1', circuitId: 'c1', name: 'Bahrain Grand Prix', date: '2024-03-02', laps: 57 },
  { id: 'r2', circuitId: 'c2', name: 'Monaco Grand Prix', date: '2024-05-26', laps: 78 },
];

export const INITIAL_SESSIONS: Session[] = [
  { id: 's1', raceId: 'r1', type: 'Race', startTime: '2024-03-02T18:00:00Z', weather: 'Dry' },
  { id: 's2', raceId: 'r2', type: 'Race', startTime: '2024-05-26T15:00:00Z', weather: 'Dry' },
];
