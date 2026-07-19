import React, { useState } from 'react';
import { useApp } from '../contexts/useApp';
import * as Types from '../types';
import { GlassCard, CustomButton, InputField } from '../components/DesignSystem';
import { InteractiveMap } from '../components/InteractiveMap';
import { ChatAssistant } from '../components/ChatAssistant';
import { CheckSquare, MessageSquarePlus, Megaphone, Check, Users } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  category: 'crowd' | 'safety' | 'cleanup' | 'info';
  completed: boolean;
}

export const VolunteerDashboard: React.FC = () => {
  const { reportIncident, notifications, metrics } = useApp();
  const [activeTab, setActiveTab] = useState<'checklist' | 'map' | 'copilot'>('checklist');
  
  // Local task list
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Verify wheelchair accessibility ramp C is clear of obstructions", category: 'safety', completed: false },
    { id: 2, text: "Distribute translated match brochures at Gate A (Verizon)", category: 'info', completed: true },
    { id: 3, text: "Monitor and report bathroom wait times at Section 102 concourse", category: 'crowd', completed: false },
    { id: 4, text: "Report trash overflow next to Jersey Burgers, Section 112", category: 'cleanup', completed: false }
  ]);

  // Form states for Incident reporting
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<'crowd' | 'medical' | 'security' | 'maintenance' | 'general'>('crowd');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [loc, setLoc] = useState('');
  const [reporting, setReporting] = useState(false);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !loc.trim()) return;
    setReporting(true);
    await reportIncident(title, desc, category, severity, loc);
    
    // Clear form
    setTitle('');
    setDesc('');
    setLoc('');
    setReporting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.06)] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Volunteer Copilot Portal</h2>
          <p className="text-xs text-gray-400">Supporting FIFA guest relationships & stadium operations safety</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Active Staff:</span>
          <span className="text-xs font-bold text-[#00df89] bg-[#00df89]/10 px-2 py-0.5 rounded border border-[#00df89]/20 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {metrics?.active_volunteers || 4} On-Duty
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)] gap-2">
        {(['checklist', 'map', 'copilot'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
              activeTab === tab
                ? 'text-[#00df89] border-[#00df89]'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab === 'checklist' ? 'My Duty Checklist' :
             tab === 'map' ? 'Assistance Map' : 'Volunteer Copilot Chat'}
          </button>
        ))}
      </div>

      {activeTab === 'checklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Duty Checklist & Bulletins */}
          <div className="flex flex-col gap-6">
            {/* Checklist */}
            <GlassCard className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#00df89]" />
                Volunteer Duty Checklist
              </h3>
              <div className="flex flex-col gap-2.5">
                {tasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                      t.completed
                        ? 'bg-gray-800/20 border-[rgba(255,255,255,0.03)] opacity-60'
                        : 'bg-gray-800/40 border-[rgba(255,255,255,0.06)] hover:border-[#00df89]/30'
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-4 h-4 rounded flex items-center justify-center border mt-0.5 transition ${
                        t.completed
                          ? 'bg-[#00df89] border-[#00df89] text-[#0b0f19]'
                          : 'border-gray-500 bg-transparent'
                      }`}
                    >
                      {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold text-white leading-tight ${t.completed ? 'line-through text-gray-500' : ''}`}>
                        {t.text}
                      </p>
                      <span className="text-[9px] bg-slate-900 text-gray-400 font-bold px-1.5 py-0.5 rounded w-max mt-1.5 block capitalize">
                        {t.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Announcements */}
            <GlassCard className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#00df89]" />
                Organizer Dispatch Bulletins
              </h3>
              <div className="flex flex-col gap-3">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-2">No active bulletins reported.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 rounded-lg bg-gray-800/30 border border-[rgba(255,255,255,0.04)] flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white">{n.title}</span>
                        <span className="text-[9px] text-[#00df89] font-medium">{new Date(n.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-400">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          {/* Column 2: Incident Reporting */}
          <GlassCard className="flex flex-col gap-4 border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-[#00df89]" />
              Log Field Incident Report
            </h3>
            
            <form onSubmit={handleReport} className="flex flex-col gap-4">
              <InputField
                label="Incident Summary"
                placeholder="e.g. Broken elevator gate, Restroom maintenance..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as Types.Incident['category'])}
                  className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded-lg p-2 text-xs text-white outline-none focus:border-[#00df89]"
                >
                  <option value="crowd">Crowd & Bottlenecks</option>
                  <option value="medical">Medical First Aid</option>
                  <option value="security">Security Alert</option>
                  <option value="maintenance">Maintenance & Concessions</option>
                  <option value="general">General / Info Desk</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSeverity(e.target.value as Types.Incident['severity'])}
                  className="bg-gray-800 border border-[rgba(255,255,255,0.1)] rounded-lg p-2 text-xs text-white outline-none focus:border-[#00df89]"
                >
                  <option value="low">Low (Standard Checklist Audit)</option>
                  <option value="medium">Medium (Volunteer Assist Needed)</option>
                  <option value="high">High (Urgent Dispatch Required)</option>
                  <option value="critical">Critical (Immediate Hazard Alert)</option>
                </select>
              </div>

              <InputField
                label="Exact Zone / Concourse"
                placeholder="e.g. Gate B Access Ramp, Sec 112 Foyer..."
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                required
              />

              <InputField
                label="Observation Notes"
                placeholder="Describe detail for command centers..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />

              <CustomButton type="submit" loading={reporting} className="w-full mt-2">
                File Report
              </CustomButton>
            </form>
          </GlassCard>
        </div>
      )}

      {activeTab === 'map' && <InteractiveMap />}

      {activeTab === 'copilot' && (
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-[rgba(0,223,137,0.05)] border border-[rgba(0,223,137,0.15)] rounded-lg text-xs text-gray-300">
            💡 **Volunteer Policy Support**: Ask this copilot for crowd marshalling rules, sustainability indices, or fast walk route guidelines.
          </div>
          <ChatAssistant />
        </div>
      )}
    </div>
  );
};
