import { useEffect, useState } from "react";
import {getAssets} from "../api/asset";
import AssetTable from "../components/AssetTable";
import AddAssetModal from "../components/AddAssetModal";
import BarcodeScanner from "../components/BarcodeScanner";
import { Modal, Field, inputClass } from "../components/shared";

export default function AssetsPage() {
    const [assets, setAssets]   =useState([]);
    const [search, setSearch]   =useState("");
    const [filterStatus, setFilter] =useState("all");
    const [showAdd, setShowAdd]     = useState(false);
    const [showScanner, setScanner] =useState(false);

    useEffect(() => {
        getAssets().then(res => setAssets(res.data));
    }, []);

    // When scanner reads a barcode, filter to matching asset tag
    function handleScan(tag) {
        setScanner(false);
        setSearch(tag);
    }

    const filtered = assets.filter(a => {
        const matchSearch = a.asset_name.toLowerCase().includes(search.toLowerCase())   
            || a.asset_tag.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;

    });
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Assets</h1>
            <div className="flex gap-2">
                {/* Barcode scan button - opens camera scanner */}
                <button 
                onClick={() =>setScanner(true)}
                className="border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 placeholder-slate-500">
                    <span></span>Scan
                </button>
                <button 
                onClick={() => setShowAdd(true)}
                className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    + Add Asset
                </button>
            </div>
        </div>
      
      <div className=" flex gap-3">
        <input value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="search by name or tag..."
        className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 w-64 focus:outline-none focus:border-teal-500 placeholder-slate-500" />
        <select 
        value={filterStatus}
        onChange={e => setFilter(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 w-64 focus:outline-none focus:border-teal-500">
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="checked_out">Checked Out</option>
            <option value="maintenance">Maintenance</option>
            <option value="disposed">Disposed</option>
        </select>
      </div>

      <AssetTable assets={filtered} onRefresh={() => getAssets().then(r => setAssets(r.data))} />
        {showAdd && <AddAssetModal onClose={() => setShowAdd(false)} onCreated={() => getAssets().then(r => setAssets(r.data))}/>}
        {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setScanner(false)} />} 
    </div>
  )
}
