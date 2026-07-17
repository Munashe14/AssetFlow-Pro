import { useState } from "react";
import { updateAsset } from "../api/asset";

export default function EditAssetModal({ asset, onClose, onUpdated }) {
  const [form, setForm] = useState({
    asset_name: asset.asset_name || "",
    asset_tag: asset.asset_tag || "",
    purchase_cost: asset.purchase_cost ?? "",
    salvage_value: asset.salvage_value ?? "",
    useful_life_years: asset.useful_life_years ?? "",
    location: asset.location || "",
    purchase_date: asset.purchase_date || "",
    warranty_expiration_date: asset.warranty_expiration_date || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        purchase_cost: parseInt(form.purchase_cost) || 0,
        salvage_value: form.salvage_value !== "" ? parseInt(form.salvage_value) : undefined,
        useful_life_years: form.useful_life_years !== "" ? parseInt(form.useful_life_years) : undefined,
      };
      const res = await updateAsset(asset.id, payload);
      onUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update asset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Edit Asset</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Asset Name *</label>
            <input
              name="asset_name"
              value={form.asset_name}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Asset Tag *</label>
            <input
              name="asset_tag"
              value={form.asset_tag}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Purchase Cost *</label>
            <input
              type="number"
              name="purchase_cost"
              value={form.purchase_cost}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Location *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Salvage Value</label>
            <input
              type="number"
              name="salvage_value"
              value={form.salvage_value}
              onChange={handleChange}
              placeholder="Optional — default 10% of cost"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Useful Life (years)</label>
            <input
              type="number"
              name="useful_life_years"
              value={form.useful_life_years}
              onChange={handleChange}
              placeholder="Optional — default 5"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Purchase Date</label>
            <input
              type="date"
              name="purchase_date"
              value={form.purchase_date}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Warranty Expiration Date</label>
            <input
              type="date"
              name="warranty_expiration_date"
              value={form.warranty_expiration_date}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-teal-500"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-teal-500 text-slate-900 font-semibold hover:bg-teal-400 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}