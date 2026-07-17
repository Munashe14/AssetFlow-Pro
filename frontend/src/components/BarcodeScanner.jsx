import { useEffect, useRef, useState } from "react";
import {BrowserMultiFormatReader} from "@zxing/library";

/**
 *  Opens the device camera, scans for a barcode, and calls onScan(result).
 *  Props:
 *      onScan(decodedText: string) - called once when a barcode is found
 *                                  - called when user dismisses the scanner
 *      onClose()
 */

export default function BarcodeScanner({onScan, onClose}) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        readerRef.current = codeReader;

        codeReader.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result,err) => {
                if (result) {
                    onScan(result.getText());
                    codeReader.reset(); //stop scanning after first result
                }
                //Ignore continous NotFoundException- it fires until a barcode is found
            }
        );

        return () => {
            codeReader.reset();
        }
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-sm mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Scan Asset Code</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg"></button>
                </div>

                {/* Camera ViewFinder */}
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    {/* Targeting reticle overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-24 border-2 border-teal-400 rounded opacity-70"/>
                    </div>
                </div>

                {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
                <p className="text-xs text-slate-500 mt-3 text-center">
                    Point the camera at an asset tag barcode
                </p>
            </div>
        </div>
    );
}