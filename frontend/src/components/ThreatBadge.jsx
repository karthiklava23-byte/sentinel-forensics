import React from 'react';

const ThreatBadge = ({ level = 'MEDIUM', score }) => {
  const getStyle = (lvl) => {
    switch (lvl.toUpperCase()) {
      case 'CRITICAL':
        return 'status-pill-rose font-medium';
      case 'HIGH':
        return 'status-pill-amber font-medium';
      case 'MEDIUM':
        return 'status-pill-amber opacity-90 font-medium';
      case 'LOW':
      default:
        return 'status-pill-emerald font-medium';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-sans rounded-full border ${getStyle(level)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span className="capitalize">{level.toLowerCase()}</span>
      {score !== undefined && <span className="font-mono text-[11px]">({score})</span>}
    </span>
  );
};

export default ThreatBadge;
