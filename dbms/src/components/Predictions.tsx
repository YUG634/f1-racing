import { useState } from 'react';
import { Prediction, Race, Driver } from '../types.ts';
import { Target, Plus, TrendingUp, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';

const API_BASE_URL = 'https://f1-racing-c1im.onrender.com/api';

interface PredictionsProps {
  predictions: Prediction[];
  setPredictions: (predictions: Prediction[]) => void;
  races: Race[];
  drivers: Driver[];
}

export default function Predictions({ predictions, setPredictions, races = [], drivers = [] }: PredictionsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPred, setNewPred] = useState<Partial<Prediction>>({});
  const [isSaving, setIsSaving] = useState(false);

  const getRaceName = (id: string) => {
    const race = races?.find(r => r.id === id);
    return race?.name || 'Unknown Race';
  };
  
  const getDriverName = (id: string) => {
    const driver = drivers?.find(d => d.id === id);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown Driver';
  };

  const handleAdd = async () => {
    if (newPred.raceId && newPred.driverId && newPred.predictedPosition) {
      setIsSaving(true);
      
      const predictionToSave = {
        id: `PRED_${Date.now()}`,
        raceId: newPred.raceId,
        driverId: newPred.driverId,
        predictedPosition: newPred.predictedPosition,
        userId: 'SYS_ADMIN',
        predictiontimestamp: new Date().toISOString()
      };
      
      console.log('📤 Sending prediction to Neon:', predictionToSave);
      
      try {
        const response = await fetch(`${API_BASE_URL}/predictions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(predictionToSave),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save prediction');
        }
        
        const savedPrediction = await response.json();
        console.log('✅ Prediction saved to Neon:', savedPrediction);
        
        setPredictions([savedPrediction, ...predictions]);
        setNewPred({});
        setIsAddOpen(false);
      } catch (error: any) {
        console.error('❌ Error saving prediction:', error);
        alert(`Failed to save prediction: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prediction?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/predictions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prediction');
      }
      
      console.log('✅ Prediction deleted from Neon:', id);
      setPredictions(predictions.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('❌ Error deleting prediction:', error);
      alert(`Failed to delete prediction: ${error.message}`);
    }
  };

  // Safe check for empty data
  const hasRaces = races && races.length > 0;
  const hasDrivers = drivers && drivers.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-f1-border">
        <div>
          <h2 className="text-4xl f1-italic-bold tracking-tight">Predictions</h2>
          <p className="text-white/40 font-mono text-xs mt-2 uppercase tracking-widest">Sentiment analysis & probability vectors</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-f1-red text-white rounded font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all f1-red-glow"
        >
          <Plus className="w-4 h-4" />
          Broadcast Prediction
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-3">
            <History className="w-4 h-4 text-f1-red" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Live Feed_0x44</h3>
          </div>

          {!predictions || predictions.length === 0 ? (
            <div className="p-16 text-center bg-black/40 rounded border border-dashed border-f1-border">
              <Target className="w-16 h-16 text-white/10 mx-auto mb-6" />
              <p className="text-white/20 font-mono text-xs uppercase tracking-[0.2em]">Matrix empty. Awaiting user input.</p>
            </div>
          ) : (
            <div className="space-y-2 font-mono">
              {predictions.map((pred, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={pred.id}
                  className="flex items-center gap-6 p-6 bg-f1-card border border-f1-border hover:bg-black/40 transition-all group"
                >
                  <div className="w-16 h-16 bg-black/40 border border-f1-border flex items-center justify-center text-f1-red f1-italic-bold text-2xl">
                    P{pred.predictedPosition}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold uppercase italic tracking-tighter truncate leading-none text-white/90">{getDriverName(pred.driverId)}</h4>
                    <div className="flex items-center gap-3 mt-3">
                      <p className="text-[9px] font-bold text-f1-red uppercase tracking-widest">{getRaceName(pred.raceId)}</p>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <p className="text-[9px] font-medium text-white/30 uppercase tracking-tighter">{pred.userId}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end shrink-0">
                    <button 
                      onClick={() => handleDelete(pred.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-white/40 hover:text-f1-red rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mt-2">
                      {pred.predictiontimestamp ? new Date(pred.predictiontimestamp).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-f1-card border border-f1-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp className="w-24 h-24" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white underline decoration-f1-red mb-10">
              Consensus_Log
            </h4>
            <div className="space-y-8 font-mono">
              {drivers && drivers.slice(0, 3).map((driver, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-white/60 uppercase">{driver.firstName} {driver.lastName}</span>
                    <span className="text-[10px] font-black text-f1-red">{Math.floor(Math.random() * 60) + 20}%</span>
                  </div>
                  <div className="h-0.5 w-full bg-white/5">
                    <div className="h-full bg-f1-red" style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Fixed with safe checks */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
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
                <h3 className="text-2xl f1-italic-bold">Cast Vector</h3>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-white/5 rounded">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="space-y-6 font-mono">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Grand Prix Target</label>
                  <select 
                    className="w-full px-4 py-3 bg-black/40 border border-[#2D2D2F] rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newPred.raceId || ''}
                    onChange={e => setNewPred({ ...newPred, raceId: e.target.value })}
                  >
                    <option value="" disabled>SELECT EVENT...</option>
                    {hasRaces && races.map(r => (
                      <option key={r.id} value={r.id}>{r.name?.toUpperCase() || 'UNKNOWN'}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Driver Selection</label>
                  <select 
                    className="w-full px-4 py-3 bg-black/40 border border-[#2D2D2F] rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newPred.driverId || ''}
                    onChange={e => setNewPred({ ...newPred, driverId: e.target.value })}
                  >
                    <option value="" disabled>SELECT ATHLETE...</option>
                    {hasDrivers && drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.firstName?.toUpperCase() || ''} {d.lastName?.toUpperCase() || ''}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Predicted Rank</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(pos => (
                      <button
                        key={pos}
                        onClick={() => setNewPred({ ...newPred, predictedPosition: pos })}
                        className={cn(
                          "py-3 border font-mono text-[10px] font-black transition-all",
                          newPred.predictedPosition === pos 
                            ? "bg-f1-red border-f1-red text-white" 
                            : "bg-black/40 border-f1-border text-white/40 hover:border-white/20"
                        )}
                      >
                        P{pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 border border-f1-border rounded text-[10px] font-black uppercase tracking-widest hover:bg-white/5"
                >
                  Abort
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={!newPred.raceId || !newPred.driverId || !newPred.predictedPosition || isSaving}
                  className="flex-1 py-3 bg-f1-red text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-30"
                >
                  {isSaving ? 'SAVING...' : 'Confirm Vector'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
