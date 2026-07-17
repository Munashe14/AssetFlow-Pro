import React from 'react'

export default function AssetTagChip({tag}) {
  return (
    <span className="font-mono text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded border border-slate-600/50 tracking-widest">
        {tag}
    </span>
  )
}
