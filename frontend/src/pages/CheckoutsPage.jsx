import { useEffect, useState } from "react";
import { getCheckouts, returnAsset } from "../api/checkout";
import StatusBadge  from "../components/StatusBadge";
import { Modal, Field, inputClass } from "../components/shared";

export default function CheckoutsPage() {
  const [checkouts, setCheckouts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all"); // "all" | "checked_out" | "returned" | "overdue"

  async function load() {
    setLoading(true);
    const res = await getCheckouts();
    setCheckouts(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function isOverdue(checkout) {
    if (checkout.status !== "checked_out") return false;
    return checkout.due_date && new Date(checkout.due_date) < new Date();
  }

  async function handleReturn(checkout) {
    if (!window.confirm(`Return asset #${checkout.asset_id}?`)) return;
    await returnAsset(checkout.id, { notes: "" });
    load();
  }

  const filtered = checkouts.filter(c => {
    if (filter === "overdue")     return isOverdue(c);
    if (filter === "all")         return true;
    return c.status === filter;
  });

  const overdueCount = checkouts.filter(isOverdue).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Checkouts</h1>
          <p className="text-slate-400 text-sm mt-0.5">{checkouts.length} total records</p>
        </div>
        {overdueCount > 0 && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-sm text-red-400 font-medium">{overdueCount} overdue</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "checked_out", "returned", "overdue"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="rounded-xl border border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/40">
                {["Asset ID", "Employee ID", "Checkout Date", "Due Date", "Return Date", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const overdue = isOverdue(c);
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-slate-800/60 transition-colors ${
                      overdue ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-slate-800/30"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-300 text-xs">#{c.asset_id}</td>
                    <td className="px-4 py-3 text-slate-300">#{c.employee_id ?? c.employee_name ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{c.checkout_date}</td>
                    <td className={`px-4 py-3 text-xs font-mono ${overdue ? "text-red-400 font-semibold" : "text-slate-400"}`}>
                      {c.due_date}
                      {overdue && <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">OVERDUE</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{c.return_date || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {c.status === "checked_out" && (
                        <button
                          onClick={() => handleReturn(c)}
                          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          Return →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500 text-sm">No records match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded-xl" />)}
    </div>
  );
}