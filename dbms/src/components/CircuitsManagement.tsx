import { useState } from 'react';
import { Circuit } from '../types.ts';
import { Plus, Trash2, Edit2, Search, Map, Navigation, Ruler, X, LandPlot, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_BASE_URL = 'https://f1-racing-c1im.onrender.com/api';

interface CircuitsManagementProps {
  circuits: Circuit[];
  setCircuits: (circuits: Circuit[]) => void;
}

export default function CircuitsManagement({ circuits, setCircuits }: CircuitsManagementProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCircuit, setNewCircuit] = useState<Partial<Circuit>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCircuits = circuits.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (newCircuit.name && newCircuit.location && newCircuit.lengthKm) {
      setIsSaving(true);
      
      // Generate a short ID (first 3 letters of name + timestamp)
      const shortId = editingId || `${newCircuit.name.substring(0, 3).toUpperCase()}${Date.now()}`;
      
      const circuitToSave = {
        id: shortId,
        name: newCircuit.name,
        location: newCircuit.location,
        lengthKm: newCircuit.lengthKm
      };
      
      try {
        const response = await fetch(`${API_BASE_URL}/circuits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(circuitToSave),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save circuit');
        }
        
        const savedCircuit = await response.json();
        console.log('✅ Circuit saved to Neon:', savedCircuit);
        
        if (editingId) {
          setCircuits(circuits.map(c => c.id === editingId ? savedCircuit : c));
        } else {
          setCircuits([...circuits, savedCircuit]);
        }
        
        setNewCircuit({});
        setIsAddOpen(false);
        setEditingId(null);
      } catch (error: any) {
        console.error('❌ Error saving circuit:', error);
        alert(`Failed to save circuit: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      alert('Please fill in all fields');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this circuit?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/circuits/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete circuit');
      }
      
      console.log('✅ Circuit deleted from Neon:', id);
      setCircuits(circuits.filter(c => c.id !== id));
    } catch (error: any) {
      console.error('❌ Error deleting circuit:', error);
      alert(`Failed to delete circuit: ${error.message}`);
    }
  };

  const startEdit = (circuit: Circuit) => {
    setNewCircuit(circuit);
    setEditingId(circuit.id);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-f1-border">
        <div>
          <h2 className="text-4xl f1-italic-bold tracking-tight">Circuits</h2>
          <p className="text-white/40 font-mono text-xs mt-2 uppercase tracking-widest">Global Tactical Arenas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input 
              type="text" 
              placeholder="Search geography..." 
              className="pl-10 pr-4 py-2.5 bg-black/40 border border-f1-border rounded text-xs font-mono focus:outline-none focus:border-f1-red transition-all w-64 uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setIsAddOpen(true); setEditingId(null); setNewCircuit({}); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-f1-red text-white rounded font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all f1-red-glow"
          >
            <Plus className="w-4 h-4" />
            Deploy Circuit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCircuits.map((circuit, i) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={circuit.id}
            className="group p-8 bg-f1-card border border-f1-border hover:border-f1-red/50 bg-gradient-to-br from-f1-card to-transparent transition-all relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-f1-red/30 flex items-center justify-center text-f1-red bg-f1-red/5">
                  <LandPlot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl f1-italic-bold group-hover:text-f1-red transition-colors leading-none">{circuit.name}</h3>
                  <p className="text-[10px] font-mono font-bold text-white/30 mt-2 uppercase tracking-widest">{circuit.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(circuit)} className="p-2 hover:bg-white/5 text-white/40 hover:text-white rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(circuit.id)} className="p-2 hover:bg-red-500/10 text-white/40 hover:text-f1-red rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 font-mono">
              <div className="p-4 bg-black/20 border border-white/5 rounded">
                <span className="text-[9px] uppercase font-black text-white/20 tracking-[0.2em] block mb-2">Track Length</span>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-white/90">{circuit.lengthKm}</span>
                  <span className="text-[10px] text-f1-red font-bold mb-1">KM</span>
                </div>
              </div>
              <div className="p-4 bg-black/20 border border-white/5 rounded">
                <span className="text-[9px] uppercase font-black text-white/20 tracking-[0.2em] block mb-2">Record Lap</span>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-white/90">1:12.7</span>
                  <span className="text-[10px] text-f1-red font-bold mb-1">SEC</span>
                </div>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] -mr-12 -mt-12 pointer-events-none group-hover:opacity-[0.08] transition-opacity">
              <MapPin className="w-48 h-48" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                <h3 className="text-2xl f1-italic-bold">{editingId ? 'Modify Strategy Node' : 'Define New Circuit'}</h3>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-white/5 rounded">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="space-y-6 font-mono">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Circuit Title</label>
                  <input 
                    type="text" 
                    placeholder="ENTER NAME..." 
                    className="w-full px-4 py-3 bg-black/40 border border-[#2D2D2F] rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newCircuit.name || ''}
                    onChange={e => setNewCircuit({ ...newCircuit, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Geographic Pivot</label>
                  <input 
                    type="text" 
                    placeholder="ENTER LOCATION..." 
                    className="w-full px-4 py-3 bg-black/40 border border-[#2D2D2F] rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newCircuit.location || ''}
                    onChange={e => setNewCircuit({ ...newCircuit, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Tactical Length (KM)</label>
                  <input 
                    type="number" 
                    placeholder="0.000" 
                    step="0.001"
                    className="w-full px-4 py-3 bg-black/40 border border-[#2D2D2F] rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newCircuit.lengthKm || ''}
                    onChange={e => setNewCircuit({ ...newCircuit, lengthKm: parseFloat(e.target.value) })}
                  />
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
                  onClick={handleAdd}
                  disabled={!newCircuit.name || !newCircuit.location || !newCircuit.lengthKm || isSaving}
                  className="flex-1 py-3 bg-f1-red text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all f1-red-glow disabled:opacity-30 disabled:f1-red-glow-none"
                >
                  {isSaving ? 'SAVING...' : (editingId ? 'Update Node' : 'Initialize Node')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
