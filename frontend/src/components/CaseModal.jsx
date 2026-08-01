import React, { useState } from 'react';
import { X, ShieldAlert, Plus } from 'lucide-react';
import { casesAPI } from '../services/api';

const CaseModal = ({ isOpen, onClose, onCaseCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Phishing & Ransomware');
  const [priority, setPriority] = useState('HIGH');
  const [assignedTo, setAssignedTo] = useState('Lead DFIR Specialist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await casesAPI.createCase({
        title,
        description,
        category,
        priority,
        assigned_to: assignedTo,
      });
      onCaseCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1420] border border-cyan-500/30 rounded-xl w-full max-w-lg shadow-cyber-glow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
            <Plus className="w-5 h-5" />
            <span>CREATE INVESTIGATION CASE</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1">CASE TITLE / INCIDENT NAME</label>
            <input
              type="text"
              required
              placeholder="e.g. Operation Dark Web Exfiltration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">DESCRIPTION & PRELIMINARY DETAILS</label>
            <textarea
              rows={3}
              required
              placeholder="Describe suspected breach vectors, affected systems, or initial alert summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">THREAT CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Spear Phishing & C2">Spear Phishing & C2</option>
                <option value="Ransomware Outbreak">Ransomware Outbreak</option>
                <option value="Insider Threat & Exfiltration">Insider Threat & Exfiltration</option>
                <option value="Network Intrusion">Network Intrusion</option>
                <option value="Malware & Botnet">Malware & Botnet</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">PRIORITY LEVEL</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">ASSIGNED INVESTIGATOR</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-slate-400 hover:bg-slate-800"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-2 shadow-cyber-glow"
            >
              {loading ? 'INITIALIZING...' : 'CREATE CASE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseModal;
