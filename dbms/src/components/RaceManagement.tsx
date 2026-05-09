import { useState } from 'react';
import { Race, Circuit, Session, Result, Driver } from '../types.ts';
import { Plus, Trash2, Calendar, Trophy, Zap, MapPin, ListFilter, X, ChevronRight, Hash, Award, Clock, History, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';

const API_BASE_URL = 'http://localhost:5000/api';

interface RaceManagementProps {
  races: Race[];
  setRaces: (races: Race[]) => void;
  circuits: Circuit[];
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  results: Result[];
  setResults: (results: Result[]) => void;
}

export default function RaceManagement({ 
  races, 
  setRaces, 
  circuits, 
  sessions, 
  setSessions,
  results,
  setResults 
}: RaceManagementProps) {
  const [activeTab, setActiveTab] = useState<'races' | 'results'>('races');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRace, setNewRace] = useState<Partial<Race>>({});
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getCircuitName = (id: string) => circuits.find(c => c.id === id)?.name || 'Unknown Location';

  const [lapRecords, setLapRecords] = useState<{ id: string, sessionId: string, driver: string, time: string }[]>([]);

  const handleAddRace = async () => {
    if (newRace.name && newRace.circuitId && newRace.date) {
      setIsSaving(true);
      
      const raceId = `R${newRace.name.substring(0, 3).toUpperCase()}${Date.now()}`;
      
      const raceToSave = {
        id: raceId,
        circuitid: newRace.circuitId,
        name: newRace.name,
        date: newRace.date,
        laps: newRace.laps || 50
      };
      
      console.log('📤 Saving race to Neon:', raceToSave);
      
      try {
        // Save race to Neon
        const raceResponse = await fetch(`${API_BASE_URL}/races`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(raceToSave),
        });
        
        if (!raceResponse.ok) {
          const error = await raceResponse.json();
          throw new Error(error.error || 'Failed to save race');
        }
        
        const savedRace = await raceResponse.json();
        console.log('✅ Race saved to Neon:', savedRace);
        
        // Create default sessions for the race
        const sessionsToSave: Session[] = [
          { id: `S${Date.now()}-1`, raceId: raceId, type: 'Practice', startTime: `${newRace.date}T10:00:00Z`, weather: 'Dry' },
          { id: `S${Date.now()}-2`, raceId: raceId, type: 'Qualifying', startTime: `${newRace.date}T14:00:00Z`, weather: 'Dry' },
          { id: `S${Date.now()}-3`, raceId: raceId, type: 'Race', startTime: `${newRace.date}T15:00:00Z`, weather: 'Dry' },
        ];
        
        // Save sessions to Neon (you'll need to add session endpoints)
        for (const session of sessionsToSave) {
          await fetch(`${API_BASE_URL}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session),
          });
        }
        
        setSessions([...sessions, ...sessionsToSave]);
        setRaces([...races, savedRace]);
        setNewRace({});
        setIsAddOpen(false);
      } catch (error: any) {
        console.error('❌ Error saving race:', error);
        alert(`Failed to save race: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleDeleteRace = async (id: string) => {
    if (!confirm('Delete this race and all associated sessions?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/races/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete race');
      }
      
      console.log('✅ Race deleted from Neon:', id);
      setRaces(races.filter(r => r.id !== id));
      setSessions(sessions.filter(s => s.raceId !== id));
    } catch (error: any) {
      console.error('❌ Error deleting race:', error);
      alert(`Failed to delete race: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-f1-border">
        <div>
          <h2 className="text-4xl f1-italic-bold tracking-tight">Race Control</h2>
          <p className="text-white/40 font-mono text-xs mt-2 uppercase tracking-widest">Event Scheduling & telemetry logging</p>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded border border-f1-border">
          <button 
            onClick={() => setActiveTab('races')}
            className={cn(
              "px-6 py-2 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeTab === 'races' ? "bg-f1-red text-white shadow-[0_0_15px_rgba(255,24,1,0.3)]" : "text-white/30 hover:text-white"
            )}
          >
            Tactical Wall
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={cn(
              "px-6 py-2 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeTab === 'results' ? "bg-f1-red text-white shadow-[0_0_15px_rgba(255,24,1,0.3)]" : "text-white/30 hover:text-white"
            )}
          >
            Black Box
          </button>
        </div>
      </div>

      {activeTab === 'races' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-f1-red flex items-center gap-2">
              <span className="w-2 h-2 bg-f1-red animate-pulse" />
              Active Deployment Schedule
            </h3>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 bg-white/5 border border-f1-border text-white rounded font-mono text-[10px] uppercase tracking-widest hover:border-f1-red transition-all flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Add Event Node
            </button>
          </div>

          <div className="space-y-4">
            {races.map((race, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={race.id}
                className="group cursor-pointer"
                onClick={() => setSelectedRaceId(selectedRaceId === race.id ? null : race.id)}
              >
                <div className={cn(
                  "flex flex-col md:flex-row md:items-center bg-f1-card border border-f1-border p-6 hover:border-f1-red/40 transition-all gap-8 relative",
                  selectedRaceId === race.id && "border-f1-red/50 bg-black/40"
                )}>
                  <div className="flex-1 flex items-center gap-8">
                    <div className="w-20 h-20 border border-f1-border flex flex-col items-center justify-center bg-black/40 group-hover:border-f1-red/30 transition-colors">
                      <span className="text-[10px] font-black font-mono text-white/30 mb-1">
                        {new Date(race.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-3xl f1-italic-bold group-hover:text-f1-red transition-colors">
                        {new Date(race.date).getDate()}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl f1-italic-bold leading-none">{race.name}</h3>
                      <div className="flex flex-wrap items-center gap-6 mt-4 font-mono">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                          <MapPin className="w-3 h-3 text-f1-red" />
                          {getCircuitName(race.circuitId)}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-tighter border-l border-f1-border pl-6">
                          <Zap className="w-3 h-3 text-f1-red" />
                          {race.laps} LAPS DATA
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2">Session Array</p>
                      <div className="flex gap-2 justify-end">
                        {sessions.filter(s => s.raceId === race.id).map(s => (
                          <div key={s.id} className="w-4 h-1 bg-f1-red/30 group-hover:bg-f1-red transition-colors" title={s.type} />
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRace(race.id);
                      }}
                      className="p-2 hover:bg-red-500/10 text-white/40 hover:text-f1-red rounded transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-4 bg-black/40 border border-f1-border rounded group-hover:border-f1-red transition-colors text-white/20 group-hover:text-f1-red">
                      <ChevronRight className={cn("w-5 h-5 transition-transform", selectedRaceId === race.id && "rotate-90")} />
                    </div>
                  </div>

                  {selectedRaceId === race.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-f1-red" />}
                </div>

                <AnimatePresence>
                  {selectedRaceId === race.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden bg-black/20 border-x border-b border-f1-border"
                    >
                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {sessions.filter(s => s.raceId === selectedRaceId).map(s => (
                            <div key={s.id} className="p-6 bg-f1-card border border-white/5 space-y-6 hover:border-f1-red/20 transition-all">
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "px-2 py-1 rounded text-[9px] font-black uppercase tracking-[0.2em] font-mono",
                                  s.type === 'Race' ? "bg-f1-red text-white" : "border border-f1-border text-white/40"
                                )}>
                                  {s.type}
                                </span>
                                <Clock className="w-4 h-4 text-white/20" />
                              </div>
                              <div className="font-mono">
                                <div className="text-2xl font-bold text-white/80">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                <div className="text-[10px] text-f1-red font-bold uppercase mt-2 tracking-widest">{s.weather} CONDITIONS</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="bg-f1-card border border-f1-border p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <Trophy className="w-96 h-96" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="w-24 h-24 border border-f1-border flex items-center justify-center mx-auto text-white/10">
              <History className="w-10 h-10" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl f1-italic-bold">Historical data locked</h3>
              <p className="text-xs font-mono text-white/30 leading-relaxed uppercase tracking-widest mt-4">Telemetry and constructor standings are archived until the next deployment cycle is finalized by the race director.</p>
            </div>
            <button className="mt-8 px-8 py-3 bg-white/5 border border-f1-border text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-f1-red hover:border-f1-red transition-all">
              Request Archive Access
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-f1-card border border-f1-border rounded p-8 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl f1-italic-bold uppercase italic tracking-tighter">New Deployment</h3>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-white/5 rounded">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="space-y-6 font-mono">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Mission Identifier</label>
                  <input 
                    type="text" 
                    placeholder="E.G. SILVERSTONE GP..." 
                    className="w-full px-4 py-3 bg-black/40 border border-f1-border rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newRace.name || ''}
                    onChange={e => setNewRace({ ...newRace, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Geographic Pivot</label>
                  <select 
                    className="w-full px-4 py-3 bg-black/40 border border-f1-border rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newRace.circuitId || ''}
                    onChange={e => setNewRace({ ...newRace, circuitId: e.target.value })}
                  >
                    <option value="" disabled>SELECT CIRCUIT...</option>
                    {circuits.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Target Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 bg-black/40 border border-f1-border rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                      value={newRace.date || ''}
                      onChange={e => setNewRace({ ...newRace, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Lap Limit</label>
                    <input 
                      type="number" 
                      placeholder="50" 
                      className="w-full px-4 py-3 bg-black/40 border border-f1-border rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                      value={newRace.laps || ''}
                      onChange={e => setNewRace({ ...newRace, laps: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 border border-f1-border rounded text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Terminate
                </button>
                <button 
                  onClick={handleAddRace}
                  disabled={!newRace.name || !newRace.circuitId || !newRace.date || isSaving}
                  className="flex-1 py-3 bg-f1-red text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all f1-red-glow disabled:opacity-30"
                >
                  {isSaving ? 'SAVING...' : 'Initialize MISSION'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}