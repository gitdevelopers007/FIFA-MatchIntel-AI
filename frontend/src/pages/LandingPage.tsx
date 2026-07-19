import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../contexts/useApp';
import { api } from '../services/api';
import { GlassCard, CustomButton, InputField } from '../components/DesignSystem';
import { Shield, Sparkles, UserCheck, Accessibility, Compass, ShieldAlert, Award } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setUserRole, setAccessId } = useApp();
  const [username, setUsername] = useState('');
  const [accessIdInput, setAccessIdInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('fan');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const rolesList = [
    { key: 'fan', name: 'Fan Portal', desc: 'Seat finder, concessions wait times, transit planner.' },
    { key: 'volunteer', name: 'Volunteer Copilot', desc: 'Crowd control checklist, task lists, incident reports.' },
    { key: 'security', name: 'Security Hub', desc: 'Crowd mitigation protocols, active safety alarms.' },
    { key: 'medical', name: 'Medical Station Dispatch', desc: 'AED locators, ambulance dispatch, response logs.' },
    { key: 'organizer', name: 'Operations & Organizer Dashboard', desc: 'Sustainability index, real-time uvicorn trackers, queue simulators.' }
  ];

  const getPersonaMeta = (role: string) => {
    switch (role) {
      case 'fan':
        return {
          label: 'FIFA Ticket ID',
          placeholder: 'e.g. TKT-2026-9041',
          regex: /^TKT-2026-\d{4}$/i,
          hint: 'Format: TKT-2026-XXXX (e.g. TKT-2026-9041)'
        };
      case 'volunteer':
        return {
          label: 'Volunteer Badge ID',
          placeholder: 'e.g. VOL-7704',
          regex: /^VOL-\d{4}$/i,
          hint: 'Format: VOL-XXXX (e.g. VOL-7704)'
        };
      case 'security':
        return {
          label: 'Security Clearance Badge Code',
          placeholder: 'e.g. SEC-4512',
          regex: /^SEC-\d{4}$/i,
          hint: 'Format: SEC-XXXX (e.g. SEC-4512)'
        };
      case 'medical':
        return {
          label: 'Medical License Dispatch Code',
          placeholder: 'e.g. MED-8092',
          regex: /^MED-\d{4}$/i,
          hint: 'Format: MED-XXXX (e.g. MED-8092)'
        };
      default:
        return {
          label: 'Operations Pass Code',
          placeholder: 'e.g. OPS-1234',
          regex: /^OPS-\d{4}$/i,
          hint: 'Format: OPS-XXXX (e.g. OPS-1234)'
        };
    }
  };

  const meta = useMemo(() => getPersonaMeta(selectedRole), [selectedRole]);

  useEffect(() => {
    if (!accessIdInput) {
      setValidationError(null);
      return;
    }
    if (!meta.regex.test(accessIdInput)) {
      setValidationError(`Invalid code format. Expected: ${meta.hint}`);
    } else {
      setValidationError(null);
    }
  }, [accessIdInput, meta.hint, meta.regex]);

  useEffect(() => {
    setAccessIdInput('');
    setValidationError(null);
  }, [selectedRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessIdInput) {
      setValidationError("Access ID code is required.");
      return;
    }
    if (!meta.regex.test(accessIdInput)) {
      setValidationError(`Code must match: ${meta.hint}`);
      return;
    }

    setLoading(true);
    let adjustedUsername = username || `${selectedRole}_user`;
    try {
      const user = await api.login(adjustedUsername, selectedRole, accessIdInput);
      setUserRole(user.role);
      setAccessId(user.accessId || accessIdInput);
    } catch (err) {
      console.error(err);
      setUserRole(selectedRole);
      setAccessId(accessIdInput);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col relative overflow-hidden text-gray-200">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(7,11,19,0.86),rgba(7,11,19,0.94)),url('/fifa_stadium_hero.png')] bg-cover bg-center pointer-events-none" />

      {/* Global Landing Header */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[rgba(0,223,137,0.1)] border border-[#00df89]/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,223,137,0.1)]">
            <Sparkles className="w-5 h-5 text-[#00df89]" />
          </div>
          <div>
            <span className="text-lg font-black text-white tracking-wider uppercase">FIFA MatchIntel <span className="text-[#00df89]">AI</span></span>
            <span className="text-[9px] text-gray-500 font-bold block -mt-1 tracking-widest">METLIFE Pilot</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-gray-500" /> ISO 27001</span>
          <span className="hidden sm:flex items-center gap-1"><Accessibility className="w-3.5 h-3.5 text-gray-500" /> WCAG 2.2 AA</span>
        </div>
      </header>

      {/* Main Hero & Console Split Panel */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Left Side: Product Showcase (65% width on large screen) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-[#00df89]/10 border border-[#00df89]/20 px-3 py-1.5 rounded-full text-xs font-semibold text-[#00df89] tracking-wide w-max">
            <span aria-hidden="true">FIFA</span> World Cup 2026 Operations Portal
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1] uppercase">
            Stadium Operations <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00df89] to-[#00b4d8]">
              Intelligence Suite
            </span>
          </h1>
          
          <p className="text-base text-gray-300 max-w-xl leading-relaxed">
            FIFA MatchIntel AI integrates live entrance wait-times, custom seat navigation path routing, sustainability telemetry, and secure emergency dispatcher tools into a unified console.
          </p>

          {/* Hero Image Showcase */}
          <div className="relative group overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-slate-950/60 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
            <img 
              src="/fifa_stadium_hero.png" 
              alt="MetLife Arena operations center" 
              className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] via-transparent to-transparent opacity-85" />
            
            {/* Real-time stats ticker overlay */}
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-3 text-center bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-[rgba(255,255,255,0.08)]">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Capacity</span>
                <span className="text-sm font-black text-white">82,500</span>
              </div>
              <div className="border-l border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Entrance Gates</span>
                <span className="text-sm font-black text-[#00df89]">5 Plazas</span>
              </div>
              <div className="border-l border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Eco-Concessions</span>
                <span className="text-sm font-black text-[#00df89]">100% Bio</span>
              </div>
              <div className="border-l border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Match Status</span>
                <span className="text-xs bg-[#00df89]/25 text-[#00df89] px-2 py-0.5 rounded uppercase font-bold inline-block mt-0.5">READY</span>
              </div>
            </div>
          </div>

          {/* Features highlight grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <div className="flex gap-2.5 items-start p-3 bg-slate-900/40 rounded-xl border border-[rgba(255,255,255,0.04)]">
              <div className="p-1.5 bg-[#00df89]/10 rounded-lg text-[#00df89]"><Compass className="w-4 h-4" /></div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Walkway Routing</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Seat-to-concession pathing curves</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start p-3 bg-slate-900/40 rounded-xl border border-[rgba(255,255,255,0.04)]">
              <div className="p-1.5 bg-red-500/10 rounded-lg text-red-400"><ShieldAlert className="w-4 h-4" /></div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Crisis Dispatch</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Live emergency AED telemetry</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start p-3 bg-slate-900/40 rounded-xl border border-[rgba(255,255,255,0.04)]">
              <div className="p-1.5 bg-[#00df89]/10 rounded-lg text-[#00df89]"><Award className="w-4 h-4" /></div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Green Concessions</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Eco-scores for vendor concessions</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Authentication card console (35% width on large screen) */}
        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
          <GlassCard className="max-w-md w-full border border-[rgba(255,255,255,0.08)] bg-slate-900/50 p-6 shadow-2xl">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-5 h-5 text-[#00df89]" />
                Security Gateway Access
              </h3>
              <p className="text-[11px] text-gray-400">Authenticate session credentials to launch dashboard controls</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <InputField
                id="login-name"
                label="Operator / Visitor Name"
                placeholder="e.g. Liam, SecurityOfficer_A"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1">
                <InputField
                  id="access-id"
                  label={meta.label}
                  placeholder={meta.placeholder}
                  value={accessIdInput}
                  onChange={(e) => setAccessIdInput(e.target.value)}
                  required
                  error={validationError || undefined}
                />
                <span className="text-[9px] text-gray-500 font-bold block px-1">{meta.hint}</span>
              </div>

              {/* Role Select list */}
              <div className="flex flex-col gap-2">
                <span id="persona-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Access Persona</span>
                <div className="flex flex-col gap-2 max-h-[190px] overflow-y-auto pr-1" role="radiogroup" aria-labelledby="persona-label">
                  {rolesList.map(r => (
                    <button
                      type="button"
                      key={r.key}
                      onClick={() => setSelectedRole(r.key)}
                      role="radio"
                      aria-checked={selectedRole === r.key}
                      className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                        selectedRole === r.key
                          ? 'bg-[#00df89]/10 border-[#00df89] shadow-[0_0_10px_rgba(0,223,137,0.15)] font-bold'
                          : 'bg-gray-800/40 border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)]'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{r.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{r.desc}</p>
                      </div>
                      {selectedRole === r.key && <UserCheck className="w-4 h-4 text-[#00df89]" />}
                    </button>
                  ))}
                </div>
              </div>

              <CustomButton
                type="submit"
                loading={loading}
                disabled={!!validationError || !accessIdInput}
                className="w-full mt-2"
              >
                Launch Console
              </CustomButton>
            </form>
          </GlassCard>
        </div>

      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-[rgba(255,255,255,0.05)] bg-[#04070d] py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 font-medium">
          <p>Copyright 2026 FIFA World Cup Smart Stadiums operations. FIFA MatchIntel AI. All Rights Reserved.</p>
          <p className="flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Secure socket connection - WCAG 2.2 AA - Gemini 2.5 Orchestration
          </p>
        </div>
      </footer>
    </div>
  );
};
