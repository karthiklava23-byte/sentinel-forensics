import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Plus, Search, Filter, Trash2, Eye, Activity } from 'lucide-react';
import { casesAPI } from '../services/api';
import ThreatBadge from '../components/ThreatBadge';
import CaseModal from '../components/CaseModal';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
  }, [statusFilter, priorityFilter]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (searchQuery) params.q = searchQuery;
      const res = await casesAPI.getCases(params);
      setCases(res.data);
    } catch (err) {
      console.error("Fetch cases error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCases();
  };

  const handleDeleteCase = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this case and all associated evidence?")) return;
    try {
      await casesAPI.deleteCase(id);
      fetchCases();
    } catch (err) {
      alert("Failed to delete case");
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-cyan-400" />
            INVESTIGATION CASES & INCIDENTS
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Manage forensic cases, evidence uploads, timeline analysis and threat mitigation
          </p>
        </div>

        <button
          onClick={() => setIsCaseModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-cyber-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          CREATE INVESTIGATION CASE
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="cyber-card p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Case ID, Title, Description, or Investigator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-semibold"
          >
            SEARCH
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-4 h-4" />
            <span>FILTER:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">ALL STATUSES</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">ALL PRIORITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="p-12 font-mono text-cyan-400 flex items-center justify-center">
          <Activity className="w-6 h-6 animate-spin mr-3" />
          <span>QUERYING FORENSIC DATABASE...</span>
        </div>
      ) : cases.length === 0 ? (
        <div className="cyber-card p-12 text-center font-mono space-y-3">
          <p className="text-slate-400">NO INVESTIGATION CASES MATCH YOUR SEARCH CRITERIA</p>
          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded hover:bg-cyan-500/30"
          >
            Create New Case
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="cyber-card p-5 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-cyan-400 font-bold text-xs">{c.case_number}</span>
                  <ThreatBadge level={c.priority} />
                </div>
                <h3 className="text-sm font-mono font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>CATEGORY:</span>
                  <span className="text-slate-200 font-semibold">{c.category}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>EVIDENCE ARTIFACTS:</span>
                  <span className="text-cyan-400 font-bold">{c.evidence_count} attached</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>STATUS:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-700 font-bold text-[10px]">
                    {c.status}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-500 text-[10px]">{c.created_at}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteCase(e, c.id)}
                    className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                    title="Delete Case"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-black font-bold flex items-center gap-1 transition-all">
                    <Eye className="w-3.5 h-3.5" />
                    <span>OPEN</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onCaseCreated={(newCase) => {
          fetchCases();
          navigate(`/cases/${newCase.id}`);
        }}
      />
    </div>
  );
};

export default Cases;
