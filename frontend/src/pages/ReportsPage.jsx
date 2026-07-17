import { getDueReturns, getWarrantyAlerts, exportAssetsPDF, exportAssetsExcel } from "../api/report";
import { downloadBlob } from "../utils/downloadBlob";
import { useState, useEffect } from "react";
import { Modal, Field, inputClass } from "../components/shared";

export default function ReportPage() {
    const [dueReturns, setDueReturns] = useState([]);
    const [warrantyAlerts, setWarranty] = useState([]);

    useEffect(() => {
        getDueReturns().then((r) => setDueReturns(r.data || []));
        getWarrantyAlerts().then((r) => setWarranty(r.data || []));
    }, []);

    async function handlePDF() {
        const res = await exportAssetsPDF();
        downloadBlob(res.data, "assets-report.pdf");
    }

    async function handleExcel() {
        const res = await exportAssetsExcel();
        downloadBlob(res.data, "assets-report.xlsx");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Reports</h1>

            <div className="flex gap-3">
                <button
                    onClick={handlePDF}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    Export PDF
                </button>
                <button
                    onClick={handleExcel}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    Export Excel
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReportCard title="Due-Return Reminders" items={dueReturns} accent="amber" />
                <ReportCard title="Warranty-Expiry-Alerts" items={warrantyAlerts} accent="red" />
            </div>
        </div>
    );
}

function ReportCard({ title, items = [], accent }) {
    const colors = {
        amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        red: "border-red-500/30 bg-red-500/10 text-red-400",
    };

    return (
        <div className={`rounded-xl border p-4 ${colors[accent]}`}>
            <h3 className="font-semibold text-sm mb-2">{title}</h3>
            <p className="text-2xl font-bold">{items.length}</p>
            <p className="text-xs mt-1 opacity-70">items flagged</p>
        </div>
    );
}