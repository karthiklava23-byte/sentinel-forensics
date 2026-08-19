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
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5 tracking-tight">
            <FolderGit2 className="w-5 h-5 text-blue-400" />
            Investigation Cases & Incidents
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formal incident management, artifact assignments, status tracking, and executive PDF reports
          </p>
        </div>

        <button
          onClick={() => setIsCaseModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create New Incident
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="soc-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Case ID, Title, Description, or Investigator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c1019] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#182030] hover:bg-[#202b40] text-slate-200 rounded-xl border border-slate-700 font-medium transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c1019] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#0c1019] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="p-12 text-slate-400 flex flex-col items-center justify-center space-y-3">
          <Activity className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-xs font-medium">Loading Incident Database...</span>
        </div>
      ) : cases.length === 0 ? (
        <div className="soc-card p-12 text-center space-y-3">
          <p className="text-slate-400 text-sm">No investigation cases match your search filters.</p>
          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-600/20 text-xs font-medium transition-all"
          >
            Create New Incident
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="soc-card-interactive p-5 flex flex-col justify-between space-y-4 group cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-mono font-semibold text-xs">{c.case_number}</span>
                  <ThreatBadge level={c.priority} />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Category:</span>
                  <span className="text-slate-200 font-medium">{c.category}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Artifacts Attached:</span>
                  <span className="text-blue-400 font-semibold">{c.evidence_count} files</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#182133] text-slate-300 border border-slate-700 text-[10px] font-medium capitalize">
                    {c.status}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/40 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] font-mono">{c.created_at}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteCase(e, c.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Case"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white font-medium flex items-center gap-1.5 transition-all text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Case</span>
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
