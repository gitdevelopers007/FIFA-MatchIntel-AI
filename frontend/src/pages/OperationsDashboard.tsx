import React, { useState } from 'react';
import { useApp } from '../contexts/useApp';
import { GlassCard, StatusBadge, CustomButton } from '../components/DesignSystem';
import { InteractiveMap } from '../components/InteractiveMap';
import { ChatAssistant } from '../components/ChatAssistant';
import { Users, AlertTriangle, Play, CheckCircle2, Leaf, BarChart2, ShieldAlert } from 'lucide-react';
import type { FoodStall, Gate, Incident, Match, TransportRoute } from '../types';

export const OperationsDashboard: React.FC = () => {
  const {
    metrics,
    incidents,
    updateIncident,
    addNotification,
    fetchMetrics,
    fetchGates,
    fetchTransport,
    reportIncident,
    gates,
    foodStalls,
    routes,
    matches,
    updateGateState,
    updateFoodStallState,
    createFoodStallState,
    updateTransportRouteState,
    createTransportRouteState,
    updateMatchState
  } = useApp();

  const [activeTab, setActiveTab] = useState<'metrics' | 'map' | 'control_room' | 'copilot'>('metrics');
  const [triagingId, setTriagingId] = useState<number | null>(null);

  // CONTROL ROOM FORM STATES
  // Match
  const [selMatchId, setSelMatchId] = useState<number>(matches[0]?.id || 1);
  const [matchStatus, setMatchStatus] = useState<Match['status']>('scheduled');
  const [matchHome, setMatchHome] = useState('');
  const [matchAway, setMatchAway] = useState('');

  // Gate
  const [selGateId, setSelGateId] = useState<number>(gates[0]?.id || 1);
  const [gateStatus, setGateStatus] = useState<Gate['status']>('open');
  const [gateQueue, setGateQueue] = useState(5);

  // Concession
  const [selStallId, setSelStallId] = useState<number>(foodStalls[0]?.id || 1);
  const [stallStatus, setStallStatus] = useState<FoodStall['status']>('open');
  const [stallWait, setStallWait] = useState(5);
  const [stallSust, setStallSust] = useState(4.5);
  const [isNewStall, setIsNewStall] = useState(false);
  const [newStallName, setNewStallName] = useState('');
  const [newStallType, setNewStallType] = useState('Fast Food');
  const [newStallLoc, setNewStallLoc] = useState('');

  // Transit
  const [selRouteId, setSelRouteId] = useState<number>(routes[0]?.id || 1);
  const [routeStatus, setRouteStatus] = useState<TransportRoute['status']>('normal');
  const [routeWait, setRouteWait] = useState(10);
  const [isNewRoute, setIsNewRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteType, setNewRouteType] = useState<TransportRoute['type']>('bus');
  const [newRouteDest, setNewRouteDest] = useState('');

  // Form Submissions
  const handleUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMatchState(selMatchId, matchStatus, matchHome || undefined, matchAway || undefined);
    alert("Match roster and status parameters updated successfully!");
  };

  const handleUpdateGate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateGateState(selGateId, gateStatus, gateQueue);
    alert("Security entrance gate flow updated!");
  };

  const handleSaveStall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewStall) {
      await createFoodStallState(newStallName, newStallType, newStallLoc, stallStatus, stallWait, stallSust);
      setIsNewStall(false);
      setNewStallName('');
      setNewStallLoc('');
    } else {
      await updateFoodStallState(selStallId, stallStatus, stallWait, stallSust);
    }
    alert("Concessions catalog modified!");
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewRoute) {
      await createTransportRouteState(newRouteName, newRouteType, newRouteDest, routeStatus, routeWait);
      setIsNewRoute(false);
      setNewRouteName('');
      setNewRouteDest('');
    } else {
      await updateTransportRouteState(selRouteId, routeStatus, routeWait);
    }
    alert("Transit routing options modified!");
  };

  const triggerDisruption = (type: 'transport_delay' | 'gate_congestion' | 'medical_critical') => {
    if (type === 'transport_delay') {
      addNotification(
        "Transit Disruption: Route 160",
        "Route 160 bus line delayed by 40 minutes due to Highway Route 3 accident. Commuters advised to redirect to Express Train NYC.",
        "emergency"
      );
      alert("Transit Disruption Simulator Triggered: Notification broadcasted and bus schedules updated.");
    } else if (type === 'gate_congestion') {
      addNotification(
        "Gate C Congestion Alert",
        "Gate C (Pepsi Gate) experiencing heavy crowd accumulation. Volunteers redirected to deploy crowd funneling.",
        "emergency"
      );
      alert("Gate C Congestion Simulator Triggered: Queue delay set to congested.");
    } else if (type === 'medical_critical') {
      reportIncident(
        "Critical Heat Distress Alert",
        "Visitor suffering from heat exhaustion near Section 112 concessions.",
        "medical",
        "critical",
        "Section 112 Foyer"
      );
      alert("Medical Alert Simulator Triggered: Incident spawned on first aid response queue.");
    }
    fetchMetrics();
    fetchGates();
    fetchTransport();
  };

  const handleTriage = async (id: number, status: Incident['status']) => {
    setTriagingId(id);
    await updateIncident(id, status);
    setTriagingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Live Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Occupancy</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-black text-white">{metrics.total_occupancy.toLocaleString()}</span>
              <Users className="w-5 h-5 text-[#00df89]" />
            </div>
            <span className="text-[9px] text-[#00df89] mt-1 font-medium">83.5% capacity</span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Incidents</span>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xl font-black ${metrics.active_incidents > 0 ? 'text-[#ef4444]' : 'text-white'}`}>
                {metrics.active_incidents}
              </span>
              <AlertTriangle className={`w-5 h-5 ${metrics.active_incidents > 0 ? 'text-[#ef4444]' : 'text-gray-400'}`} />
            </div>
            <span className="text-[9px] text-gray-400 mt-1">Pending response</span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Volunteers</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-black text-white">{metrics.active_volunteers}</span>
              <CheckCircle2 className="w-5 h-5 text-[#00df89]" />
            </div>
            <span className="text-[9px] text-gray-400 mt-1">4 deployed at gates</span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Check-in Wait</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-black text-white">{metrics.avg_gate_queue_mins} mins</span>
              <BarChart2 className="w-5 h-5 text-[#00df89]" />
            </div>
            <span className="text-[9px] text-gray-400 mt-1">Across all gates</span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sustainability Index</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-black text-[#00df89]">{metrics.sustainability_score}/5</span>
              <Leaf className="w-5 h-5 text-[#00df89]" />
            </div>
            <span className="text-[9px] text-gray-400 mt-1">Waste diversion active</span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Crowd Risk State</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                <StatusBadge status={metrics.crowd_risk_level} />
              </span>
              <ShieldAlert className="w-5 h-5 text-[#f8c21b]" />
            </div>
            <span className="text-[9px] text-gray-400 mt-1">Determined by sensors</span>
          </GlassCard>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)] gap-2">
        {(['metrics', 'map', 'control_room', 'copilot'] as const).map(tab => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
              activeTab === tab
                ? 'text-[#00df89] border-[#00df89]'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab === 'metrics' ? 'Operations Control' :
             tab === 'map' ? 'Interactive Heatmap' :
             tab === 'control_room' ? 'Stadium Control Room' : 'Decision Copilot AI'}
          </button>
        ))}
      </div>

      {/* Main Area */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Incidents Board */}
          <GlassCard className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                Incident Response Dispatch Queue
              </h3>
              <span className="text-xs text-gray-400 font-medium">Real-time reports</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.05)] text-gray-400 font-bold">
                    <th className="py-2.5">Title / Description</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Severity</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 italic">No incidents active. Stadium is secure.</td>
                    </tr>
                  ) : (
                    incidents.map(inc => (
                      <tr key={inc.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-gray-800/10">
                        <td className="py-3">
                          <h4 className="font-bold text-white">{inc.title}</h4>
                          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{inc.description}</p>
                        </td>
                        <td className="py-3 text-gray-300 font-medium">{inc.location}</td>
                        <td className="py-3 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inc.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            inc.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            inc.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="py-3">
                          <StatusBadge status={inc.status} />
                        </td>
                        <td className="py-3 text-right">
                          {inc.status === 'reported' ? (
                            <button
                              onClick={() => handleTriage(inc.id, 'active')}
                              disabled={triagingId === inc.id}
                              className="px-2.5 py-1 bg-[#f8c21b] hover:bg-[#e0ad10] text-[#0b0f19] rounded text-[10px] font-bold"
                            >
                              Dispatch
                            </button>
                          ) : inc.status === 'active' ? (
                            <button
                              onClick={() => handleTriage(inc.id, 'resolved')}
                              disabled={triagingId === inc.id}
                              className="px-2.5 py-1 bg-[#00df89] hover:bg-[#00c577] text-[#0b0f19] rounded text-[10px] font-bold"
                            >
                              Resolve
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-500 italic">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Disruption Simulators */}
          <GlassCard className="lg:col-span-1 flex flex-col gap-4 border border-[rgba(255,255,255,0.08)] bg-slate-950/20">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-[#00df89]" />
              Disruption Simulator
            </h3>
            <p className="text-xs text-gray-400 leading-normal">
              Trigger simulated incident states to see how the AI routing, queue projections, and notification frameworks adapt dynamically.
            </p>
            <div className="flex flex-col gap-3 mt-2">
              <CustomButton
                variant="secondary"
                onClick={() => triggerDisruption('transport_delay')}
                className="w-full text-xs"
              >
                Simulate Bus Delay (Route 160)
              </CustomButton>

              <CustomButton
                variant="warning"
                onClick={() => triggerDisruption('gate_congestion')}
                className="w-full text-xs text-left"
              >
                Simulate Gate C Congestion
              </CustomButton>

              <CustomButton
                variant="danger"
                onClick={() => triggerDisruption('medical_critical')}
                className="w-full text-xs"
              >
                Simulate Medical Emergency (Sec 112)
              </CustomButton>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'control_room' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Match Roster Form */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)] pb-2">
              FIFA Match Controller
            </h3>
            <form onSubmit={handleUpdateMatch} className="flex flex-col gap-4">
              <div className="flex flex flex-col gap-1">
                <label className="text-xs text-gray-400 font-semibold">Select Target Match</label>
                <select
                  value={selMatchId}
                  onChange={(e) => setSelMatchId(Number(e.target.value))}
                  className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                >
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>{m.home_team} vs {m.away_team} ({m.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-semibold">Home Team</label>
                  <input
                    type="text"
                    value={matchHome}
                    onChange={(e) => setMatchHome(e.target.value)}
                    placeholder="Roster A"
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-semibold">Away Team</label>
                  <input
                    type="text"
                    value={matchAway}
                    onChange={(e) => setMatchAway(e.target.value)}
                    placeholder="Roster B"
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 font-semibold">Match State</label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value as Match['status'])}
                  className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live Now</option>
                  <option value="finished">Finished</option>
                </select>
              </div>

              <CustomButton type="submit" size="sm" className="w-full">
                Apply Roster Settings
              </CustomButton>
            </form>
          </GlassCard>

          {/* Security Gates Form */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)] pb-2">
              Security Checkpoints (Gates)
            </h3>
            <form onSubmit={handleUpdateGate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 font-semibold">Select Checkpoint</label>
                <select
                  value={selGateId}
                  onChange={(e) => setSelGateId(Number(e.target.value))}
                  className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                >
                  {gates.map(g => (
                    <option key={g.id} value={g.id}>Gate {g.name} (Wait: {g.current_queue_time_mins}m)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-semibold">Gate Status</label>
                  <select
                    value={gateStatus}
                    onChange={(e) => setGateStatus(e.target.value as Gate['status'])}
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="congested">Congested</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-semibold">Queue Wait (minutes)</label>
                  <input
                    type="number"
                    value={gateQueue}
                    onChange={(e) => setGateQueue(Number(e.target.value))}
                    min="0"
                    max="180"
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <CustomButton type="submit" size="sm" className="w-full">
                Apply Gate Settings
              </CustomButton>
            </form>
          </GlassCard>

          {/* Concessions Form */}
          <GlassCard className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.06)] pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Concessions (F&B stands)
              </h3>
              <button
                type="button"
                onClick={() => setIsNewStall(!isNewStall)}
                className="text-xs text-[#00df89] font-bold"
              >
                {isNewStall ? "Edit Existing" : "+ Add New"}
              </button>
            </div>

            <form onSubmit={handleSaveStall} className="flex flex-col gap-4">
              {!isNewStall ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-semibold">Select Concession Stand</label>
                  <select
                    value={selStallId}
                    onChange={(e) => setSelStallId(Number(e.target.value))}
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  >
                    {foodStalls.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Wait: {s.current_wait_time_mins}m)</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400 font-semibold">Stall Name</label>
                      <input
                        type="text"
                        value={newStallName}
                        onChange={(e) => setNewStallName(e.target.value)}
                        placeholder="Jersey Tacos"
                        required
                        className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400 font-semibold">Stall Type</label>
                      <input
                        type="text"
                        value={newStallType}
                        onChange={(e) => setNewStallType(e.target.value)}
                        placeholder="Halal / Beverages"
                        required
                        className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-semibold">Location / Concourse</label>
                    <input
                      type="text"
                      value={newStallLoc}
                      onChange={(e) => setNewStallLoc(e.target.value)}
                      placeholder="Concourse B, Sec 120"
                      required
                      className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-xs text-gray-400 font-semibold">Stall Status</label>
                  <select
                    value={stallStatus}
                    onChange={(e) => setStallStatus(e.target.value as FoodStall['status'])}
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-xs text-gray-400 font-semibold">Wait (mins)</label>
                  <input
                    type="number"
                    value={stallWait}
                    onChange={(e) => setStallWait(Number(e.target.value))}
                    min="0"
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-xs text-gray-400 font-semibold">Eco Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stallSust}
                    onChange={(e) => setStallSust(Number(e.target.value))}
                    min="1.0"
                    max="5.0"
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <CustomButton type="submit" size="sm" className="w-full">
                {isNewStall ? "Create Stand" : "Update Concession Stand"}
              </CustomButton>
            </form>
          </GlassCard>

          {/* Transit planner form */}
          <GlassCard className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.06)] pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Transit & Shuttles Planner
              </h3>
              <button
                type="button"
                onClick={() => setIsNewRoute(!isNewRoute)}
                className="text-xs text-[#00df89] font-bold"
              >
                {isNewRoute ? "Edit Existing" : "+ Add New"}
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="flex flex-col gap-4">
              {!isNewRoute ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-semibold">Select Route</label>
                  <select
                    value={selRouteId}
                    onChange={(e) => setSelRouteId(Number(e.target.value))}
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  >
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (Wait: {r.current_wait_time_mins}m)</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400 font-semibold">Route Name</label>
                      <input
                        type="text"
                        value={newRouteName}
                        onChange={(e) => setNewRouteName(e.target.value)}
                        placeholder="Express Bus NYC"
                        required
                        className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400 font-semibold">Type</label>
                      <select
                        value={newRouteType}
                        onChange={(e) => setNewRouteType(e.target.value as TransportRoute['type'])}
                        className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                      >
                        <option value="bus">Bus</option>
                        <option value="train">Train</option>
                        <option value="shuttle">Shuttle</option>
                        <option value="taxi">Taxi</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-semibold">Destination</label>
                    <input
                      type="text"
                      value={newRouteDest}
                      onChange={(e) => setNewRouteDest(e.target.value)}
                      placeholder="Times Square, NYC"
                      required
                      className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-semibold">Route Status</label>
                  <select
                    value={routeStatus}
                    onChange={(e) => setRouteStatus(e.target.value as TransportRoute['status'])}
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="delayed">Delayed</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-semibold">Wait Time (mins)</label>
                  <input
                    type="number"
                    value={routeWait}
                    onChange={(e) => setRouteWait(Number(e.target.value))}
                    min="0"
                    className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <CustomButton type="submit" size="sm" className="w-full">
                {isNewRoute ? "Create Transit Line" : "Update Route Status"}
              </CustomButton>
            </form>
          </GlassCard>

        </div>
      )}

      {activeTab === 'map' && <InteractiveMap />}

      {activeTab === 'copilot' && (
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-[rgba(0,223,137,0.05)] border border-[rgba(0,223,137,0.15)] rounded-lg text-xs text-gray-300">
            Staff Decision Support: The AI assistant has access to the active incidents log and gate capacities to draft responder action plans.
          </div>
          <ChatAssistant />
        </div>
      )}
    </div>
  );
};
