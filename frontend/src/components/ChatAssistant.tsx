import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/useApp';
import { api } from '../services/api';
import type { ChatMessage } from '../types';
import { GlassCard, Spinner } from './DesignSystem';
import { Send, Mic, Languages, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';

export const ChatAssistant: React.FC = () => {
  const { userRole, language, setLanguage, seatSection, userGate } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    "How do I get to washroom from Section 112?",
    "Where is the nearest Medical AED?",
    "What is the wait time at Gate C?",
    "Show me sustainable food options."
  ]);
  const [voiceActive, setVoiceActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load welcome message on mount
  useEffect(() => {
    let greeting = `Hello! I am FIFA MatchIntel AI. How can I assist you with navigation, transportation, accessibility, queue metrics, or stadium operations today?`;
    if (userRole === 'security') {
      greeting = `SECURITY HUB ACTIVE. Threat Assessment and Crowd Mitigation copilot initialized. How can I assist you with safety alarms, deployment checks, or crowd risks?`;
    } else if (userRole === 'medical') {
      greeting = `MEDICAL DISPATCH COPILOT. Station clinic statuses and AED coordinates online. How can I help you route paramedic teams or view guidelines?`;
    } else if (userRole === 'volunteer') {
      greeting = `VOLUNTEER COPILOT ONLINE. Ask for restroom navigation steps, sustainable food options, or how to report stadium issues.`;
    } else if (userRole === 'organizer') {
      greeting = `TOURNAMENT DIRECTOR SUPPORT. Metrics, sustainability scores, and queue simulator metrics active. What reports can I compile?`;
    }

    setMessages([
      {
        role: 'system',
        content: `Connected as: **${userRole.toUpperCase()}** Mode. Seating context: **${seatSection}**. Entrance Gate: **${userGate}**. Language: **${language.toUpperCase()}**.`
      },
      {
        role: 'assistant',
        content: greeting
      }
    ]);
  }, [userRole, seatSection, userGate, language]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Collect message history, exclude system instructions to save token context
      const chatHistory = messages.filter(m => m.role !== 'system');
      
      const result = await api.chat(
        textToSend,
        chatHistory,
        userRole,
        language,
        seatSection,
        userGate
      );

      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
      if (result.suggested_actions && result.suggested_actions.length > 0) {
        setSuggestedActions(result.suggested_actions);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Failed to fetch response. Please verify that uvicorn is running or check network."
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Simulate Mic voice input
  const handleVoiceSimulate = () => {
    setVoiceActive(true);
    const mockSpeeches = [
      "Find fastest route to Gate A from Section 112",
      "Is Lot B parking full?",
      "Medical emergency near gate C",
      "What sustainable vegan food is nearby?"
    ];
    const phrase = mockSpeeches[Math.floor(Math.random() * mockSpeeches.length)];
    
    setTimeout(() => {
      setInput(phrase);
      setVoiceActive(false);
    }, 1500);
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: "History cleared. How can I help you today?"
      }
    ]);
    setSuggestedActions([
      "Check gate queues",
      "Transit schedules",
      "Accessibility lifts",
      "Vegan food stalls"
    ]);
  };

  return (
    <GlassCard className="flex flex-col h-[520px] max-w-4xl mx-auto border border-[rgba(255,255,255,0.08)] bg-slate-900/60">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00df89] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00df89]"></span>
          </span>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">MatchIntel Copilot</h3>
            <p className="text-[10px] text-gray-400 capitalize">Role: {userRole} • Context: {seatSection}</p>
          </div>
        </div>
        
        {/* Language & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-800/80 px-2 py-1 rounded-lg border border-[rgba(255,255,255,0.06)]">
            <Languages className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs text-white border-none outline-none font-semibold cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">EN</option>
              <option value="es" className="bg-slate-900 text-white">ES</option>
              <option value="fr" className="bg-slate-900 text-white">FR</option>
              <option value="ar" className="bg-slate-900 text-white">AR</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleClear}
            title="Clear Chat"
            aria-label="Clear chat history"
            className="p-1.5 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg text-gray-400 hover:text-white transition border border-[rgba(255,255,255,0.06)]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto py-4 pr-2 flex flex-col gap-4">
        {messages.map((m, idx) => {
          if (m.role === 'system') {
            return (
              <div key={idx} className="self-center bg-gray-800/50 border border-gray-700 text-gray-400 px-3 py-1 rounded text-[10px] tracking-wide uppercase font-medium">
                {m.content}
              </div>
            );
          }
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col max-w-[80%] gap-1.5 ${
                isUser ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed border ${
                  isUser
                    ? 'bg-[#00df89]/10 text-white border-[#00df89]/20 rounded-tr-none'
                    : 'bg-slate-800/80 text-gray-100 border-[rgba(255,255,255,0.05)] rounded-tl-none'
                }`}
              >
                {m.content}
              </div>
              
              {/* Message Controls for Assistant replies */}
              {!isUser && (
                <div className="flex items-center gap-2 pl-2">
                  <button type="button" aria-label="Mark response helpful" className="text-gray-500 hover:text-[#00df89] transition">
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button type="button" aria-label="Mark response unhelpful" className="text-gray-500 hover:text-[#ef4444] transition">
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                  <span className="text-[9px] text-gray-600">Decision Verified</span>
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="self-start flex items-center gap-2 bg-slate-800/40 p-3 rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <Spinner size="sm" />
            <span className="text-xs text-gray-400">FIFA MatchIntel AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions chips */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto whitespace-nowrap scrollbar-none border-t border-[rgba(255,255,255,0.06)]">
        {suggestedActions.map((act, i) => (
          <button
            type="button"
            key={i}
            onClick={() => handleSend(act)}
            aria-label={`Ask: ${act}`}
            className="px-3 py-1.5 bg-gray-800/60 hover:bg-gray-700/80 rounded-full border border-[rgba(255,255,255,0.06)] text-[11px] font-semibold text-[#00df89] hover:text-white transition duration-300 active:scale-95"
          >
            {act}
          </button>
        ))}
      </div>

      {/* Form Input Bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleVoiceSimulate}
          disabled={voiceActive || loading}
          className={`p-3 rounded-lg border border-[rgba(255,255,255,0.08)] flex items-center justify-center transition-all ${
            voiceActive
              ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Simulate Voice Input"
          aria-label="Simulate voice input"
        >
          <Mic className="w-4.5 h-4.5" />
        </button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          disabled={loading}
          placeholder="Ask MatchIntel Copilot..."
          aria-label="Message MatchIntel Copilot"
          className="flex-1 bg-gray-800 border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00df89] transition-all"
        />

        <button
          type="button"
          onClick={() => handleSend(input)}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="p-3 bg-[#00df89] hover:bg-[#00c577] text-[#0b0f19] rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(0,223,137,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </GlassCard>
  );
};
