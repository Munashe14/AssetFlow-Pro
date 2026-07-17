import { useEffect, useState } from "react";
import { getMaintenance, createMaintenance } from "../api/maintenance";
import { getAssets } from "../api/asset";
import { Modal, Field, inputClass } from "../components/shared";

const MAINTENANCE_TYPES = ["Preventive", "Corrective", "Predictive", "Inspection", "Calibration"];

export default function MaintenancePage() {
  const [records,   setRecords]   = useState([]);
  const [assets,    setAssets]    = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");

  const [form, setForm] = useState({
    asset_id:         "",
    maintenance_date: "",
    maintenance_type: "",
    description:      "",
    performed_by:     "",
    cost:             "",
  });

  function updateForm(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function load() {
    setLoading(true);
    const [mRes, aRes] = await Promise.all([getMaintenance(), getAssets()]);
    setRecords(mRes.data);
    setAssets(aRes.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const required = ["asset_id", "maintenance_date", "maintenance_type", "description", "performed_by"];
    if (required.some(k => !form[k])) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createMaintenance({
        asset_id:         Number(form.asset_id),
        maintenance_date: form.maintenance_date,
        maintenance_type: form.maintenance_type,
        description:      form.description,
        performed_by:     form.performed_by,
        cost:             form.cost ? Number(form.cost) : null,
      });
      setShowForm(false);
      setForm({ asset_id: "", maintenance_date: "", maintenance_type: "", description: "", performed_by: "", cost: "" });
      load();
    } catch {
      setError("Failed to save maintenance record.");
    } finally {
      setSubmitting(false);
    }
  }

  // Helper — look up asset name from records
  function assetName(id) {
    return assets.find(a => a.id === id)?.asset_name || `Asset #${id}`;
  }

  const filtered = records.filter(r =>
    assetName(r.asset_id).toLowerCase().includes(search.toLowerCase()) ||
    r.performed_by?.toLowerCase().includes(search.toLowerCase()) ||
    r.maintenance_type?.toLowerCase().includes(search.toLowerCase())
  );

  const typeColor = {
    Preventive:  "text-teal-400  bg-teal-500/15  border-teal-500/30",
    Corrective:  "text-amber-400 bg-amber-500/15 border-amber-500/30",
    Predictive:  "text-blue-400  bg-blue-500/15  border-blue-500/30",
    Inspection:  "text-purple-400 bg-purple-500/15 border-purple-500/30",
    Calibration: "text-slate-400 bg-slate-700/30 border-slate-600/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance</h1>
          <p className="text-slate-400 text-sm mt-0.5">{records.length} maintenance records</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + Log Maintenance
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by asset, technician, or type…"
        className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 w-72 focus:outline-none focus:border-teal-500 placeholder-slate-500"
      />

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="rounded-xl border border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/40">
                {["Asset", "Date", "Type", "Description", "Performed By", "Cost"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 text-slate-200 font-medium">{assetName(r.asset_id)}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{r.maintenance_date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${typeColor[r.maintenance_type] || typeColor.Calibration}`}>
                      {r.maintenance_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{r.description}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{r.performed_by}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{r.cost ? `$${r.cost}` : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500 text-sm">No maintenance records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Log Maintenance Record" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <Field label="Asset *">
              <select
                value={form.asset_id}
                onChange={e => updateForm("asset_id", e.target.value)}
                className={inputClass}
              >
                <option value="">Select asset…</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.asset_name} — {a.asset_tag}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date *">
                <input type="date" value={form.maintenance_date} onChange={e => updateForm("maintenance_date", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Type *">
                <select value={form.maintenance_type} onChange={e => updateForm("maintenance_type", e.target.value)} className={inputClass}>
                  <option value="">Select…</option>
                  {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Description *">
              <textarea
                rows={2}
                value={form.description}
                onChange={e => updateForm("description", e.target.value)}
                placeholder="What was done?"
                className={`${inputClass} resize-none`}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Performed By *">
                <input placeholder="Technician name" value={form.performed_by} onChange={e => updateForm("performed_by", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Cost (USD)">
                <input type="number" placeholder="0" value={form.cost} onChange={e => updateForm("cost", e.target.value)} className={inputClass} />
              </Field>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-900 font-semibold text-sm py-2 rounded-lg transition-colors">
              {submitting ? "Saving…" : "Save Record"}
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

function LoadingSkeleton() {
  return <div className="space-y-2 animate-pulse">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded-xl" />)}</div>;
}
