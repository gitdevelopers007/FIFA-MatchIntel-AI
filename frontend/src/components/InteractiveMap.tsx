import React, { useState } from 'react';
import { useApp } from '../contexts/useApp';
import { GlassCard } from './DesignSystem';
import { Compass, HelpCircle, Shield } from 'lucide-react';

interface PointOfInterest {
  id: string;
  name: string;
  type: 'gate' | 'food' | 'medical' | 'toilet' | 'accessibility';
  x: number;
  y: number;
  details: string;
  wait_time?: number;
}

export const InteractiveMap: React.FC = () => {
  const { gates, foodStalls, userRole, metrics, userGate, seatSection } = useApp();
  const [selectedPoint, setSelectedPoint] = useState<PointOfInterest | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [navigationRoute, setNavigationRoute] = useState<string | null>(null);

  // Find gate coordinate
  const gateName = userGate?.toLowerCase() || '';
  let gateX = 400, gateY = 50; // Gate A default
  if (gateName.includes('b')) { gateX = 720; gateY = 300; }
  else if (gateName.includes('c')) { gateX = 400; gateY = 550; }
  else if (gateName.includes('d')) { gateX = 80; gateY = 300; }

  // Find section coordinate
  const secName = seatSection?.toLowerCase() || '';
  let secX = 400, secY = 150; // Section 100 default
  if (secName.includes('110')) { secX = 580; secY = 300; }
  else if (secName.includes('120')) { secX = 400; secY = 450; }
  else if (secName.includes('130')) { secX = 220; secY = 300; }

  // Dynamically yield POIs list according to logged in user role
  const getRolePois = (): PointOfInterest[] => {
    switch (userRole) {
      case 'security':
        return [
          { id: 'sec-command', name: 'Command HQ East', type: 'medical', x: 550, y: 150, details: 'Main Security HQ. Officers stationed: 8. Cameras online.' },
          { id: 'sec-west', name: 'Response Hub West', type: 'medical', x: 250, y: 250, details: 'West Patrol Unit. Officers stationed: 6. Fast response.' },
          { id: 'gate-c-risk', name: 'Gate C Tunnel (Critical)', type: 'gate', x: 400, y: 550, details: 'Sensor alert: Heavy congestion. Dispatching backup patrol squad.' },
          { id: 'gate-a-risk', name: 'Gate A (North Checkpoint)', type: 'gate', x: 400, y: 50, details: 'North patrol beat. Status: Normal.' }
        ];
      case 'medical':
        return [
          { id: 'med-north-hub', name: 'Clinic North Room', type: 'medical', x: 550, y: 220, details: 'Level 1, Sec 117. AED online. Doctors: 3.' },
          { id: 'med-south-hub', name: 'Clinic South Room', type: 'medical', x: 250, y: 380, details: 'Level 2, Sec 230. AED online. Doctors: 2.' },
          { id: 'med-center', name: 'Main Medical Center', type: 'medical', x: 400, y: 180, details: 'Level 1, near Entrance. Trauma unit and ambulances.' },
          { id: 'aed-gate-b', name: 'Concourse B AED Unit', type: 'accessibility', x: 650, y: 300, details: 'AED wall-mount box 4B. Operational.' }
        ];
      case 'volunteer':
        return [
          { id: 'vol-desk-1', name: 'Guest Info Desk North', type: 'food', x: 400, y: 110, details: 'Lost & Found collection point. Volunteers active: 2.' },
          { id: 'vol-desk-2', name: 'Wheelchair Foyer Center', type: 'accessibility', x: 300, y: 280, details: 'Priority transit coordination center.' },
          { id: 'vol-lounge', name: 'Volunteer Lounge East', type: 'food', x: 600, y: 380, details: 'Check-in scanner & meal box distribution.' }
        ];
      case 'organizer':
      case 'transport':
        return [
          { id: 'trans-train', name: 'Secaucus Express Platform', type: 'accessibility', x: 720, y: 300, details: 'Train platform. High capacity. Schedule: Normal.' },
          { id: 'trans-shuttle', name: 'Meadowlands Shuttle Terminal', type: 'accessibility', x: 80, y: 300, details: 'Off-site Lot 1 Shuttle terminal. Delays: None.' },
          { id: 'parking-gold', name: 'Gold Parking Lot A', type: 'gate', x: 400, y: 50, details: 'Occupancy: 82%. Pricing: $45. VIP check-in.' }
        ];
      default:
        // Fan
        return [
          { id: 'gate-a', name: 'Gate A (Verizon)', type: 'gate', x: 400, y: 50, details: 'North Plaza Gate. Main Entry.', wait_time: gates.find(g => g.name.includes('A'))?.current_queue_time_mins || 5 },
          { id: 'gate-b', name: 'Gate B (Hampton)', type: 'gate', x: 720, y: 300, details: 'East Entrance. Close to Bus terminal.', wait_time: gates.find(g => g.name.includes('B'))?.current_queue_time_mins || 12 },
          { id: 'gate-c', name: 'Gate C (Pepsi)', type: 'gate', x: 400, y: 550, details: 'South Ramp. Heavy traffic.', wait_time: gates.find(g => g.name.includes('C'))?.current_queue_time_mins || 28 },
          { id: 'gate-d', name: 'Gate D (SAP)', type: 'gate', x: 80, y: 300, details: 'West Entrance. Close to Shuttles.', wait_time: gates.find(g => g.name.includes('D'))?.current_queue_time_mins || 8 },
          { id: 'food-burgers', name: 'Jersey Burgers', type: 'food', x: 490, y: 190, details: 'Concourse A, Sec 112. Best Jersey beef.', wait_time: foodStalls.find(s => s.name.includes('Burger'))?.current_wait_time_mins || 15 },
          { id: 'food-greens', name: 'Garden State Greens', type: 'food', x: 310, y: 190, details: 'Concourse B, Sec 124. Vegan & local wraps.', wait_time: foodStalls.find(s => s.name.includes('Greens'))?.current_wait_time_mins || 4 },
          { id: 'food-tacos', name: 'Liberty Tacos', type: 'food', x: 310, y: 410, details: 'Concourse C, Sec 208. Halal tacos.', wait_time: foodStalls.find(s => s.name.includes('Taco'))?.current_wait_time_mins || 18 },
          { id: 'med-north', name: 'First Aid North', type: 'medical', x: 550, y: 220, details: 'Level 1, Sec 117. AED and paramedic unit.' },
          { id: 'med-south', name: 'First Aid South', type: 'medical', x: 250, y: 380, details: 'Level 2, Sec 230. AED and first aid kits.' },
          { id: 'acc-elevator', name: 'ADA South Elevator', type: 'accessibility', x: 250, y: 250, details: 'Southwest Elevator Suite. Free priority access.' },
          { id: 'acc-ramp', name: 'North ADA Ramp', type: 'accessibility', x: 550, y: 140, details: 'Verizon Gate access ramp. Grade 1:12 compliant.' },
        ];
    }
  };

  const pois = getRolePois();
  const filteredPois = activeFilter === 'all' ? pois : pois.filter(p => p.type === activeFilter);

  const getFilterLabels = () => {
    switch (userRole) {
      case 'security':
        return [
          { key: 'all', label: 'All Markers' },
          { key: 'gate', label: 'Gates Patrol' },
          { key: 'medical', label: 'Command Hubs' }
        ];
      case 'medical':
        return [
          { key: 'all', label: 'All Units' },
          { key: 'medical', label: 'Clinics' },
          { key: 'accessibility', label: 'AED Boxes' }
        ];
      case 'volunteer':
        return [
          { key: 'all', label: 'All Desks' },
          { key: 'food', label: 'Lost & Found' },
          { key: 'accessibility', label: 'Assistance' }
        ];
      case 'organizer':
      case 'transport':
        return [
          { key: 'all', label: 'All Transit' },
          { key: 'gate', label: 'Parking Lots' },
          { key: 'accessibility', label: 'Terminals' }
        ];
      default:
        return [
          { key: 'all', label: 'All Markers' },
          { key: 'gate', label: 'Gates' },
          { key: 'food', label: 'Food' },
          { key: 'medical', label: 'Medical' },
          { key: 'accessibility', label: 'Accessibility' }
        ];
    }
  };

  const handlePointClick = (poi: PointOfInterest) => {
    setSelectedPoint(poi);
    if (poi.type !== 'gate') {
      setNavigationRoute(poi.id);
    } else {
      setNavigationRoute(null);
    }
  };

  const getCrowdLevelColor = (zone: string) => {
    let gateStatus = 'open';
    if (zone === 'north') {
      gateStatus = gates.find(g => g.name.toLowerCase().includes('a'))?.status || 'open';
    } else if (zone === 'east') {
      gateStatus = gates.find(g => g.name.toLowerCase().includes('b'))?.status || 'open';
    } else if (zone === 'south') {
      gateStatus = gates.find(g => g.name.toLowerCase().includes('c'))?.status || 'open';
    } else if (zone === 'west') {
      gateStatus = gates.find(g => g.name.toLowerCase().includes('d'))?.status || 'open';
    }

    if (gateStatus === 'congested') return 'rgba(239, 68, 68, 0.4)';
    if (gateStatus === 'closed') return 'rgba(148, 163, 184, 0.5)';
    return 'rgba(0, 223, 137, 0.15)';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
      {/* Map Control Panel */}
      <GlassCard className="lg:col-span-1 flex flex-col gap-5">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#00df89]" />
            Stadium Finder
          </h3>
          <p className="text-xs text-gray-400">Interactive live layout of MetLife Stadium</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Map Overlays</label>
          <div className="grid grid-cols-2 gap-2">
            {getFilterLabels().map(f => (
              <button
                key={f.key}
                onClick={() => { setActiveFilter(f.key); setSelectedPoint(null); setNavigationRoute(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all duration-300 ${
                  activeFilter === f.key
                    ? 'bg-[#00df89] text-[#0b0f19] border-[#00df89] shadow-[0_0_10px_rgba(0, 223, 137, 0.25)] font-bold'
                    : 'bg-[rgba(255,255,255,0.05)] text-gray-300 border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected POI Details */}
        {selectedPoint ? (
          <div className="mt-4 p-4 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{selectedPoint.type}</span>
              <h4 className="text-sm font-bold text-white">{selectedPoint.name}</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{selectedPoint.details}</p>
            {selectedPoint.wait_time !== undefined && (
              <div className="flex justify-between items-center bg-[#0b0f19] p-2 rounded border border-[rgba(255,255,255,0.04)]">
                <span className="text-xs text-gray-400">Queue Wait:</span>
                <span className="text-xs font-bold text-[#00df89]">{selectedPoint.wait_time} mins</span>
              </div>
            )}
            <div className="flex gap-2 mt-1">
              {userRole === 'fan' && selectedPoint.type !== 'gate' && (
                <button
                  onClick={() => setNavigationRoute(selectedPoint.id)}
                  className="flex-1 py-1.5 bg-[#00df89] text-[#0b0f19] rounded-md text-xs font-bold hover:bg-[#00c577] transition-all"
                >
                  Route from Seat
                </button>
              )}
              {userRole !== 'fan' && (
                <button
                  onClick={() => setNavigationRoute(selectedPoint.id)}
                  className="flex-1 py-1.5 bg-red-500 text-white rounded-md text-xs font-bold hover:bg-red-600 transition-all"
                >
                  Dispatch Line
                </button>
              )}
              <button
                onClick={() => { setSelectedPoint(null); setNavigationRoute(null); }}
                className="py-1.5 px-3 bg-gray-800 text-gray-300 rounded-md text-xs font-medium hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-lg border border-dashed border-[rgba(255,255,255,0.1)] flex flex-col items-center justify-center text-center py-8">
            <HelpCircle className="w-8 h-8 text-gray-500 mb-2" />
            <p className="text-xs text-gray-400">
              {userRole === 'fan'
                ? 'Select food, medical, or gate markers to compute customized walkways.'
                : 'Select dispatch posts or incident sites to render operations pathways.'}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-auto border-t border-[rgba(255,255,255,0.08)] pt-4 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Zone Density Status</span>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[rgba(0,223,137,0.3)]" /> Optimal</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[rgba(248,194,27,0.3)]" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[rgba(239,68,68,0.5)]" /> Heavy</span>
          </div>
        </div>
      </GlassCard>

      {/* SVG Canvas Map */}
      <GlassCard className="lg:col-span-3 p-4 flex flex-col items-center justify-center relative min-h-[500px]">
        <div className="w-full h-full relative map-canvas-container flex justify-center items-center">
          <svg
            viewBox="0 0 800 600"
            className="w-full max-h-[520px] select-none cursor-grab"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background field area */}
            <rect width="800" height="600" fill="#0f172a" rx="12" />
            
            {/* Concentric Seating Tiers */}
            <ellipse cx="400" cy="300" rx="350" ry="250" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <ellipse cx="400" cy="300" rx="280" ry="200" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <ellipse cx="400" cy="300" rx="200" ry="140" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            
            {/* Heatmap zones */}
            <path d="M 280 170 A 280 200 0 0 1 520 170 L 485 210 A 200 140 0 0 0 315 210 Z" fill={getCrowdLevelColor('north')} stroke="rgba(255, 255, 255, 0.05)" />
            <path d="M 520 170 A 280 200 0 0 1 650 430 L 580 395 A 200 140 0 0 0 485 210 Z" fill={getCrowdLevelColor('east')} stroke="rgba(255, 255, 255, 0.05)" />
            <path d="M 650 430 A 280 200 0 0 1 280 430 L 315 395 A 200 140 0 0 0 580 395 Z" fill={getCrowdLevelColor('south')} stroke="rgba(255, 255, 255, 0.05)" />
            <path d="M 280 430 A 280 200 0 0 1 280 170 L 315 210 A 200 140 0 0 0 315 395 Z" fill={getCrowdLevelColor('west')} stroke="rgba(255, 255, 255, 0.05)" />

            {/* FIFA Playing Pitch */}
            <rect x="300" y="220" width="200" height="160" fill="rgba(0, 223, 137, 0.15)" stroke="rgba(0, 223, 137, 0.4)" strokeWidth="2" rx="4" />
            <line x1="400" y1="220" x2="400" y2="380" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx="400" cy="300" r="30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            
            {/* SEATING SECTORS LABELS */}
            <text x="400" y="120" fill="rgba(255,255,255,0.2)" fontSize="12" fontWeight="bold" textAnchor="middle">SEC 100</text>
            <text x="630" y="305" fill="rgba(255,255,255,0.2)" fontSize="12" fontWeight="bold" textAnchor="middle">SEC 110</text>
            <text x="400" y="490" fill="rgba(255,255,255,0.2)" fontSize="12" fontWeight="bold" textAnchor="middle">SEC 120</text>
            <text x="170" y="305" fill="rgba(255,255,255,0.2)" fontSize="12" fontWeight="bold" textAnchor="middle">SEC 130</text>

            {/* GATE-TO-SEAT PATH (Default view for fan if no POI is selected) */}
            {userRole === 'fan' && (!selectedPoint || selectedPoint.type === 'gate') && (
              <g>
                <path
                  d={`M ${gateX} ${gateY} Q ${gateX === 400 ? (gateY < 300 ? 520 : 280) : 400} ${gateY === 300 ? (gateX < 400 ? 220 : 380) : 300} ${secX} ${secY}`}
                  fill="none"
                  stroke="#00df89"
                  strokeWidth="4.5"
                  strokeDasharray="8,6"
                  opacity="0.8"
                  className="animate-[dash_2s_linear_infinite]"
                  style={{
                    filter: 'drop-shadow(0 0 5px rgba(0, 223, 137, 0.7))'
                  }}
                />
                <circle cx={secX} cy={secY} r="14" fill="#00df89" opacity="0.35" className="animate-pulse" />
                <circle cx={secX} cy={secY} r="6" fill="#00df89" stroke="#ffffff" strokeWidth="1.5" />
                <text x={secX} y={secY - 14} fill="#00df89" fontSize="9" fontWeight="black" textAnchor="middle" className="glow-text-green">
                  YOUR SEAT
                </text>
              </g>
            )}

            {/* SEAT-TO-POI DYNAMIC PATH (If fan clicks food, medical, accessibility elevator) */}
            {userRole === 'fan' && selectedPoint && selectedPoint.type !== 'gate' && (
              <g>
                <path
                  d={`M ${secX} ${secY} Q ${(secX + selectedPoint.x) / 2} ${(secY + selectedPoint.y) / 2 - 40} ${selectedPoint.x} ${selectedPoint.y}`}
                  fill="none"
                  stroke="#00df89"
                  strokeWidth="4.5"
                  strokeDasharray="8,6"
                  opacity="0.95"
                  className="animate-[dash_2s_linear_infinite]"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(0, 223, 137, 0.8))'
                  }}
                />
                {/* Seat starting node */}
                <circle cx={secX} cy={secY} r="7" fill="#00df89" stroke="#ffffff" strokeWidth="1.5" />
                <text x={secX} y={secY - 14} fill="#00df89" fontSize="9" fontWeight="black" textAnchor="middle" className="glow-text-green">
                  SEAT START
                </text>
                {/* Target POI node indicator */}
                <circle cx={selectedPoint.x} cy={selectedPoint.y} r="14" fill="#00df89" opacity="0.35" className="animate-pulse" />
              </g>
            )}

            {/* COMMAND-TO-INCIDENT DYNAMIC PATH (For operations/security/medical dispatch) */}
            {userRole !== 'fan' && navigationRoute && selectedPoint && (
              <g>
                <path
                  d={`M ${
                    userRole === 'security' ? 550 : userRole === 'medical' ? 400 : 400
                  } ${
                    userRole === 'security' ? 150 : userRole === 'medical' ? 180 : 110
                  } Q 400 300 ${selectedPoint.x} ${selectedPoint.y}`}
                  fill="none"
                  stroke={userRole === 'security' ? '#ef4444' : userRole === 'medical' ? '#ef4444' : '#f8c21b'}
                  strokeWidth="4.5"
                  strokeDasharray="8,6"
                  className="animate-[dash_2s_linear_infinite]"
                />
                <circle
                  cx={userRole === 'security' ? 550 : userRole === 'medical' ? 400 : 400}
                  cy={userRole === 'security' ? 150 : userRole === 'medical' ? 180 : 110}
                  r="6"
                  fill={userRole === 'security' ? '#ef4444' : userRole === 'medical' ? '#ef4444' : '#f8c21b'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* POI MARKERS */}
            {filteredPois.map(poi => {
              const isSelected = selectedPoint?.id === poi.id;
              
              let color = '#f3f4f6';
              if (poi.type === 'gate') color = poi.wait_time && poi.wait_time > 20 ? '#ef4444' : '#00df89';
              if (poi.type === 'food') color = '#38bdf8';
              if (poi.type === 'medical') color = '#ef4444';
              if (poi.type === 'accessibility') color = '#f8c21b';

              return (
                <g key={poi.id} className="cursor-pointer" onClick={() => handlePointClick(poi)}>
                  <circle
                    cx={poi.x}
                    cy={poi.y}
                    r={isSelected ? 16 : 10}
                    fill={color}
                    opacity={isSelected ? 0.45 : 0.2}
                    className={isSelected ? 'animate-ping' : ''}
                  />
                  <circle
                    cx={poi.x}
                    cy={poi.y}
                    r={isSelected ? 8 : 6}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={poi.x}
                    y={poi.y - 12}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="black"
                    textAnchor="middle"
                    className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                    style={{
                      fill: color,
                      fontWeight: '900'
                    }}
                  >
                    {poi.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Real-time Incident Flash Alert Indicator */}
          {userRole !== 'fan' && metrics && metrics.active_incidents > 0 && (
            <div className="absolute top-4 left-4 bg-red-600/90 text-white border border-red-500 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-bold shadow-lg animate-pulse">
              <Shield className="w-4 h-4 text-white animate-bounce" />
              {metrics.active_incidents} Active Emergency Incidents
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
