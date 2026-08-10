import {QRCodeSVG} from "qrcode.react";

/**
 * Renders a QR code linking to the asset's detail page.
 * Scanning it with any QR reader navigates straight to /assets/:id.
 * 
 * Props:
 *  assetId (number) - asset primary key
 *  assetTag (string) - displayed as a label
 *  size (number) - QR pixel size, default 120
 */

export default function QRDisplay({assetId, assetTag, size = 120}) {
    if (!assetId) return null;

    const value = `${window.location.origin}/assets/${assetId}`;

    return (
        <div className="bg-white rounded-lg p-3 inline-flex flex-col items-center gap-1">
            <QRCodeSVG
                value={value}
                size={size}
                level="M"
                includeMargin={true}
            />
            <p className="text-center text-xs text-slate-600 font-mono tracking-widest">
                {assetTag}
            </p>
        </div>
    );
}