import { useState } from 'react';
import { Driver, Team } from '../types.ts';
import { Plus, Trash2, Edit2, Search, User, Globe2, Calendar, Shield, X, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';

const API_BASE_URL = 'https://f1-racing-c1im.onrender.com/api';

interface DriversManagementProps {
  drivers: Driver[];
  setDrivers: (drivers: Driver[]) => void;
  teams: Team[];
}

export default function DriversManagement({ drivers, setDrivers, teams }: DriversManagementProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'Independent';

  const filteredDrivers = drivers.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTeamName(d.teamId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (driver: Driver) => {
    setNewDriver(driver);
    setEditingId(driver.id);
    setIsAddOpen(true);
  };

  const handleDelete = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete driver');
      }
      
      setDrivers(drivers.filter(d => d.id !== driverId));
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver');
    }
  };

  const handleAdd = async () => {
  if (newDriver.firstName && newDriver.lastName && newDriver.teamId) {
    setIsSaving(true);
    
    // Generate a short ID (first 3 letters of first name + timestamp)
    const shortId = editingId || `${newDriver.firstName.substring(0, 3).toUpperCase()}${Date.now()}`;
    
    const driverToSave = {
      id: shortId,
      teamid: newDriver.teamId,
      firstname: newDriver.firstName,
      lastname: newDriver.lastName,
      nationality: newDriver.nationality || 'Unknown',
      dob: newDriver.dob || '1990-01-01'
    };
    
    console.log('📤 Sending to backend:', driverToSave); // ADD THIS LINE
    
    try {
      const response = await fetch(`${API_BASE_URL}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverToSave),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save driver');
      }
      
      const savedDriver = await response.json();
      console.log('✅ Driver saved to Neon:', savedDriver);
      
      if (editingId) {
        setDrivers(drivers.map(d => d.id === editingId ? savedDriver : d));
      } else {
        setDrivers([...drivers, savedDriver]);
      }
      
      setNewDriver({});
      setIsAddOpen(false);
      setEditingId(null);
    } catch (error: any) {
      console.error('❌ Error saving driver:', error);
      alert(`Failed to save driver: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  } else {
    alert('Please fill in all required fields (First Name, Last Name, Team)');
  }
};

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-f1-border">
        <div>
          <h2 className="text-4xl f1-italic-bold tracking-tight">Drivers</h2>
          <p className="text-white/40 font-mono text-xs mt-2 uppercase tracking-widest">Athlete Biometric Data</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input 
              type="text" 
              placeholder="Filter roster..." 
              className="pl-10 pr-4 py-2.5 bg-black/40 border border-f1-border rounded text-xs font-mono focus:outline-none focus:border-f1-red transition-all w-64 uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setIsAddOpen(true); setEditingId(null); setNewDriver({}); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-f1-red text-white rounded font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all f1-red-glow"
          >
            <Plus className="w-4 h-4" />
            Enlist Driver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDrivers.map((driver, i) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={driver.id}
            className="group bg-f1-card border border-f1-border rounded overflow-hidden hover:bg-black/40 transition-all relative"
          >
            <div className="p-4 border-b border-f1-border bg-black/20 flex justify-between items-center">
              <span className="text-[9px] font-mono text-white/20 tracking-tighter">REF_{driver.id}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(driver)} className="p-1.5 hover:bg-white/5 text-white/40 hover:text-white rounded">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(driver.id)} className="p-1.5 hover:bg-red-500/10 text-white/40 hover:text-f1-red rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold italic uppercase tracking-tighter truncate leading-none">{driver.firstName} {driver.lastName}</h3>
                <p className="text-[10px] font-mono font-bold text-f1-red mt-1.5 uppercase tracking-wider">{getTeamName(driver.teamId)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-f1-border/30 pt-4 font-mono">
                <div>
                  <p className="text-[8px] uppercase font-black text-white/30 tracking-widest mb-1">Nationality</p>
                  <p className="text-[10px] text-white/80">{driver.nationality}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase font-black text-white/30 tracking-widest mb-1">Born</p>
                  <p className="text-[10px] text-white/80">{new Date(driver.dob).getFullYear() || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="h-1 w-full bg-f1-border">
              <div 
                className="h-full bg-f1-red transition-all duration-1000" 
                style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }} 
              />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
                <h3 className="text-2xl f1-italic-bold">{editingId ? 'Modify Athlete' : 'Register Athlete'}</h3>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-white/5 rounded">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 font-mono">
                 <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">First Name</label>
                  <input 
                    type="text" 
                    placeholder="NAME..." 
                    className="w-full px-4 py-3 bg-black/40 border border-f1-border rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newDriver.firstName || ''}
                    onChange={e => setNewDriver({ ...newDriver, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="SURNAME..." 
                    className="w-full px-4 py-3 bg-black/40 border border-f1-border rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newDriver.lastName || ''}
                    onChange={e => setNewDriver({ ...newDriver, lastName: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Constructor Alignment</label>
                  <select 
                    className="w-full px-4 py-3 bg-black/40 border border-f1-border rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newDriver.teamId || ''}
                    onChange={e => setNewDriver({ ...newDriver, teamId: e.target.value })}
                  >
                    <option value="" disabled>SELECT TEAM...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Origin</label>
                  <input 
                    type="text" 
                    placeholder="COUNTRY..." 
                    className="w-full px-4 py-3 bg-black/40 border border-f1-border rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newDriver.nationality || ''}
                    onChange={e => setNewDriver({ ...newDriver, nationality: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Birth Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-black/40 border border-f1-border rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newDriver.dob || ''}
                    onChange={e => setNewDriver({ ...newDriver, dob: e.target.value })}
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
                  disabled={!newDriver.firstName || !newDriver.lastName || !newDriver.teamId || isSaving}
                  className="flex-1 py-3 bg-f1-red text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all f1-red-glow disabled:opacity-30 disabled:f1-red-glow-none"
                >
                  {isSaving ? 'SAVING...' : (editingId ? 'Update Driver' : 'Add Driver')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
