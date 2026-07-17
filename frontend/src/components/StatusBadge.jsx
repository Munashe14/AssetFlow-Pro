import React from 'react'


const CONFIG = {
    available: {label: "Available", classes: "text-teal-400 bg-teal-500/15 border-teal-500"},
    checked_out: {label: "Checked Out", classes: "text-amber-400 bg-amber-500/15 border-amber-500"},
    maintenance: {label: "Maintenance", classes: "text-blue-400 bg-blue-500/15 border-blue-500"},
    disposed: {label: "Disposed", classes: "text-red-400 bg-red-500/15 border-red-500" },
}

export default function StatusBadge({status}) {
    const cfg = CONFIG[status] || CONFIG.available
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border-1-2 font-mono tracking-wide ${cfg.classes}`}>
        {cfg.label}
    </span>
  );
}
