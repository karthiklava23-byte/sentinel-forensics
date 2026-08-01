import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Cpu, Bot, User, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { geminiAPI } from '../services/api';

const SUGGESTED_QUESTIONS = [
  "What services and forensic modules does this platform offer?",
  "How do I upload malware binaries (.exe/.dll/.apk) and PCAPs?",
  "Why is this email considered a phishing attempt?",
  "What makes a domain or URL suspicious?",
  "Explain the C2 beaconing behavior detected in the PCAP.",
  "How does the Gemini AI Correlation Engine work?",
  "What are the top 3 immediate mitigation steps?",
];

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs
        ${isUser ? 'bg-cyan-900/60 border border-cyan-600/40' : 'bg-purple-900/60 border border-purple-600/40'}`}>
        {isUser ? <User className="w-4 h-4 text-cyan-400" /> : <Bot className="w-4 h-4 text-purple-400" />}
      </div>
      {/* Bubble */}
      <div className={`max-w-[80%] rounded-xl px-4 py-3 text-xs font-mono leading-relaxed
        ${isUser
          ? 'bg-cyan-950/60 border border-cyan-800/40 text-cyan-100 rounded-tr-none'
          : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-none'
        }`}>
        {msg.content}
        {msg.actions && msg.actions.length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-700/60 space-y-1">
            <p className="text-purple-400 text-[10px] uppercase tracking-wider mb-1">Suggested Actions</p>
            {msg.actions.map((a, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-purple-400 mt-0.5">•</span>
                <span className="text-slate-300 text-[11px]">{a}</span>
              </div>
            ))}
          </div>
        )}
        <div className={`text-[9px] mt-2 ${isUser ? 'text-cyan-600 text-right' : 'text-slate-500'}`}>
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
      content: `Hello! I'm your **Gemini AI Investigation Assistant**. Ask me about **forensic evidence, attack timelines, IOC indicators**, or **how to use any platform service or module** (Email, URL, PCAP, Malware, Threat Intel). How can I assist your DFIR investigation today?`,
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
        content: 'Gemini AI is processing your request. Please ensure the backend is running and your API key is configured in Admin Settings for live AI responses.',
        timestamp: new Date().toLocaleTimeString(),
        actions: ['Check API key in Admin Settings', 'Verify backend is running on port 8000'],
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full sm:w-[680px] h-[85vh] sm:h-[600px] flex flex-col
        bg-[#0b0f19] border border-purple-900/50 rounded-t-2xl sm:rounded-2xl shadow-2xl
        shadow-purple-900/30 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80
          bg-gradient-to-r from-purple-950/60 via-[#0b0f19] to-cyan-950/40 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600
            flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm font-mono">Gemini AI Investigation Assistant</h3>
            <p className="text-[10px] text-purple-400 font-mono">
              {caseTitle ? `Case: ${caseTitle}` : 'DFIR Intelligence Engine — Powered by Google Gemini AI'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-purple-900/60 border border-purple-600/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-slate-400 text-xs font-mono">Gemini AI analyzing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Questions */}
        {showSuggestions && (
          <div className="px-4 pb-2 shrink-0">
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-2">Suggested Questions</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="px-2.5 py-1 text-[10px] font-mono bg-slate-800/60 border border-slate-700/50
                    text-slate-300 rounded-lg hover:border-purple-600/50 hover:text-purple-300 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 border-t border-slate-800/80 bg-[#080b11]/60 shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Gemini AI about the forensic evidence, IOCs, attack patterns, or mitigation steps..."
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5
                  text-xs font-mono text-slate-200 placeholder-slate-500 resize-none focus:outline-none
                  focus:border-purple-600/60 focus:ring-1 focus:ring-purple-600/30 transition-all leading-relaxed"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600
                flex items-center justify-center shadow-lg transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:from-purple-500 hover:to-cyan-500 hover:shadow-purple-700/40"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[9px] text-slate-600 font-mono mt-1.5 px-1">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeminiChatModal;
