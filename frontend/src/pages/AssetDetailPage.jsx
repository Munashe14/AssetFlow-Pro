import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAsset, getAssetDepreciation, getAssetMaintanence, getAssetRepairs } from "../api/asset";
import { checkoutAsset, returnAssetByAssetId, returnAsset } from "../api/checkout";
import { getEmployees } from "../api/employee";
import AssetCodeCard from "../components/AssetCodeCard";
import StatusBadge from "../components/StatusBadge";
import AssetTagChip from "../components/AssetTagChip";
import AddAssetModal from "../components/AddAssetModal";
import { Modal } from "../components/Shared"; 
import EditAssetModal from "../components/EditAssetModal";

const TABS = ["overview", "barcode", "maintanence", "repairs"];

export default function AssetDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [asset, setAsset] = useState(null);
    const [depreciation, setDepreciation] = useState(null);
    const [maintanence, setMaintanence] = useState([]);
    const [repairs, setRepairs] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [tab, setTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({ employee_id: "", due_date: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError("");
            try {
                const [assetRes, depRes, maintRes, repairRes, empRes] = await Promise.all([
                    getAsset(id),
                    getAssetDepreciation(id).catch(() => null),
                    getAssetMaintanence(id),
                    getAssetRepairs(id),
                    getEmployees(),
                ]);

                setAsset(assetRes.data);
                setDepreciation(depRes?.data || null);
                setMaintanence(maintRes.data);
                setRepairs(repairRes.data);
                setEmployees(empRes.data);
            } catch {
                setError("Failed to load asset details.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    async function handleCheckout(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await checkoutAsset(id, {
                employee_id: Number(checkoutForm.employee_id),
                due_date: checkoutForm.due_date,
            });

            const res = await getAsset(id);
            setAsset(res.data);
            setShowCheckout(false);
        } catch {
            setError("Checkout failed. Check the employee and due date.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleReturn() {
        if (!window.confirm("Mark this asset as returned?")) return;
        try {
            await returnAssetByAssetId(id, { notes: " " });
            const res = await getAsset(id);
            setAsset(res.data);
        } catch {
            setError("Return failed.");
        }
    }

    if (loading) return <LoadingState />;
    if (!asset) return <p className="text-slate-400">Asset Not Found.</p>;

    const warrantyExpiring = asset.warranty_expiration_date
        ? new Date(asset.warranty_expiration_date) < new Date(Date.now() + 90 * 86400000)
        : false;

    const depreciationSummary = depreciation
        ? [
            ["Purchase Cost", depreciation.purchase_cost ? `$${Number(depreciation.purchase_cost).toLocaleString()}` : "-", true],
            ["Salvage Value", depreciation.salvage_value ? `$${Number(depreciation.salvage_value).toLocaleString()}` : "-", true],
            ["Useful Life", depreciation.useful_life_years ? `${depreciation.useful_life_years} years` : "-"],
            ["Annual Depreciation", depreciation.annual_depreciation ? `$${Number(depreciation.annual_depreciation).toLocaleString()}` : "-", true],
            ["Book Value", depreciation.purchase_cost && depreciation.annual_depreciation ? `$${(Number(depreciation.purchase_cost) - Number(depreciation.annual_depreciation)).toLocaleString()}` : "-", true],
        ]
        : [];

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <button
                        onClick={() => navigate("/assets")}
                        className="text-xs text-slate-500 hover:text-teal-400 transition-colors mb-2 flex items-center gap-1"
                    >
                        ← Back to Assets
                    </button>
                    <h1 className="text-2xl font-bold text-white">{asset.asset_name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <AssetTagChip tag={asset.asset_tag} />
                        <StatusBadge status={asset.status} />
                    </div>
                </div>

                <div className="flex gap-2">
                    {asset.status === "available" && (
                        <button
                            onClick={() => setShowCheckout(true)}
                            className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                            Checkout Asset
                        </button>
                    )}
                    <button
                        onClick={() => setShowEdit(true)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                        Edit Asset
                    </button>
                    {asset.status === "checked_out" && (
                        <button
                            onClick={handleReturn}
                            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                            Mark as Return
                        </button>
                    )}
                </div>
            </div>

            {warrantyExpiring && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <p className="text-sm text-amber-300">
                        Warranty expires on <strong>{asset.warranty_expiration_date}</strong> - within 90 days
                    </p>
                </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-1 border-b border-slate-800 pb-0">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                            tab === t
                                ? "border-teal-500 text-teal-400"
                                : "border-transparent text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === "overview" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            ["Asset Name", asset.asset_name],
                            ["Asset Tag", asset.asset_tag, true],
                            ["Location", asset.location],
                            ["Status", asset.status],
                            ["Purchase Cost", asset.purchase_cost ? `$${Number(asset.purchase_cost).toLocaleString()}` : "-", true],
                            ["Purchase Date", asset.purchase_date || "-"],
                            ["Warranty Expiry", asset.warranty_expiration_date || "-"],
                            ["Salvage Value", asset.salvage_value != null ? `$${Number(asset.salvage_value).toLocaleString()}` : "-", true],
                            ["Useful Life", asset.useful_life_years != null ? `${asset.useful_life_years} years` : "-"],
                            ["Annual Depreciation", asset.annual_depreciation != null ? `$${Number(asset.annual_depreciation).toLocaleString()}` : "-", true],
                        ].map(([label, value, mono]) => (
                            <div key={label} className="rounded-xl border border-slate-700/60 bg-slate-800/30 px-4 py-3">
                                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                                <p className={`text-sm text-slate-200 ${mono ? "font-mono" : ""}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-slate-700/60 bg-slate-800/20 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-semibold">Depreciation</h2>
                            <span className="text-xs uppercase tracking-widest text-slate-500">Straight-line</span>
                        </div>

                        {depreciation ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {depreciationSummary.map(([label, value, mono]) => (
                                    <div key={label} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-3">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                                        <p className={`text-sm text-slate-200 ${mono ? "font-mono" : ""}`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Depreciation data is not available for this asset yet.</p>
                        )}
                    </div>
                </div>
            )}

            {tab === "barcode" && <AssetCodeCard asset={asset} />}

            {tab === "maintanence" && (
                <RecordTable
                    rows={maintanence}
                    columns={[
                        { key: "maintanence_date", label: "Date" },
                        { key: "maintanence_type", label: "Type" },
                        { key: "description", label: "Description" },
                        { key: "performed_by", label: "Performed By" },
                        { key: "cost", label: "Cost", render: (v) => (v ? `$${v}` : "-") },
                    ]}
                    emptyText="No maintenance history for this asset."
                />
            )}

            {tab === "repairs" && (
                <RecordTable
                    rows={repairs}
                    columns={[
                        { key: "repair_date", label: "Date" },
                        { key: "repair_type", label: "Type" },
                        { key: "description", label: "Description" },
                        { key: "performed_by", label: "Performed By" },
                        { key: "cost", label: "Cost", render: (v) => (v ? `$${v}` : "-") },
                    ]}
                    emptyText="No repair history for this asset."
                />
            )}

            {showCheckout && (
                <Modal title="Checkout Asset" onClose={() => setShowCheckout(false)}>
                    <form onSubmit={handleCheckout} className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Employee</label>
                            <select
                                value={checkoutForm.employee_id}
                                onChange={(e) => setCheckoutForm((f) => ({ ...f, employee_id: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.first_name} {emp.last_name} - {emp.department}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Due Date</label>
                            <input
                                type="date"
                                value={checkoutForm.due_date}
                                onChange={(e) => setCheckoutForm((f) => ({ ...f, due_date: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-400 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-slate-500"
                                required
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={submitting || !checkoutForm.employee_id || !checkoutForm.due_date}
                                className="flex-1 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-900 font-semibold text-sm py-2 rounded-lg transition-colors"
                            >
                                {submitting ? "Processing..." : "Confirm Checkout"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCheckout(false)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm py-2 rounded-lg border border-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
            {showEdit && (
                <AddAssetModal
                    asset={asset}
                    onClose={() => setShowEdit(false)}
                    onUpdated={async () => {
                        const assetRes = await getAsset(id);
                        const depRes = await getAssetDepreciation(id).catch(() => null);
                        setAsset(assetRes.data);
                        setDepreciation(depRes?.data || null);
                    }}
                />
            )}
        </div>
    );
}

function RecordTable({ rows, columns, emptyText }) {
    if (!rows.length) {
        return <p className="text-sm text-slate-500 py-8 text-center">{emptyText}</p>;
    }

    return (
        <div className="rounded-xl border border-slate-700/60 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-700/60 bg-slate-800/40">
                        {columns.map((col) => (
                            <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={row.id || i} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-3 text-slate-300">
                                    {col.render ? col.render(row[col.key]) : row[col.key] || "-"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800 rounded-xl" />
                ))}
            </div>
        </div>
    );
}
