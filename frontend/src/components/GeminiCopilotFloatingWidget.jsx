import React, { useState } from 'react';
import { Shield, Terminal } from 'lucide-react';
import GeminiChatModal from './GeminiChatModal';

const GeminiCopilotFloatingWidget = ({ currentCaseId, currentCaseTitle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Humanised SOC Analyst Assistant Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 font-sans">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-2.5 bg-[#0F172A] border border-slate-700 hover:border-slate-500 rounded-xl shadow-xl transition-all duration-200 text-left"
          title="Open Sentinel Forensic Analyst Assistant"
        >
          {/* Active status indicator */}
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
            <Terminal className="w-4 h-4" />
          </div>

          <div className="text-left">
            <span className="block text-xs font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              Sentinel Analyst <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 border border-slate-700 rounded font-mono font-medium">SOC v2.4</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-sans">Automated Telemetry Triage</span>
          </div>
        </button>
      </div>

      {/* Forensic Intelligence Drawer */}
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
