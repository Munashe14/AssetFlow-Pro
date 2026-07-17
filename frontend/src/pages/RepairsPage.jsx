import { useEffect, useState } from "react";
import { getRepairs, createRepair } from "../api/repair";
import { getAssets } from "../api/asset";
import { Modal, Field, inputClass } from "../components/shared";

export default function RepairsPage() {
  const [repairs,   setRepairs]   = useState([]);
  const [assets,    setAssets]    = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");

  const [form, setForm] = useState({
    asset_id:      "",
    repair_date:   "",
    issue_reported: "",
    repair_done:   "",
    repair_cost:   "",
    repaired_by:   "",
  });

  function updateForm(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function load() {
    setLoading(true);
    const [rRes, aRes] = await Promise.all([getRepairs(), getAssets()]);
    setRepairs(rRes.data);
    setAssets(aRes.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const required = ["asset_id", "repair_date", "issue_reported", "repair_done", "repair_cost", "repaired_by"];
    if (required.some(k => !form[k])) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createRepair({
        asset_id:       Number(form.asset_id),
        repair_date:    form.repair_date,
        issue_reported: form.issue_reported,
        repair_done:    form.repair_done,
        repair_cost:    Number(form.repair_cost),
        repaired_by:    form.repaired_by,
      });
      setShowForm(false);
      setForm({ asset_id: "", repair_date: "", issue_reported: "", repair_done: "", repair_cost: "", repaired_by: "" });
      load();
    } catch {
      setError("Failed to save repair record.");
    } finally {
      setSubmitting(false);
    }
  }

  function assetName(id) {
    return assets.find(a => a.id === id)?.asset_name || `Asset #${id}`;
  }

  const filtered = repairs.filter(r =>
    assetName(r.asset_id).toLowerCase().includes(search.toLowerCase()) ||
    r.repaired_by?.toLowerCase().includes(search.toLowerCase()) ||
    r.issue_reported?.toLowerCase().includes(search.toLowerCase())
  );

  // Tally total repair spend
  const totalCost = repairs.reduce((sum, r) => sum + (r.repair_cost || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Repairs</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {repairs.length} records · Total spend: <span className="text-white font-mono">${totalCost.toLocaleString()}</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + Log Repair
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by asset, technician, or issue…"
        className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 w-72 focus:outline-none focus:border-teal-500 placeholder-slate-500"
      />

      {loading ? (
        <div className="space-y-2 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded-xl" />)}</div>
      ) : (
        <div className="rounded-xl border border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/40">
                {["Asset", "Date", "Issue", "Work Done", "Repaired By", "Cost"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 text-slate-200 font-medium text-sm">{assetName(r.asset_id)}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{r.repair_date}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs max-w-35 truncate" title={r.issue_reported}>{r.issue_reported}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-40 truncate" title={r.repair_done}>{r.repair_done}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{r.repaired_by}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">${r.repair_cost?.toLocaleString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500 text-sm">No repair records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Log Repair" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <Field label="Asset *">
              <select value={form.asset_id} onChange={e => updateForm("asset_id", e.target.value)} className={inputClass}>
                <option value="">Select asset…</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.asset_name} — {a.asset_tag}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Repair Date *">
                <input type="date" value={form.repair_date} onChange={e => updateForm("repair_date", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Cost (USD) *">
                <input type="number" placeholder="0" value={form.repair_cost} onChange={e => updateForm("repair_cost", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Issue Reported *">
              <textarea rows={2} placeholder="Describe the fault or issue…" value={form.issue_reported} onChange={e => updateForm("issue_reported", e.target.value)} className={`${inputClass} resize-none`} />
            </Field>
            <Field label="Work Done *">
              <textarea rows={2} placeholder="What was repaired or replaced?" value={form.repair_done} onChange={e => updateForm("repair_done", e.target.value)} className={`${inputClass} resize-none`} />
            </Field>
            <Field label="Repaired By *">
              <input placeholder="Technician or vendor name" value={form.repaired_by} onChange={e => updateForm("repaired_by", e.target.value)} className={inputClass} />
            </Field>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-900 font-semibold text-sm py-2 rounded-lg transition-colors">
              {submitting ? "Saving…" : "Save Repair"}
            </button>
            <button onClick={() => setShowForm(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm py-2 rounded-lg border border-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
