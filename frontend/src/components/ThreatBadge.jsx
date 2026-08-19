import React from 'react';

const ThreatBadge = ({ level = 'MEDIUM', score }) => {
  const getStyle = (lvl) => {
    switch (lvl.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-[#7F1D1D]/10 text-[#7F1D1D] border-[#7F1D1D]/30 font-bold';
      case 'HIGH':
        return 'bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/30 font-bold';
      case 'MEDIUM':
        return 'bg-[#D97706]/10 text-[#B45309] border-[#D97706]/30 font-bold';
      case 'LOW':
      default:
        return 'bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/30 font-bold';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-sans rounded-full border ${getStyle(level)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span className="capitalize">{level.toLowerCase()}</span>
      {score !== undefined && <span className="font-mono text-[11px]">({score})</span>}
    </span>
  );
};

export default ThreatBadge;
