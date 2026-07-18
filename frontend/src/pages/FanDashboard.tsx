import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { GlassCard, StatusBadge, CustomButton, InputField } from '../components/DesignSystem';
import { InteractiveMap } from '../components/InteractiveMap';
import { ChatAssistant } from '../components/ChatAssistant';
import { Flame, Clock, MapPin, Bus, ShieldAlert, Award } from 'lucide-react';

export const FanDashboard: React.FC = () => {
  const {
    gates,
    foodStalls,
    routes,
    seatSection,
    setSeatSection,
    userGate,
    setUserGate,
    selectedMatchId,
    setSelectedMatchId,
    matches
  } = useApp();
  const [activeTab, setActiveTab] = useState<'planner' | 'map' | 'chat' | 'lost'>('planner');

  // Local state for Lost & Found submission
  const [lostType, setLostType] = useState('item'); // item or child
  const [lostDesc, setLostDesc] = useState('');
  const [lostLoc, setLostLoc] = useState('');
  const [lostReported, setLostReported] = useState(false);

  const handleReportLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostDesc.trim() || !lostLoc.trim()) return;
    setLostReported(true);
    setTimeout(() => {
      setLostDesc('');
      setLostLoc('');
      setLostReported(false);
      alert(`Report submitted successfully. Stadium Operations and Security have been notified of the lost ${lostType}.`);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* FIFA Ticket Setup Console */}
      <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.06)] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">MetLife Stadium Fan Portal</h2>
          <p className="text-xs text-gray-400">Configure your match day ticket parameters to load customized layout maps and localized AI guidance.</p>
        </div>
        
        {/* Ticket Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-lg border border-[rgba(255,255,255,0.05)]">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">1. Select Match</label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(Number(e.target.value))}
              className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded px-2 py-1 text-xs text-white outline-none font-bold"
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>{m.home_team} vs {m.away_team}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">2. Entrance Gate</label>
            <select
              value={userGate}
              onChange={(e) => setUserGate(e.target.value)}
              className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded px-2 py-1 text-xs text-white outline-none font-bold"
            >
              {gates.map(g => (
                <option key={g.id} value={`Gate ${g.name}`}>{`Gate ${g.name}`}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">3. Seat Section</label>
            <select
              value={seatSection}
              onChange={(e) => setSeatSection(e.target.value)}
              className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded px-2 py-1 text-xs text-white outline-none font-bold"
            >
              <option value="Section 100">Section 100</option>
              <option value="Section 110">Section 110</option>
              <option value="Section 120">Section 120</option>
              <option value="Section 130">Section 130</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)] gap-2 overflow-x-auto pb-0.5">
        {(['planner', 'map', 'chat', 'lost'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all relative border-b-2 -mb-[2px] ${
              activeTab === tab
                ? 'text-[#00df89] border-[#00df89]'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab === 'planner' ? 'Match Day Planner' :
             tab === 'map' ? 'Stadium Map' :
             tab === 'chat' ? 'AI Assistant' : 'Lost & Found'}
          </button>
        ))}
      </div>

      {/* Content Render based on Active Tab */}
      {activeTab === 'planner' && (
        <div className="flex flex-col gap-6">
          
          {/* Live Match Ticket Alert Banner */}
          {matches.length > 0 && (
            <div className="bg-[#00df89]/10 border border-[#00df89]/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00df89]/15 flex items-center justify-center border border-[#00df89]/20 text-[#00df89]">
                  <Award className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Your FIFA Ticket Details</h4>
                  <p className="text-xs text-gray-300">
                    🎫 Match: <strong className="text-white">{matches.find(m => m.id === selectedMatchId)?.home_team} vs {matches.find(m => m.id === selectedMatchId)?.away_team}</strong> • 
                    Seat: <strong className="text-[#00df89]">{seatSection}</strong> • 
                    Gate: <strong className="text-[#00df89]">{userGate}</strong>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-[#00df89]/25 text-[#00df89] px-2.5 py-0.5 rounded border border-[#00df89]/30 font-bold uppercase tracking-wider">
                  {matches.find(m => m.id === selectedMatchId)?.status}
                </span>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                  Kickoff: {matches.find(m => m.id === selectedMatchId)?.date_time ? new Date(matches.find(m => m.id === selectedMatchId)!.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '20:00'} EST
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Queues & Gates Monitor */}
            <GlassCard className="lg:col-span-1 flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00df89]" />
                Entrance Checkpoint Queues
              </h3>
              <div className="flex flex-col gap-3">
                {gates.map(gate => (
                  <div key={gate.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/40 border border-[rgba(255,255,255,0.04)]">
                    <div>
                      <h4 className="text-xs font-bold text-white">Gate {gate.name}</h4>
                      <span className="text-[10px] text-gray-400">Security Check-in wait</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={gate.status} />
                      <span className="text-sm font-bold text-white">{gate.current_queue_time_mins}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Concessions Finder */}
            <GlassCard className="lg:col-span-1 flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#00df89]" />
                Food Concessions Wait times
              </h3>
              <div className="flex flex-col gap-3">
                {foodStalls.map(stall => (
                  <div key={stall.id} className="flex justify-between items-start p-3 rounded-lg bg-gray-800/40 border border-[rgba(255,255,255,0.04)]">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-xs font-bold text-white">{stall.name}</h4>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {stall.location}
                      </span>
                      <span className="text-[9px] text-[#00df89] font-bold mt-1">Sustainability: {stall.sustainability_score}/5</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={stall.status} />
                      <span className="text-xs font-bold text-white">{stall.current_wait_time_mins}m wait</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Transit Departures */}
            <GlassCard className="lg:col-span-1 flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bus className="w-5 h-5 text-[#00df89]" />
                Transit Departures & Delays
              </h3>
              <div className="flex flex-col gap-3">
                {routes.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/40 border border-[rgba(255,255,255,0.04)]">
                    <div>
                      <h4 className="text-xs font-bold text-white">{r.name}</h4>
                      <span className="text-[10px] text-gray-400">To {r.destination}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={r.status} />
                      <span className="text-xs font-bold text-gray-300">Wait: {r.current_wait_time_mins}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'map' && <InteractiveMap />}

      {activeTab === 'chat' && (
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-[rgba(0,223,137,0.05)] border border-[rgba(0,223,137,0.15)] rounded-lg text-xs text-gray-300">
            💡 **Tip**: Switch language at the top right of the Chat assistant to automatically translate responses into Spanish, French, or Arabic!
          </div>
          <ChatAssistant />
        </div>
      )}

      {activeTab === 'lost' && (
        <div className="max-w-xl mx-auto w-full">
          <GlassCard className="flex flex-col gap-5 border border-red-500/20 bg-red-950/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Lost Child / Missing Item Reporting</h3>
                <p className="text-xs text-gray-400">Logged reports are immediately dispatched to Volunteer Checkpoints and Security Teams</p>
              </div>
            </div>

            <form onSubmit={handleReportLost} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Report Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLostType('child')}
                    className={`p-3 rounded-lg border text-center font-bold text-xs capitalize transition-all ${
                      lostType === 'child'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-gray-800 border-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white'
                    }`}
                  >
                    Missing Child / Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setLostType('item')}
                    className={`p-3 rounded-lg border text-center font-bold text-xs capitalize transition-all ${
                      lostType === 'item'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-gray-800 border-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white'
                    }`}
                  >
                    Lost Property
                  </button>
                </div>
              </div>

              <InputField
                label="Description"
                placeholder={lostType === 'child' ? "Child name, age, clothes worn, photo link..." : "Phone, wallet, keys, color, brand..."}
                value={lostDesc}
                onChange={(e) => setLostDesc(e.target.value)}
                required
              />

              <InputField
                label="Last Seen Location"
                placeholder="e.g. Near Concourse B Jersey Burgers, Section 124, restroom foyer..."
                value={lostLoc}
                onChange={(e) => setLostLoc(e.target.value)}
                required
              />

              <CustomButton type="submit" variant="danger" loading={lostReported} className="w-full mt-2">
                Submit Alert
              </CustomButton>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
