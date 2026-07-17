import { useEffect, useState } from "react";
import { getDisposals, disposeAsset } from "../api/disposal";
import { getAssets } from "../api/asset";
import { Modal, Field, inputClass } from "../components/shared";

const DISPOSAL_METHODS = ["Sold", "Donated", "Scrapped", "Written Off", "Transferred"];

export default function DisposalPage() {
  const [disposals, setDisposals] = useState([]);
  const [assets,    setAssets]    = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState("");

  const [form, setForm] = useState({
    asset_id:        "",
    disposal_date:   "",
    disposal_method: "",
    reason:          "",
    approved_by:     "",
  });

  function updateForm(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function load() {
    setLoading(true);
    const [dispRes, assetRes] = await Promise.all([getDisposals(), getAssets()]);
    setDisposals(dispRes.data);
    setAssets(assetRes.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.asset_id || !form.disposal_date || !form.disposal_method) {
      setError("Asset, date, and method are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await disposeAsset(form.asset_id, {
        disposal_date:   form.disposal_date,
        disposal_method: form.disposal_method,
        reason:          form.reason || null,
        approved_by:     form.approved_by || null,
      });
      setShowForm(false);
      setForm({ asset_id: "", disposal_date: "", disposal_method: "", reason: "", approved_by: "" });
      load();
    } catch {
      setError("Disposal failed. The asset may already be disposed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Disposal</h1>
          <p className="text-slate-400 text-sm mt-0.5">{disposals.length} assets disposed</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + Record Disposal
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="rounded-xl border border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/40">
                {["Asset ID", "Disposal Date", "Method", "Approved By", "Reason"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {disposals.map(d => (
                <tr key={d.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-300 text-xs">#{d.asset_id}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{d.disposal_date}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-medium">
                      {d.disposal_method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{d.approved_by || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{d.reason || d.description || "—"}</td>
                </tr>
              ))}
              {disposals.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-slate-500 text-sm">No disposal records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Disposal form modal */}
      {showForm && (
        <Modal title="Record Asset Disposal" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Asset *</label>
              <select
                value={form.asset_id}
                onChange={e => updateForm("asset_id", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              >
                <option value="">Select asset…</option>
                {assets
                  .filter(a => a.status !== "disposed")
                  .map(a => (
                    <option key={a.id} value={a.id}>
                      {a.asset_name} — {a.asset_tag}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Disposal Date *</label>
              <input
                type="date"
                value={form.disposal_date}
                onChange={e => updateForm("disposal_date", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-400 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Disposal Method *</label>
              <select
                value={form.disposal_method}
                onChange={e => updateForm("disposal_method", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              >
                <option value="">Select method…</option>
                {DISPOSAL_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Approved By</label>
              <input
                placeholder="Name of approving officer"
                value={form.approved_by}
                onChange={e => updateForm("approved_by", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Reason</label>
              <textarea
                rows={2}
                placeholder="Optional reason or notes…"
                value={form.reason}
                onChange={e => updateForm("reason", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 placeholder-slate-600 resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 border border-red-500/30 font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              {submitting ? "Saving…" : "Confirm Disposal"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm py-2 rounded-lg border border-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded-xl" />)}
    </div>
  );
}
