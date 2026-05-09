import { useState } from 'react';
import { Team } from '../types.ts';
import { Plus, Trash2, Edit2, Search, Building2, MapPin, UserSquare2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';

const API_BASE_URL = 'https://f1-backend.onrender.com/api';

interface TeamsManagementProps {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
}

export default function TeamsManagement({ teams, setTeams }: TeamsManagementProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTeam, setNewTeam] = useState<Partial<Team>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.hq.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.principal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (newTeam.name && newTeam.hq && newTeam.principal) {
      setIsSaving(true);
      
      // Generate a short ID (first 3 letters of name + timestamp)
      const shortId = editingId || `${newTeam.name.substring(0, 3).toUpperCase()}${Date.now()}`;
      
      const teamToSave = {
        id: shortId,
        name: newTeam.name,
        hq: newTeam.hq,
        principal: newTeam.principal
      };
      
      console.log('📤 Saving team to Neon:', teamToSave);
      
      try {
        const response = await fetch(`${API_BASE_URL}/teams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamToSave),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save team');
        }
        
        const savedTeam = await response.json();
        console.log('✅ Team saved to Neon:', savedTeam);
        
        if (editingId) {
          setTeams(teams.map(t => t.id === editingId ? savedTeam : t));
        } else {
          setTeams([...teams, savedTeam]);
        }
        
        setNewTeam({});
        setIsAddOpen(false);
        setEditingId(null);
      } catch (error: any) {
        console.error('❌ Error saving team:', error);
        alert(`Failed to save team: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      alert('Please fill in all fields');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team? This will also delete all associated drivers.')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
      
      console.log('✅ Team deleted from Neon:', id);
      setTeams(teams.filter(t => t.id !== id));
    } catch (error: any) {
      console.error('❌ Error deleting team:', error);
      alert(`Failed to delete team: ${error.message}`);
    }
  };

  const startEdit = (team: Team) => {
    setNewTeam(team);
    setEditingId(team.id);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-f1-border">
        <div>
          <h2 className="text-4xl f1-italic-bold tracking-tight">Constructors</h2>
          <p className="text-white/40 font-mono text-xs mt-2 uppercase tracking-widest">Active Engineering Nodes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input 
              type="text" 
              placeholder="Query database..." 
              className="pl-10 pr-4 py-2.5 bg-black/40 border border-f1-border rounded text-xs font-mono focus:outline-none focus:border-f1-red transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setIsAddOpen(true); setEditingId(null); setNewTeam({}); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-f1-red text-white rounded font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all f1-red-glow"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team, i) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={team.id}
            className="group p-6 bg-f1-card border-l-2 border-f1-border hover:border-f1-red bg-gradient-to-br from-f1-card to-transparent transition-all relative overflow-hidden"
            style={{ 
              borderLeftColor: team.name.includes('Red Bull') ? '#3671C6' : 
                               team.name.includes('Mercedes') ? '#27F4D2' :
                               team.name.includes('Ferrari') ? '#E10600' :
                               team.name.includes('McLaren') ? '#FF8000' : 
                               team.name.includes('Aston Martin') ? '#229971' : '#2D2D2F' 
            }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em]">Node_{team.id}</div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(team)} className="p-1.5 hover:bg-white/5 text-white/40 hover:text-white rounded transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(team.id)} className="p-1.5 hover:bg-red-500/10 text-white/40 hover:text-f1-red rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-2xl f1-italic-bold mb-6 group-hover:text-f1-red transition-colors">{team.name}</h3>
            
            <div className="space-y-4 font-mono">
              <div className="flex items-start gap-4">
                <MapPin className="w-3.5 h-3.5 text-f1-red mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest">Base Operations</span>
                  <span className="text-xs text-white/80 mt-1">{team.hq}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <UserSquare2 className="w-3.5 h-3.5 text-f1-red mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest">Team Principal</span>
                  <span className="text-xs text-white/80 mt-1">{team.principal}</span>
                </div>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] -mr-8 -mt-8 pointer-events-none">
              <Building2 className="w-40 h-40" />
            </div>
          </motion.div>
        ))}
      </div>

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
              className="relative w-full max-w-lg bg-[#161618] border border-f1-border rounded p-8 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl f1-italic-bold">{editingId ? 'Modify Constructor' : 'Register Constructor'}</h3>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-white/5 rounded">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="space-y-6 font-mono">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Team Identity</label>
                  <input 
                    type="text" 
                    placeholder="ENTER NAME..." 
                    className="w-full px-4 py-3 bg-black/40 border border-[#2D2D2F] rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newTeam.name || ''}
                    onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Operations Base</label>
                  <input 
                    type="text" 
                    placeholder="ENTER LOCATION..." 
                    className="w-full px-4 py-3 bg-black/40 border border-[#2D2D2F] rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newTeam.hq || ''}
                    onChange={e => setNewTeam({ ...newTeam, hq: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest px-1">Lead Principal</label>
                  <input 
                    type="text" 
                    placeholder="ENTER NAME..." 
                    className="w-full px-4 py-3 bg-black/40 border border-[#2D2D2F] rounded focus:border-f1-red focus:outline-none transition-all text-sm uppercase text-white"
                    value={newTeam.principal || ''}
                    onChange={e => setNewTeam({ ...newTeam, principal: e.target.value })}
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
                  disabled={!newTeam.name || !newTeam.hq || !newTeam.principal || isSaving}
                  className="flex-1 py-3 bg-f1-red text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all f1-red-glow disabled:opacity-30"
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
