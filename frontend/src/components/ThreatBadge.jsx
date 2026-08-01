import React from 'react';

const ThreatBadge = ({ level = 'MEDIUM', score }) => {
  const getStyle = (lvl) => {
    switch (lvl.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-neon-red animate-pulse';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50';
      case 'MEDIUM':
        return 'bg-yellow-950/80 text-yellow-400 border-yellow-500/50';
      case 'LOW':
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold tracking-wider border rounded-md uppercase ${getStyle(level)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {level} {score !== undefined && `(${score})`}
    </span>
  );
};

export default ThreatBadge;
