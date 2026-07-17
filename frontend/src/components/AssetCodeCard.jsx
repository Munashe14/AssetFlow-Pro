import { useState } from "react";
import BarcodeDisplay from "./BarcodeDisplay";
import QRDisplay from "./QRDisplay";

/**
 * Tabbed card that shows Barcode and QR Code for an asset.
 * Includes a print button that prints whichever tab is active
 * 
 *  Props:
 *      asset - the full asset object from the API
 *              Required fields id, asset_tag
 * 
 */

export default function AssetCodeCard ({asset}) {
    const [tab, setTab] = useState("barcode");

    function handlePrint() {
        window.print();
    }

    return (
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
            {/* Tab Switcher */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 bg-slate-900/60 rounded-lg p-1">
                    {["barcode", "qr"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                                tab == t
                                ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                                : "text-slate-500 hover:text-slate-300"
                            }`}>
                                {t === "barcode" ? "Barcode" : "QR Code"}
                            </button>
                    ))}
                </div>
                <button 
                 onClick={handlePrint}
                 className="text-xs text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1">
                    Print 
                </button>
            </div>

            {/* Code display */}
            <div className="flex justify-center py-2">
                    {tab === "barcode" ? (
                        <BarcodeDisplay value={asset.asset_tag}/>
                    ) : <QRDisplay assetId={asset.id} assetTag={asset.asset_tag}/>}
            </div>

            <p className="text-center text-xs text-slate-600 mt-2">
                    {tab === "barcode"
                    ? "Scan with a barcode reader or the in-app camera scanner"
                    : "Scan with any phone camera to open this asset directly"}
            </p>
            
        </div>
    );
}