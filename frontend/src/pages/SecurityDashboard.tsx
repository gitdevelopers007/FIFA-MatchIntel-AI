import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { GlassCard, StatusBadge, CustomButton } from '../components/DesignSystem';
import { InteractiveMap } from '../components/InteractiveMap';
import { ChatAssistant } from '../components/ChatAssistant';
import { Shield, AlertTriangle, Users, BookOpen } from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const { incidents, updateIncident, metrics } = useApp();
  const [activeTab, setActiveTab] = useState<'security_log' | 'map' | 'copilot'>('security_log');
  
  // Custom mock data for security posts
  const posts = [
    { id: 1, name: "Command Center East", location: "Plaza Concourse East", staff: 8, status: "active" },
    { id: 2, name: "Response Hub West", location: "Plaza Concourse West", staff: 6, status: "active" },
    { id: 3, name: "Field Level Post", location: "Tunnel 3 Gate", staff: 4, status: "active" }
  ];

  // Filter security incidents
  const securityIncidents = incidents.filter(i => i.category === 'security' || i.severity === 'critical');

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.06)] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Security Command Console</h2>
          <p className="text-xs text-gray-400">Match Security Status: **SECURE** • Gate B crowding monitored</p>
        </div>
        <StatusBadge status={metrics?.crowd_risk_level || "low"} label={`Crowd Risk: ${metrics?.crowd_risk_level || "low"}`} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)] gap-2">
        {(['security_log', 'map', 'copilot'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
              activeTab === tab
                ? 'text-[#00df89] border-[#00df89]'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab === 'security_log' ? 'Patrol & Alerts' :
             tab === 'map' ? 'Security Heatmap' : 'Security AI Copilot'}
          </button>
        ))}
      </div>

      {activeTab === 'security_log' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Security Incidents */}
          <GlassCard className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
              Active Security Alarms
            </h3>
            
            <div className="flex flex-col gap-3">
              {securityIncidents.length === 0 ? (
                <div className="py-8 text-center text-gray-500 italic">No security incidents logged. Concourses clear.</div>
              ) : (
                securityIncidents.map(inc => (
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
                          {inc.status === 'reported' ? 'Dispatch' : 'Resolve'}
                        </CustomButton>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Security Posts */}
          <GlassCard className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00df89]" />
              Staff Deployment
            </h3>
            <div className="flex flex-col gap-3">
              {posts.map(post => (
                <div key={post.id} className="p-3 rounded-lg bg-gray-800/40 border border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">{post.name}</h4>
                    <p className="text-[10px] text-gray-400">{post.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-300 font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#00df89]" /> {post.staff} Officers
                    </span>
                    <StatusBadge status={post.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Policy Checklist */}
            <div className="mt-4 p-3.5 rounded-lg bg-[#00df89]/5 border border-[#00df89]/10">
              <h4 className="text-xs font-bold text-[#00df89] flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Crowd Mitigation Manual
              </h4>
              <p className="text-[10px] text-gray-300 leading-relaxed">
                If Gate queue exceeds 25 minutes, security officers are directed to open auxiliary entrance channels and deploy volunteers to guide guests to secondary exits.
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'map' && <InteractiveMap />}

      {activeTab === 'copilot' && (
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-xs text-red-300">
            ⚠️ **Security Command Support**: AI responses will incorporate current incident alerts and crowd risks to draft deployment strategies.
          </div>
          <ChatAssistant />
        </div>
      )}
    </div>
  );
};
