import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  User, 
  MapPin, 
  Target, 
  LayoutDashboard
} from 'lucide-react';
import { Team, Driver, Circuit, Race, Session, Result, Prediction } from './types.ts';
import { cn } from './lib/utils.ts';
import Dashboard from './components/Dashboard.tsx';
import TeamsManagement from './components/TeamsManagement.tsx';
import DriversManagement from './components/DriversManagement.tsx';
import CircuitsManagement from './components/CircuitsManagement.tsx';
import RaceManagement from './components/RaceManagement.tsx';
import Predictions from './components/Predictions.tsx';

type View = 'dashboard' | 'teams' | 'drivers' | 'circuits' | 'races' | 'predictions';
// API base URL - using proxy or direct
const API_BASE_URL = 'http://localhost:5000/api';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for all entities
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  // Fetch all data from Neon database
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch teams
      const teamsRes = await fetch(`${API_BASE_URL}/teams`);
      if (!teamsRes.ok) throw new Error('Failed to fetch teams');
      const teamsData = await teamsRes.json();
      setTeams(teamsData);
      
      // Fetch drivers
      const driversRes = await fetch(`${API_BASE_URL}/drivers`);
      if (!driversRes.ok) throw new Error('Failed to fetch drivers');
      const driversData = await driversRes.json();
      setDrivers(driversData);
      
      // Fetch circuits
      const circuitsRes = await fetch(`${API_BASE_URL}/circuits`);
      if (!circuitsRes.ok) throw new Error('Failed to fetch circuits');
      const circuitsData = await circuitsRes.json();
      setCircuits(circuitsData);
      
      // Fetch races
      const racesRes = await fetch(`${API_BASE_URL}/races`);
      if (!racesRes.ok) throw new Error('Failed to fetch races');
      const racesData = await racesRes.json();
      setRaces(racesData);

      // Fetch predictions
      const predictionsRes = await fetch(`${API_BASE_URL}/predictions`);
      if (!predictionsRes.ok) throw new Error('Failed to fetch predictions');
      const predictionsData = await predictionsRes.json();
      setPredictions(predictionsData);
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Wrapper functions to sync changes with backend
  const handleSetTeams = async (newTeams: Team[] | ((prev: Team[]) => Team[])) => {
    const updatedTeams = typeof newTeams === 'function' ? newTeams(teams) : newTeams;
    
    // Check if a team was added
    if (updatedTeams.length > teams.length) {
      const added = updatedTeams.find((t: Team) => !teams.find((ot: Team) => ot.id === t.id));
      if (added) {
        try {
          await fetch(`${API_BASE_URL}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(added),
          });
          setTeams(updatedTeams);
        } catch (err) {
          console.error('Error adding team:', err);
          setError('Failed to add team');
        }
      }
    } 
    // Check if a team was deleted
    else if (updatedTeams.length < teams.length) {
      const deleted = teams.find((t: Team) => !updatedTeams.find((ut: Team) => ut.id === t.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/teams/${deleted.id}`, {
            method: 'DELETE',
          });
          setTeams(updatedTeams);
        } catch (err) {
          console.error('Error deleting team:', err);
          setError('Failed to delete team');
        }
      }
    } else {
      setTeams(updatedTeams);
    }
  };

  const handleSetDrivers = async (newDrivers: Driver[] | ((prev: Driver[]) => Driver[])) => {
    const updatedDrivers = typeof newDrivers === 'function' ? newDrivers(drivers) : newDrivers;
    
    if (updatedDrivers.length > drivers.length) {
      const added = updatedDrivers.find((d: Driver) => !drivers.find((od: Driver) => od.id === d.id));
      if (added) {
        try {
          await fetch(`${API_BASE_URL}/drivers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(added),
          });
          setDrivers(updatedDrivers);
        } catch (err) {
          console.error('Error adding driver:', err);
          setError('Failed to add driver');
        }
      }
    } else if (updatedDrivers.length < drivers.length) {
      const deleted = drivers.find((d: Driver) => !updatedDrivers.find((ud: Driver) => ud.id === d.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/drivers/${deleted.id}`, {
            method: 'DELETE',
          });
          setDrivers(updatedDrivers);
        } catch (err) {
          console.error('Error deleting driver:', err);
          setError('Failed to delete driver');
        }
      }
    } else {
      setDrivers(updatedDrivers);
    }
  };

  const handleSetCircuits = async (newCircuits: Circuit[] | ((prev: Circuit[]) => Circuit[])) => {
    const updatedCircuits = typeof newCircuits === 'function' ? newCircuits(circuits) : newCircuits;
    
    if (updatedCircuits.length > circuits.length) {
      const added = updatedCircuits.find((c: Circuit) => !circuits.find((oc: Circuit) => oc.id === c.id));
      if (added) {
        try {
          await fetch(`${API_BASE_URL}/circuits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(added),
          });
          setCircuits(updatedCircuits);
        } catch (err) {
          console.error('Error adding circuit:', err);
          setError('Failed to add circuit');
        }
      }
    } else if (updatedCircuits.length < circuits.length) {
      const deleted = circuits.find((c: Circuit) => !updatedCircuits.find((uc: Circuit) => uc.id === c.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/circuits/${deleted.id}`, {
            method: 'DELETE',
          });
          setCircuits(updatedCircuits);
        } catch (err) {
          console.error('Error deleting circuit:', err);
          setError('Failed to delete circuit');
        }
      }
    } else {
      setCircuits(updatedCircuits);
    }
  };

  const handleSetRaces = async (newRaces: Race[] | ((prev: Race[]) => Race[])) => {
    const updatedRaces = typeof newRaces === 'function' ? newRaces(races) : newRaces;
    
    if (updatedRaces.length > races.length) {
      const added = updatedRaces.find((r: Race) => !races.find((or: Race) => or.id === r.id));
      if (added) {
        try {
          await fetch(`${API_BASE_URL}/races`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(added),
          });
          setRaces(updatedRaces);
        } catch (err) {
          console.error('Error adding race:', err);
          setError('Failed to add race');
        }
      }
    } else if (updatedRaces.length < races.length) {
      const deleted = races.find((r: Race) => !updatedRaces.find((ur: Race) => ur.id === r.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/races/${deleted.id}`, {
            method: 'DELETE',
          });
          setRaces(updatedRaces);
        } catch (err) {
          console.error('Error deleting race:', err);
          setError('Failed to delete race');
        }
      }
    } else {
      setRaces(updatedRaces);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'drivers', label: 'Drivers', icon: User },
    { id: 'circuits', label: 'Circuits', icon: MapPin },
    { id: 'races', label: 'Races & Results', icon: Trophy },
    { id: 'predictions', label: 'Predictions', icon: Target },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-f1-bg items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-f1-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 font-mono">Loading from Neon Database...</p>
          <p className="text-white/40 text-xs mt-2">Connected to cloud PostgreSQL</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-f1-bg items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Database Connection Error</h2>
          <p className="text-white/60 text-sm mb-4">{error}</p>
          <button 
            onClick={() => fetchAllData()}
            className="mt-6 px-6 py-2 bg-f1-red text-white rounded font-bold hover:bg-red-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="app-container" className="flex h-screen bg-f1-bg text-[#E0E0E0] font-sans selection:bg-f1-red selection:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-20 border-r border-f1-border flex flex-col items-center py-8 gap-10 bg-f1-sidebar z-50">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-f1-red flex items-center justify-center f1-italic-bold text-white text-xl md:text-2xl f1-red-glow shrink-0">
          F1
        </div>
        
        <nav className="flex-1 flex flex-col items-center gap-8 w-full px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={cn(
                "p-3 rounded-lg transition-all relative group",
                activeView === item.id 
                  ? "bg-f1-red text-white f1-red-glow" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              {activeView === item.id && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-6 bg-f1-red rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto opacity-40 text-[10px] uppercase font-bold rotate-180 mb-4 whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
          SYS V2.4 • PITWALL
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-f1-border px-8 flex items-center justify-between bg-gradient-to-r from-f1-bg to-[#161618] z-40 shrink-0">
          <div>
            <h1 className="text-[10px] uppercase tracking-[0.4em] text-f1-red font-bold animate-pulse">
              System Active • {activeView.toUpperCase()} • Neon Cloud
            </h1>
            <p className="text-xl md:text-2xl f1-italic-bold">
              {activeView === 'dashboard' ? 'Race Control Center' : 
               activeView === 'teams' ? 'Constructor Directory' : 
               activeView === 'drivers' ? 'Driver Telemetry' : 
               activeView === 'circuits' ? 'Circuit Database' : 
               activeView === 'races' ? 'Grand Prix Schedule' : 'Event Predictions'}
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase opacity-40 font-bold tracking-widest">Database</span>
              <span className="text-sm font-mono text-green-400">Neon PostgreSQL</span>
            </div>
            <div className="h-4 w-px bg-f1-border" />
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-black text-green-400 uppercase tracking-widest">Cloud Active</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeView === 'dashboard' && <Dashboard teams={teams} drivers={drivers} circuits={circuits} races={races} />}
                {activeView === 'teams' && <TeamsManagement teams={teams} setTeams={handleSetTeams} />}
                {activeView === 'drivers' && <DriversManagement drivers={drivers} setDrivers={handleSetDrivers} teams={teams} />}
                {activeView === 'circuits' && <CircuitsManagement circuits={circuits} setCircuits={handleSetCircuits} />}
                {activeView === 'races' && (
                  <RaceManagement 
                    races={races} 
                    setRaces={handleSetRaces} 
                    circuits={circuits} 
                    sessions={sessions}
                    setSessions={setSessions}
                    results={results}
                    setResults={setResults}
                  />
                )}
                {activeView === 'predictions' && (
                  <Predictions 
                    predictions={predictions} 
                    setPredictions={setPredictions} 
                    races={races} 
                    drivers={drivers} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="h-10 border-t border-f1-border bg-f1-sidebar px-6 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] font-medium shrink-0">
          <div className="flex gap-8">
            <span className="text-green-500 font-bold flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
              ● Neon Cloud Connected
            </span>
            <span className="opacity-40">User: Admin_X3</span>
            <span className="opacity-40 hidden sm:inline">DB: PostgreSQL 16</span>
          </div>
          <div className="flex gap-8 opacity-40">
            <span>PITWALL v.8.12.0</span>
            <span className="hidden sm:inline">© 2024 PitWall Digital</span>
          </div>
        </footer>
      </main>
    </div>
  );
}