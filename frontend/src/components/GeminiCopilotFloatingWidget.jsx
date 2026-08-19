import React, { useState } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import GeminiChatModal from './GeminiChatModal';

const GeminiCopilotFloatingWidget = ({ currentCaseId, currentCaseTitle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Copilot Assistant Launcher */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 font-sans">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3 bg-[#111726]/95 backdrop-blur-md border border-indigo-500/30 hover:border-indigo-400 rounded-full shadow-2xl shadow-indigo-950/60 hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          {/* Live indicator dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <div className="text-left">
            <span className="block text-xs font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              Gemini Copilot <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-medium">AI 2.0</span>
            </span>
            <span className="block text-[11px] text-slate-400">Forensic Assistant</span>
          </div>
        </button>
      </div>

      {/* Gemini AI Chat Drawer */}
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
