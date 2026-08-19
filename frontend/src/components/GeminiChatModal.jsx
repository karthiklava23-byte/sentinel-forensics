import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Terminal, User, Loader2, Shield } from 'lucide-react';
import { geminiAPI } from '../services/api';

const SUGGESTED_QUESTIONS = [
  "What forensic modules does this platform offer?",
  "How do I upload malware binaries (.exe/.dll/.apk) and PCAPs?",
  "Why is this email flagged as suspicious?",
  "What makes a domain or URL high risk?",
  "Explain the C2 beaconing behavior in the PCAP file.",
  "How does the Gemini Telemetry Engine perform correlation?",
  "What are the top 3 immediate incident mitigation steps?"
];

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm
        ${isUser ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' : 'bg-slate-800 border border-slate-700 text-slate-300'}`}>
        {isUser ? <User className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
      </div>
      {/* Bubble */}
      <div className={`max-w-[85%] rounded-xl px-4 py-3 text-xs font-sans leading-relaxed shadow-sm
        ${isUser
          ? 'bg-blue-600 text-white font-medium rounded-tr-none'
          : 'bg-[#1E293B] border border-slate-700 text-slate-200 rounded-tl-none'
        }`}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {msg.actions && msg.actions.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-1.5">
            <p className="text-blue-400 text-[10px] font-mono font-semibold uppercase tracking-wider">Recommended Operational Actions</p>
            {msg.actions.map((a, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-blue-400 mt-0.5">•</span>
                <span className="text-slate-300 text-[11px] font-medium">{a}</span>
              </div>
            ))}
          </div>
        )}
        <div className={`text-[9px] mt-2 font-mono ${isUser ? 'text-blue-100 text-right' : 'text-slate-400'}`}>
          {msg.timestamp}
        </div>
      </div>
    </div>
  );
};

const GeminiChatModal = ({ isOpen, onClose, caseId, caseTitle }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Sentinel Operational Assistant initialized. Ask about forensic telemetry, IOC threat indicators, PCAP packet vectors, static malware binaries, or DFIR case procedures. How can I assist your investigation?`,
      timestamp: new Date().toLocaleTimeString(),
      actions: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (questionText) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const now = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { role: 'user', content: q, timestamp: now, actions: [] }]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      const res = await geminiAPI.chat({ case_id: caseId, question: q });
      const data = res.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString(),
        actions: data.suggested_actions || [],
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sentinel Telemetry Engine is processing your query. Please confirm backend status and ensure API configurations are active.',
        timestamp: new Date().toLocaleTimeString(),
        actions: ['Verify Backend API status', 'Check system configuration'],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full sm:w-[680px] h-[85vh] sm:h-[620px] flex flex-col
        bg-[#0F172A] border border-slate-700 rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 bg-[#1E293B] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Sentinel Telemetry Intelligence</h3>
            <p className="text-[11px] text-slate-400">
              {caseTitle ? `Incident Scope: ${caseTitle}` : 'SOC Operational Forensic Analyst'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-[#1E293B] border border-slate-700 rounded-xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-slate-300 text-xs font-mono">Parsing forensic artifacts & telemetry...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Questions */}
        {showSuggestions && (
          <div className="px-4 pb-2 shrink-0">
            <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold tracking-wider mb-2">Standard Inquiries</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1 text-xs font-medium bg-[#1E293B] border border-slate-700 text-slate-300 rounded-lg hover:border-slate-500 hover:text-white transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 border-t border-slate-800 bg-[#0B0F19] shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Query forensic evidence, IOC hashes, or threat indicators..."
                className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="shrink-0 px-4 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Query</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 px-1 font-mono">
            Press Enter to send • Shift + Enter for newline
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeminiChatModal;
