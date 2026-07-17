export default function AssetTable({ assets, onRefresh }) {
  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50">
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Asset Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Tag</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Cost</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Location</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className="hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <td className="px-6 py-4 text-sm text-slate-200">{asset.asset_name}</td>
              <td className="px-6 py-4 text-sm font-mono text-teal-400">{asset.asset_tag}</td>
              <td className="px-6 py-4 text-sm text-slate-400">${asset.purchase_cost || "—"}</td>
              <td className="px-6 py-4 text-sm text-slate-400">{asset.location}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    asset.status === "available"
                      ? "bg-green-500/20 text-green-400"
                      : asset.status === "checked_out"
                      ? "bg-blue-500/20 text-blue-400"
                      : asset.status === "maintenance"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {asset.status || "unknown"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {assets.length === 0 && (
        <div className="px-6 py-8 text-center text-slate-400">
          No assets found.
        </div>
      )}
    </div>
  );
}
