const API_URL = 'http://localhost:5000/api';

export const api = {
  // Teams
  async getTeams() {
    const res = await fetch(`${API_URL}/teams`);
    return res.json();
  },
  async createTeam(team: any) {
    const res = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    });
    return res.json();
  },
  async deleteTeam(id: string) {
    const res = await fetch(`${API_URL}/teams/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Drivers
  async getDrivers() {
    const res = await fetch(`${API_URL}/drivers`);
    return res.json();
  },
  async createDriver(driver: any) {
    const res = await fetch(`${API_URL}/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driver),
    });
    return res.json();
  },
  async deleteDriver(id: string) {
    const res = await fetch(`${API_URL}/drivers/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Circuits
  async getCircuits() {
    const res = await fetch(`${API_URL}/circuits`);
    return res.json();
  },
  async createCircuit(circuit: any) {
    const res = await fetch(`${API_URL}/circuits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(circuit),
    });
    return res.json();
  },
  async deleteCircuit(id: string) {
    const res = await fetch(`${API_URL}/circuits/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Races
  async getRaces() {
    const res = await fetch(`${API_URL}/races`);
    return res.json();
  },
  async createRace(race: any) {
    const res = await fetch(`${API_URL}/races`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(race),
    });
    return res.json();
  },
  async deleteRace(id: string) {
    const res = await fetch(`${API_URL}/races/${id}`, { method: 'DELETE' });
    return res.json();
  },
};