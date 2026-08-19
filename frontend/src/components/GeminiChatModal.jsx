import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { geminiAPI } from '../services/api';

const SUGGESTED_QUESTIONS = [
  "What forensic modules does this platform offer?",
  "How do I upload malware binaries (.exe/.dll/.apk) and PCAPs?",
  "Why is this email flagged as suspicious?",
  "What makes a domain or URL high risk?",
  "Explain the C2 beaconing behavior in the PCAP file.",
  "How does the Gemini AI Correlation Engine work?",
  "What are the top 3 immediate mitigation steps?"
];

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-md
        ${isUser ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' : 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400'}`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      {/* Bubble */}
      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs font-sans leading-relaxed shadow-sm
        ${isUser
          ? 'bg-blue-600 text-white font-medium rounded-tr-none'
          : 'bg-[#151c2c] border border-slate-800 text-slate-200 rounded-tl-none'
        }`}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {msg.actions && msg.actions.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1.5">
            <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider">Suggested Actions</p>
            {msg.actions.map((a, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span className="text-slate-300 text-[11px] font-medium">{a}</span>
              </div>
            ))}
          </div>
        )}
        <div className={`text-[9px] mt-2 font-mono ${isUser ? 'text-blue-100 text-right' : 'text-slate-500'}`}>
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
      content: `Hello! I'm your Gemini AI Forensic Assistant. Ask me about forensic evidence, IOC threat indicators, PCAPs, malware analysis, or platform workflows. How can I assist your investigation today?`,
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
        content: 'Gemini AI is processing your request. Please ensure the backend server is active and API key is set in Admin Settings.',
        timestamp: new Date().toLocaleTimeString(),
        actions: ['Check Admin Settings API key', 'Verify backend is active'],
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full sm:w-[680px] h-[85vh] sm:h-[620px] flex flex-col
        bg-[#0c1019] border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80 bg-[#111726] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Gemini Forensic Copilot</h3>
            <p className="text-[11px] text-slate-400">
              {caseTitle ? `Case Context: ${caseTitle}` : 'Integrated DFIR AI Assistant'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
              <div className="shrink-0 w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="bg-[#151c2c] border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-slate-400 text-xs font-medium">Gemini AI analyzing telemetry...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Questions */}
        {showSuggestions && (
          <div className="px-4 pb-2 shrink-0">
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2">Suggested Inquiries</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1 text-xs font-medium bg-[#141c2b] border border-slate-800 text-slate-300 rounded-full hover:border-indigo-500/40 hover:text-indigo-300 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 border-t border-slate-800/80 bg-[#090d16] shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Gemini AI about forensic evidence, IOCs, or attack patterns..."
                className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all leading-relaxed"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 px-1">
            Press Enter to send • Shift + Enter for line break
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeminiChatModal;
