import BarcodeDisplay from "./BarcodeDisplay";

// Inside your asset detail panel:
//<BarcodeDisplay value={asset.asset_tag} />

<button
onClick={() => window.print()}
className="text-xs text-slate-400 hover:text-teal-400 mt-2 transition-colors"
>
 Print barcode label 
</button>