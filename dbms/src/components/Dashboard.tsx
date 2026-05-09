import { 
  Trophy, 
  Users, 
  MapPin, 
  Flag, 
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Team, Driver, Circuit, Race } from '../types.ts';
import { motion } from 'motion/react';

interface DashboardProps {
  teams: Team[];
  drivers: Driver[];
  circuits: Circuit[];
  races: Race[];
}

export default function Dashboard({ teams, drivers, circuits, races }: DashboardProps) {
  // Data for the chart matching F1 colors
  const teamPerformanceData = teams.map(team => ({
    name: team.name,
    points: Math.floor(Math.random() * 200) + 50,
    color: team.name.includes('Red Bull') ? '#3671C6' : 
           team.name.includes('Mercedes') ? '#27F4D2' :
           team.name.includes('Ferrari') ? '#E10600' :
           team.name.includes('McLaren') ? '#FF8000' :
           team.name.includes('Aston Martin') ? '#229971' : '#64748B'
  })).sort((a, b) => b.points - a.points);

  const stats = [
    { label: 'Active Teams', value: teams.length, icon: Users, color: 'text-blue-400' },
    { label: 'Registered Drivers', value: drivers.length, icon: Award, color: 'text-f1-red' },
    { label: 'Global Circuits', value: circuits.length, icon: MapPin, color: 'text-green-400' },
    { label: 'Races Scheduled', value: races.length, icon: Flag, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label}
            className="p-6 bg-f1-card border border-f1-border rounded shadow-[0_4px_20px_rgba(0,0,0,0.4)] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <stat.icon className="w-12 h-12" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">{stat.label}</span>
              <div className="flex items-end gap-3">
                <span className="text-4xl f1-italic-bold leading-none">{stat.value}</span>
                <stat.icon className={cn("w-5 h-5 mb-1", stat.color)} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-f1-red/10 w-full">
              <div className="h-full bg-f1-red w-1/3 group-hover:w-full transition-all duration-500" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 p-8 bg-f1-card border border-f1-border rounded shadow-2xl space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-f1-red font-bold mb-2">Live Performance</h3>
              <p className="text-2xl f1-italic-bold">Constructor Standings</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-f1-red animate-pulse" />
                Live Data
              </span>
            </div>
          </div>

          <div className="h-[350px] w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D2D2F" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#2D2D2F' }} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#6B7280', fontWeight: 700 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  axisLine={{ stroke: '#2D2D2F' }} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#6B7280', fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0B0B0C', border: '1px solid #2D2D2F', borderRadius: '4px', fontSize: '12px' }}
                />
                <Bar dataKey="points" radius={[2, 2, 0, 0]} barSize={32}>
                  {teamPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-gradient-to-br from-f1-red/20 to-f1-card border border-f1-red/30 rounded relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Trophy className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-2 py-0.5 bg-f1-red text-white text-[9px] font-black uppercase tracking-widest mb-4 f1-red-glow">Upcoming</span>
              <h3 className="text-2xl f1-italic-bold mb-1">Monaco Grand Prix</h3>
              <div className="flex items-center gap-2 text-white/50 text-xs mb-8 font-mono">
                <MapPin className="w-3 h-3 text-f1-red" />
                Monte Carlo, Monaco
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded border border-white/5 group hover:border-f1-red/30 transition-colors">
                  <span className="text-[10px] uppercase font-black text-white/40 group-hover:text-white/60">Main Race</span>
                  <span className="text-sm font-mono text-f1-red font-bold">15:00 UTC</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/40 rounded border border-white/5 opacity-50">
                  <span className="text-[10px] uppercase font-black">Qualifying</span>
                  <span className="text-sm font-mono">Comp.</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-f1-card border border-f1-border rounded space-y-6"
          >
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Telemetry Feed</h4>
            <div className="space-y-4">
              {[
                { event: 'Constructor Update', details: 'Aston Martin database expanded', time: 'NOW' },
                { event: 'Race Log', details: 'Bahrain GP results archived', time: '1h' },
                { event: 'Prediction Sync', details: 'Batch node #4292 verified', time: '3h' },
              ].map((act, i) => (
                <div key={i} className="flex gap-4 items-start font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-f1-red mt-1" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-white/80">{act.event}</span>
                      <span className="text-[9px] text-f1-red">{act.time}</span>
                    </div>
                    <span className="text-[10px] text-white/40 truncate">{act.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
