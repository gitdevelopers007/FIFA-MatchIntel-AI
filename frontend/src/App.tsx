import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { useApp } from './contexts/useApp';
import { LandingPage } from './pages/LandingPage';
import { FanDashboard } from './pages/FanDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { OperationsDashboard } from './pages/OperationsDashboard';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { MedicalDashboard } from './pages/MedicalDashboard';
import { Shield, Sparkles, LogOut, Sun, Moon, Eye } from 'lucide-react';

const AppContent: React.FC = () => {
  const { userRole, setUserRole, theme, setTheme, accessId } = useApp();

  // If user role is not logged in, render the LandingPage
  if (!userRole) {
    return <LandingPage />;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'fan':
        return <FanDashboard />;
      case 'volunteer':
        return <VolunteerDashboard />;
      case 'security':
        return <SecurityDashboard />;
      case 'medical':
        return <MedicalDashboard />;
      default:
        // organizer, transport, admin, etc.
        return <OperationsDashboard />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'fan': return 'Fan Guest';
      case 'volunteer': return 'Operations Volunteer';
      case 'security': return 'Security Response Officer';
      case 'medical': return 'First-Aid Medical Lead';
      case 'organizer': return 'Operations Director';
      case 'transport': return 'Transit Coordinator';
      default: return userRole;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'contrast' ? 'bg-[#000000] text-yellow-300' :
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0b0f19] text-gray-100'
    }`}>
      {/* GLOBAL HEADER */}
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00df89]/10 border border-[#00df89]/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-[#00df89]" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-wide glow-text-green">FIFA MatchIntel AI</span>
              <span className="hidden sm:inline-block ml-2 text-[9px] bg-slate-800 text-[#00df89] font-bold px-1.5 py-0.5 rounded border border-gray-700 uppercase">
                FIFA 2026
              </span>
            </div>
          </div>

          {/* Theme, Accessibility & User Info */}
          <div className="flex items-center gap-4">
            
            {/* Accessibility Profile Buttons */}
            <div className="flex items-center gap-1.5 bg-gray-800/80 px-2 py-1 rounded-lg border border-[rgba(255,255,255,0.06)]">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                title="Dark Theme"
                aria-label="Use dark theme"
                aria-pressed={theme === 'dark'}
                className={`p-1.5 rounded transition ${theme === 'dark' ? 'bg-[#00df89]/20 text-[#00df89]' : 'text-gray-400 hover:text-white'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                title="Light Theme"
                aria-label="Use light theme"
                aria-pressed={theme === 'light'}
                className={`p-1.5 rounded transition ${theme === 'light' ? 'bg-[#00df89]/20 text-[#00df89]' : 'text-gray-400 hover:text-white'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('contrast')}
                title="High Contrast (WCAG 2.2 AA)"
                aria-label="Use high contrast theme"
                aria-pressed={theme === 'contrast'}
                className={`p-1.5 rounded transition ${theme === 'contrast' ? 'bg-[#00df89]/20 text-[#00df89]' : 'text-gray-400 hover:text-white'}`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active User Card */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight capitalize">{getRoleLabel()}</span>
              <span className="text-[9px] text-[#00df89] font-bold tracking-wider">{accessId || 'Clearance Code'}</span>
            </div>

            {/* Logout Trigger */}
            <button
              type="button"
              onClick={() => { setUserRole(''); localStorage.clear(); }}
              title="Logout Session"
              aria-label="Logout session"
              className="p-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-400 transition border border-[rgba(255,255,255,0.06)] flex items-center justify-center active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* SYSTEM BROADCAST NOTIFICATION */}
      <div className="bg-[#00df89]/10 border-b border-[#00df89]/10 py-2.5 px-4 text-center text-xs text-gray-300 font-medium">
        Tournament Update: MetLife Stadium security gates are open. Spain vs Argentina Final kickoff is scheduled for Monday. Monitor crowd check-ins.
      </div>

      {/* DASHBOARD CONTENT BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderDashboard()}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-slate-950/40 py-6 text-center text-[10px] text-gray-500 font-medium">
        <p>Copyright 2026 FIFA World Cup Smart Stadiums operations. FIFA MatchIntel AI. All Rights Reserved.</p>
        <p className="mt-1 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" /> Secure socket connection - WCAG 2.2 AA - Gemini 2.5 Orchestration
        </p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
