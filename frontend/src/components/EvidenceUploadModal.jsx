import React, { useState } from 'react';
import { X, Upload, Mail, Network, Globe, FileText, Bug } from 'lucide-react';
import { evidenceAPI } from '../services/api';

const EvidenceUploadModal = ({ isOpen, onClose, caseId, onEvidenceUploaded }) => {
  const [evidenceType, setEvidenceType] = useState('EMAIL');
  const [file, setFile] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('evidence_type', evidenceType);
    if (evidenceType === 'URL') {
      formData.append('url_input', urlInput);
    } else if (file) {
      formData.append('file', file);
    } else {
      setError('Please select a file or provide a URL.');
      setLoading(false);
      return;
    }

    try {
      const res = await evidenceAPI.uploadEvidence(caseId, formData);
      onEvidenceUploaded(res.data.evidence);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze & attach evidence artifact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1420] border border-cyan-500/30 rounded-xl w-full max-w-lg shadow-cyber-glow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
            <Upload className="w-5 h-5" />
            <span>UPLOAD FORENSIC EVIDENCE ARTIFACT</span>
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
            <label className="block text-slate-400 mb-2">EVIDENCE ARTIFACT MODULE</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setEvidenceType('EMAIL')}
                className={`p-2.5 rounded border flex flex-col items-center gap-1 transition-all ${
                  evidenceType === 'EMAIL'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400 shadow-cyber-glow'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span className="text-[10px]">EMAIL (.EML)</span>
              </button>

              <button
                type="button"
                onClick={() => setEvidenceType('URL')}
                className={`p-2.5 rounded border flex flex-col items-center gap-1 transition-all ${
                  evidenceType === 'URL'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400 shadow-cyber-glow'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-[10px]">URL / WEB</span>
              </button>

              <button
                type="button"
                onClick={() => setEvidenceType('PCAP')}
                className={`p-2.5 rounded border flex flex-col items-center gap-1 transition-all ${
                  evidenceType === 'PCAP'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400 shadow-cyber-glow'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Network className="w-4 h-4" />
                <span className="text-[10px]">PCAP</span>
              </button>

              <button
                type="button"
                onClick={() => setEvidenceType('MALWARE')}
                className={`p-2.5 rounded border flex flex-col items-center gap-1 transition-all ${
                  evidenceType === 'MALWARE'
                    ? 'bg-red-950/80 border-red-500 text-red-400 shadow-cyber-glow'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Bug className="w-4 h-4" />
                <span className="text-[10px]">MALWARE</span>
              </button>
            </div>
          </div>

          {evidenceType === 'URL' ? (
            <div>
              <label className="block text-slate-400 mb-1">SUSPICIOUS URL / PHISHING DOMAIN</label>
              <input
                type="url"
                required
                placeholder="https://login.auth-secure-update.xyz/login"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-400 mb-1">SELECT FORENSIC FILE</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-400 hover:file:bg-cyan-900"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Supported: {
                  evidenceType === 'EMAIL' ? '.eml, email raw' :
                  evidenceType === 'MALWARE' ? '.exe, .dll, .apk, .bin, .sys' :
                  '.pcap, .pcapng, network capture log'
                }
              </p>
            </div>
          )}

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
              {loading ? 'ANALYZING & PARSING...' : 'PARSE & ATTACH EVIDENCE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvidenceUploadModal;
