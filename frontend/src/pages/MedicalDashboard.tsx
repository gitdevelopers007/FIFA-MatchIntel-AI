import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { GlassCard, StatusBadge, CustomButton } from '../components/DesignSystem';
import { InteractiveMap } from '../components/InteractiveMap';
import { ChatAssistant } from '../components/ChatAssistant';
import { Heart, Activity, PlusSquare, BookOpen } from 'lucide-react';

export const MedicalDashboard: React.FC = () => {
  const { incidents, updateIncident } = useApp();
  const [activeTab, setActiveTab] = useState<'medical_log' | 'map' | 'copilot'>('medical_log');

  const stations = [
    { id: 1, name: "First Aid North", location: "Level 1, Sec 117", staff: 3, aed: true, status: "active" },
    { id: 2, name: "First Aid South", location: "Level 2, Sec 230", staff: 2, aed: true, status: "active" },
    { id: 3, name: "Main Medical Hub", location: "Level 1, Plaza Entry", staff: 6, aed: true, status: "active" }
  ];

  const medicalIncidents = incidents.filter(i => i.category === 'medical' || i.severity === 'critical');

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.06)] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">First Aid & Medical Dispatch</h2>
          <p className="text-xs text-gray-400">Station Status: **READY** • Paramedic squads deployed</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
            <Heart className="w-3.5 h-3.5 fill-red-500" /> AED Units Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)] gap-2">
        {(['medical_log', 'map', 'copilot'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
              activeTab === tab
                ? 'text-[#00df89] border-[#00df89]'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab === 'medical_log' ? 'Medical Alerts' :
             tab === 'map' ? 'AED Map' : 'Medical AI Copilot'}
          </button>
        ))}
      </div>

      {activeTab === 'medical_log' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Medical Incidents */}
          <GlassCard className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              Active Medical Response Queue
            </h3>
            
            <div className="flex flex-col gap-3">
              {medicalIncidents.length === 0 ? (
                <div className="py-8 text-center text-gray-500 italic">No medical assistance requests active.</div>
              ) : (
                medicalIncidents.map(inc => (
                  <div key={inc.id} className="p-3.5 rounded-lg bg-gray-800/40 border border-[rgba(239,68,68,0.2)] flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-400 capitalize bg-red-950/20 px-2 py-0.5 rounded border border-red-500/20">
                          {inc.severity}
                        </span>
                        <h4 className="text-sm font-bold text-white">{inc.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{inc.description}</p>
                      <span className="text-[10px] text-gray-500 block mt-2">Location: {inc.location}</span>
                    </div>
                    <div className="flex gap-2">
                      {inc.status !== 'resolved' && (
                        <CustomButton
                          size="sm"
                          variant={inc.status === 'reported' ? 'warning' : 'primary'}
                          onClick={() => updateIncident(inc.id, inc.status === 'reported' ? 'active' : 'resolved')}
                        >
                          {inc.status === 'reported' ? 'Dispatch Care' : 'Mark Resolved'}
                        </CustomButton>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Medical Stations */}
          <GlassCard className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlusSquare className="w-5 h-5 text-[#00df89]" />
              First Aid Station Status
            </h3>
            <div className="flex flex-col gap-3">
              {stations.map(st => (
                <div key={st.id} className="p-3 rounded-lg bg-gray-800/40 border border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">{st.name}</h4>
                    <p className="text-[10px] text-gray-400">{st.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-300 font-bold flex items-center gap-1">
                      Staff: {st.staff}
                    </span>
                    <StatusBadge status={st.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Paramedic protocol handbook */}
            <div className="mt-4 p-3.5 rounded-lg bg-red-500/5 border border-red-500/10">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-3.5 h-3.5" /> AED Response Protocol
              </h4>
              <p className="text-[10px] text-gray-300 leading-relaxed">
                In cardiac dispatch calls, retrieve the nearest AED located inside the security hubs at Level 1 Section 117 or Level 2 Section 230 within 3 minutes of activation signal.
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'map' && <InteractiveMap />}

      {activeTab === 'copilot' && (
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-xs text-red-300">
            🚨 **Medical Copilot Support**: First-aid treatment guidelines and coordinates routes to active stations based on current database locations.
          </div>
          <ChatAssistant />
        </div>
      )}
    </div>
  );
};
