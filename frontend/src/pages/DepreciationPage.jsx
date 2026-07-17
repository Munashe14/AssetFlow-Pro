import { useEffect, useState } from "react";
import { getAssets, getAssetDepreciation } from "../api/asset";

function formatCurrency(value) {
    if (value === null || value === undefined || value === "") return "-";
    return `$${Number(value).toLocaleString()}`;
}

export default function DepreciationPage() {
    const [assets, setAssets] = useState([]);
    const [depreciationMap, setDepreciationMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError("");
            try {
                const assetsRes = await getAssets();
                const assetList = assetsRes.data || [];
                setAssets(assetList);

                const results = await Promise.all(
                    assetList.map(async (asset) => {
                        try {
                            const depRes = await getAssetDepreciation(asset.id);
                            return [asset.id, depRes.data];
                        } catch {
                            return [asset.id, null];
                        }
                    })
                );

                const nextMap = {};
                results.forEach(([assetId, data]) => {
                    nextMap[assetId] = data;
                });
                setDepreciationMap(nextMap);
            } catch {
                setError("Failed to load depreciation data.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Depreciation</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Review straight-line depreciation values for all assets in one place.
                </p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {loading ? (
                <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4 animate-pulse">
                    <div className="h-10 bg-slate-700 rounded mb-3" />
                    <div className="h-10 bg-slate-700 rounded mb-2" />
                    <div className="h-10 bg-slate-700 rounded" />
                </div>
            ) : (
                <div className="rounded-xl border border-slate-700/60 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700/60 bg-slate-800/40">
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Asset</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Tag</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Purchase Cost</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Salvage Value</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Useful Life</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Annual Depreciation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                        No assets found.
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => {
                                    const depreciation = depreciationMap[asset.id];
                                    return (
                                        <tr key={asset.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3 text-slate-200">{asset.asset_name}</td>
                                            <td className="px-4 py-3 text-slate-400 font-mono">{asset.asset_tag}</td>
                                            <td className="px-4 py-3 text-slate-400 capitalize">{asset.status}</td>
                                            <td className="px-4 py-3 text-slate-300">{formatCurrency(depreciation?.purchase_cost)}</td>
                                            <td className="px-4 py-3 text-slate-300">{formatCurrency(depreciation?.salvage_value)}</td>
                                            <td className="px-4 py-3 text-slate-300">{depreciation?.useful_life_years ? `${depreciation.useful_life_years} years` : "-"}</td>
                                            <td className="px-4 py-3 text-slate-300">{formatCurrency(depreciation?.annual_depreciation)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
