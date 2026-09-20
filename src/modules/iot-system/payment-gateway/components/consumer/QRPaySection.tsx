"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "../PaymentIcon";

interface QRPaySectionProps {
    balance: number;
    onPaymentComplete?: (amount: number, merchant: string) => void;
}

export function QRPaySection({ balance, onPaymentComplete }: QRPaySectionProps) {
    const [qrMode, setQrMode] = useState<"personal-qr" | "scan-to-pay" | "show-to-pay" | "nfc-tap">("personal-qr");

    // Dynamic one-time barcode countdown (Sec. C.5)
    const [barcodeSeconds, setBarcodeSeconds] = useState(60);
    const [dynamicToken, setDynamicToken] = useState("9821 0041 8829 1102");

    // Contactless NFC / MST Emulation state (Sec. D.4, D.6)
    const [isNfcActive, setIsNfcActive] = useState(false);
    const [isMstActive, setIsMstActive] = useState(false);
    const [nfcTapped, setNfcTapped] = useState(false);

    // Scan-to-Pay simulation state (Sec. C.4)
    const [scannedMerchant, setScannedMerchant] = useState("");
    const [scannedAmount, setScannedAmount] = useState("");
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setBarcodeSeconds((prev) => {
                if (prev <= 1) {
                    setDynamicToken(`${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`);
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulateScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setScannedMerchant("Seven-Eleven Convenience Store #1042");
            setScannedAmount("185.50");
            toast.success("Merchant QR Scanned", {
                description: "Recognized QR Ph compliant merchant counter payload.",
            });
        }, 800);
    };

    const handleConfirmScanPay = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(scannedAmount);
        if (isNaN(amt) || amt <= 0 || amt > balance) {
            toast.error("Invalid Amount", { description: "Insufficient balance for scan payment." });
            return;
        }
        if (onPaymentComplete) onPaymentComplete(amt, scannedMerchant);
        toast.success("Payment Successful!", {
            description: `Paid ₱${amt.toFixed(2)} to ${scannedMerchant} via QR Ph rails.`,
        });
        setScannedMerchant("");
        setScannedAmount("");
    };

    const handleSimulateNfcTap = () => {
        setIsNfcActive(true);
        setTimeout(() => {
            setNfcTapped(true);
            setIsNfcActive(false);
            const amt = 250.0;
            if (onPaymentComplete) onPaymentComplete(amt, "MRT-3 North Avenue Turnstile");
            toast.success("Contactless NFC Tap Approved", {
                description: `Host Card Emulation (HCE) authorized ₱${amt.toFixed(2)} tap without PIN (< ₱2,000 ceiling).`,
            });
            setTimeout(() => setNfcTapped(false), 2500);
        }, 1000);
    };

    const handleToggleMst = () => {
        setIsMstActive(!isMstActive);
        toast.info(isMstActive ? "MST Emulation Deactivated" : "MST Magnetic Pulses Active", {
            description: "Ready to transmit magnetic stripes to legacy terminals without NFC.",
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() => setQrMode("personal-qr")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        qrMode === "personal-qr"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="qr_code" className="w-4 h-4 text-[#D97706]" />
                        My Personal QR (Sec. C.1)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setQrMode("scan-to-pay")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        qrMode === "scan-to-pay"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="qr_code_scanner" className="w-4 h-4 text-[#059669]" />
                        Scan-to-Pay (Sec. C.4)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setQrMode("show-to-pay")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        qrMode === "show-to-pay"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="barcode_scanner" className="w-4 h-4 text-[#2563EB]" />
                        Show-to-Pay Barcode (Sec. C.5)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setQrMode("nfc-tap")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        qrMode === "nfc-tap"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="contactless" className="w-4 h-4 text-[#C2410C]" />
                        Tap-to-Pay / NFC (Sec. D.4)
                    </span>
                </button>
            </div>

            {/* MODE 1: MY PERSONAL QR (Sec. C.1, C.7) */}
            {qrMode === "personal-qr" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col items-center text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5F1] text-[#0F5B46] text-xs font-bold font-mono border border-[#BCE3D6]">
                            QR Ph National Standard • Sec. C.1 / C.7
                        </span>
                        <h3 className="text-base font-bold text-[#0D2322] mt-2">
                            Receive Money Instantly
                        </h3>
                        <p className="text-xs text-[#566C6A] max-w-xs mt-0.5">
                            Show this QR code to another user or let them scan it from any Philippine banking app or international Alipay+ wallet.
                        </p>

                        {/* Simulated High-Res QR Ph Code */}
                        <div className="p-4 rounded-2xl bg-[#F4F7F6] border-2 border-[#0D2322] my-4 shadow-sm relative">
                            <div className="w-48 h-48 bg-white rounded-xl p-2 flex flex-col items-center justify-between border border-[#D3DEDB]">
                                <div className="grid grid-cols-6 gap-1 w-full h-full p-2">
                                    {Array.from({ length: 36 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-xs ${
                                                i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                                                    ? "bg-[#0D2322]"
                                                    : "bg-[#EDF2F1]"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="px-2 py-1 rounded bg-[#D97706] text-white text-[10px] font-extrabold shadow-sm font-mono">
                                    Map-ePay
                                </span>
                            </div>
                        </div>

                        <span className="text-xs font-mono font-bold text-[#0D2322]">
                            @iot_holder • 0917-882-9901
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                        <div>
                            <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                                Interoperable Standards
                            </span>
                            <h4 className="text-sm font-bold text-[#0D2322] mt-1">
                                Universal Cross-Border Acceptance (Sec. C.7)
                            </h4>
                            <p className="text-xs text-[#566C6A] mt-1 leading-relaxed">
                                This QR is compliant with Bangko Sentral ng Pilipinas (BSP) Circular 1055 (QR Ph) and regional ASEAN switches, allowing instant fund receipt from:
                            </p>

                            <div className="mt-4 flex flex-col gap-2.5 text-xs">
                                <div className="p-2.5 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                    <span className="font-semibold text-[#0D2322]">QR Ph (P2P &amp; P2M)</span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        Certified
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                    <span className="font-semibold text-[#0D2322]">Alipay+ Regional Interconnect</span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        Live FX Active
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                    <span className="font-semibold text-[#0D2322]">WeChat Pay / PromptPay</span>
                                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                                        Enabled
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#D3DEDB] text-[11px] text-[#566C6A]">
                            Zero convenience fee on inbound QR receipts.
                        </div>
                    </div>
                </div>
            )}

            {/* MODE 2: SCAN-TO-PAY (Sec. C.4) */}
            {qrMode === "scan-to-pay" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] max-w-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#0D2322]">Scan-to-Pay Camera Viewfinder</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#0F5B46] text-[10px] font-mono font-bold border border-[#BCE3D6]">
                            Sec. C.4
                        </span>
                    </div>
                    <p className="text-xs text-[#566C6A] mb-4">
                        Scan static or dynamic counter QR codes at partner establishments.
                    </p>

                    {!scannedMerchant ? (
                        <div className="p-8 rounded-2xl bg-[#0D2322] text-white flex flex-col items-center justify-center gap-4 text-center">
                            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#D97706] flex items-center justify-center animate-pulse">
                                <PaymentIcon name="qr_code_scanner" className="w-10 h-10 text-[#D97706]" />
                            </div>
                            <div>
                                <span className="text-xs font-bold block">Point camera at QR Ph Code</span>
                                <span className="text-[11px] text-gray-400">Position the QR code inside the viewfinder frame</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleSimulateScan}
                                disabled={isScanning}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white font-bold text-xs hover:brightness-105 transition-all cursor-pointer shadow-md"
                            >
                                {isScanning ? "Scanning Frame..." : "Simulate Merchant Scan"}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleConfirmScanPay} className="flex flex-col gap-4">
                            <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB]">
                                <span className="text-[10px] text-[#566C6A] uppercase tracking-wider font-semibold block">
                                    Merchant Destination
                                </span>
                                <span className="text-sm font-bold text-[#0D2322] block mt-0.5">
                                    {scannedMerchant}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Payable Amount (PHP)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={scannedAmount}
                                    onChange={(e) => setScannedAmount(e.target.value)}
                                    required
                                    className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-lg font-bold font-mono text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setScannedMerchant("")}
                                    className="flex-1 py-2.5 rounded-xl bg-[#F4F7F6] text-xs font-bold text-[#566C6A] hover:bg-[#EDF2F1] cursor-pointer"
                                >
                                    Rescan
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-[#0D2322] text-white text-xs font-bold hover:bg-[#163331] shadow-md cursor-pointer"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* MODE 3: SHOW-TO-PAY BARCODE (Sec. C.5) */}
            {qrMode === "show-to-pay" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] max-w-lg mx-auto flex flex-col items-center text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF] text-xs font-bold font-mono border border-[#BFDBFE]">
                        Show-to-Pay / Reverse Scan • Sec. C.5
                    </span>
                    <h3 className="text-base font-bold text-[#0D2322] mt-2">
                        Cashier Scan Barcode
                    </h3>
                    <p className="text-xs text-[#566C6A] max-w-xs mt-0.5">
                        Present this barcode to the cashier scanner. Auto-debits exact checkout total with single-use cryptographic token.
                    </p>

                    {/* Dynamic Barcode Simulation */}
                    <div className="w-full max-w-xs p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] my-4 flex flex-col items-center">
                        <div className="flex items-center gap-1 h-16 w-full justify-center px-4 bg-white rounded-lg border border-[#D3DEDB]">
                            {Array.from({ length: 42 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-12 ${
                                        i % 3 === 0 ? "w-1.5 bg-[#0D2322]" : i % 2 === 0 ? "w-0.5 bg-[#0D2322]" : "w-1 bg-[#566C6A]"
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="mt-2 text-sm font-mono font-bold tracking-widest text-[#0D2322]">
                            {dynamicToken}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#566C6A]">
                        <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                        <span>Regenerates in <strong>{barcodeSeconds}s</strong> for anti-replay protection.</span>
                    </div>
                </div>
            )}

            {/* MODE 4: TAP-TO-PAY / CONTACTLESS NFC & MST (Sec. D.4, D.6) */}
            {qrMode === "nfc-tap" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-[#0D2322]">Tap-to-Pay (HCE Contactless NFC)</h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-mono font-bold border border-[#FDE68A]">
                                    Sec. D.4
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A] leading-relaxed">
                                Host Card Emulation (HCE) allows your mobile device to act as an EMV contactless card. Tap against transit turnstiles or POS terminals with sub-250ms authorization.
                            </p>

                            <div className="my-6 p-6 rounded-2xl bg-[#0D2322] text-white flex flex-col items-center text-center gap-3">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                                        nfcTapped
                                            ? "bg-emerald-500 text-white animate-bounce"
                                            : isNfcActive
                                            ? "bg-amber-500 text-white animate-ping"
                                            : "bg-[#163331] text-[#D97706]"
                                    }`}
                                >
                                    <PaymentIcon name="contactless" className="w-8 h-8" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold block">
                                        {nfcTapped
                                            ? "Tap Authorized!"
                                            : isNfcActive
                                            ? "Communicating with NFC Antenna..."
                                            : "Ready to Tap"}
                                    </span>
                                    <span className="text-xs text-gray-300">
                                        Instant tap limit: <strong>₱2,000.00</strong> (No PIN required)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSimulateNfcTap}
                                    disabled={isNfcActive}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white font-bold text-xs hover:brightness-105 transition-all cursor-pointer shadow-md disabled:opacity-60"
                                >
                                    Simulate Turnstile / POS Tap
                                </button>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-[#D3DEDB] text-[11px] text-[#566C6A]">
                            <span>Complies with EMVCo Contactless Level 2 Book C specifications.</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-[#0D2322]">MST Emulation (Legacy Terminals)</h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#EDF2F1] text-[#0D2322] text-[10px] font-mono font-bold">
                                    Sec. D.6
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A] leading-relaxed">
                                Magnetic Secure Transmission generates magnetic pulses mimicking a traditional card swipe for legacy POS terminals lacking contactless NFC antennae.
                            </p>

                            <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] my-4 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-[#0D2322] block">Magnetic Pulse Transmitter</span>
                                    <span className="text-[11px] text-[#566C6A]">
                                        Status: {isMstActive ? "Broadcasting inductive signal" : "Standby"}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleToggleMst}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isMstActive
                                            ? "bg-[#059669] text-white shadow-xs"
                                            : "bg-[#0D2322] text-white"
                                    }`}
                                >
                                    {isMstActive ? "Pulse Active" : "Enable MST"}
                                </button>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#B45309]">
                            <strong>Fallback note:</strong> Subject to EMV Fallback liability shift rules (Sec. M.15) if physical chip is present.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
