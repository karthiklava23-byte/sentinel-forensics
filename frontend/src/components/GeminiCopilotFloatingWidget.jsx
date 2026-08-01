import React, { useState } from 'react';
import { Sparkles, Bot, Terminal, ChevronUp } from 'lucide-react';
import GeminiChatModal from './GeminiChatModal';

const GeminiCopilotFloatingWidget = ({ currentCaseId, currentCaseTitle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 font-mono">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-900/90 via-slate-900 to-cyan-950/90 border border-purple-500/50 hover:border-purple-400 rounded-full shadow-2xl shadow-purple-900/50 hover:shadow-purple-600/60 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>

          <div className="w-8 h-8 rounded-full bg-purple-600/80 group-hover:bg-purple-500 flex items-center justify-center text-white shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
          </div>

          <div className="text-left">
            <span className="block text-xs font-bold text-slate-100 tracking-wider flex items-center gap-1.5">
              GEMINI COPILOT <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/50">AI 2.0</span>
            </span>
            <span className="block text-[10px] text-purple-300/80">Click to summon Forensic AI</span>
          </div>
        </button>
      </div>

      {/* Gemini AI Chat Modal */}
      <GeminiChatModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        caseId={currentCaseId}
        caseTitle={currentCaseTitle}
      />
    </>
  );
};

export default GeminiCopilotFloatingWidget;
