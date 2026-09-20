"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "../PaymentIcon";

interface MerchantQRGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MerchantQRGeneratorModal({ isOpen, onClose }: MerchantQRGeneratorModalProps) {
    const [qrType, setQrType] = useState<"static" | "dynamic">("dynamic");
    const [merchantName, setMerchantName] = useState("Map-ePay Merchant Store 01");
    const [terminalId, setTerminalId] = useState("TID-MNL-8821");
    const [amount, setAmount] = useState("450.00");
    const [orderRef, setOrderRef] = useState("ORD-882104");
    const [crossBorderEnabled, setCrossBorderEnabled] = useState(true);

    if (!isOpen) return null;

    // Simulated EMVCo payload format (QR Ph standard tag-length-value)
    const emvcoPayload =
        qrType === "dynamic"
            ? `00020101021226580010ph.qrr.hub0112${terminalId}520458125303608540${amount.length}${amount}5802PH5924${merchantName.slice(0, 24)}6006MANILA62190115${orderRef}6304E8A1`
            : `00020101021126580010ph.qrr.hub0112${terminalId}5204581253036085802PH5924${merchantName.slice(0, 24)}6006MANILA6304A2B9`;

    const handlePrint = () => {
        toast.success("Printing Merchant Standee", {
            description: `Sending high-resolution QR Ph standee to registered POS thermal printer.`,
        });
    };

    const handleCopyPayload = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(emvcoPayload);
            toast.success("EMVCo Payload Copied", { description: emvcoPayload });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl border border-[#D3DEDB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#0D2322] to-[#163331] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#D97706] text-white flex items-center justify-center">
                            <PaymentIcon name="qr_code_2" className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold tracking-tight">QR Ph Merchant Generator</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-[#FEF3C7] font-bold border border-white/30">
                                    Sec. C.2 / C.3 / C.7
                                </span>
                            </div>
                            <p className="text-xs text-white/80">
                                Official EMVCo-compliant National QR Ph specification with Cross-Border clearing
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                        <PaymentIcon name="close" className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left: Configuration Form */}
                    <div className="flex flex-col gap-4">
                        {/* QR Type Selector */}
                        <div className="flex p-1 bg-[#F4F7F6] rounded-xl border border-[#D3DEDB]">
                            <button
                                type="button"
                                onClick={() => setQrType("dynamic")}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    qrType === "dynamic"
                                        ? "bg-white text-[#0D2322] shadow-xs border border-[#D3DEDB]"
                                        : "text-[#566C6A] hover:text-[#0D2322]"
                                }`}
                            >
                                Dynamic QR (Sec. C.3)
                            </button>
                            <button
                                type="button"
                                onClick={() => setQrType("static")}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    qrType === "static"
                                        ? "bg-white text-[#0D2322] shadow-xs border border-[#D3DEDB]"
                                        : "text-[#566C6A] hover:text-[#0D2322]"
                                }`}
                            >
                                Static Standee (Sec. C.2)
                            </button>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                Merchant Registered Name
                            </label>
                            <input
                                type="text"
                                value={merchantName}
                                onChange={(e) => setMerchantName(e.target.value)}
                                className="w-full text-xs px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:bg-white focus:outline-none focus:border-[#0D2322]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Terminal ID (TID)
                                </label>
                                <input
                                    type="text"
                                    value={terminalId}
                                    onChange={(e) => setTerminalId(e.target.value)}
                                    className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:bg-white focus:outline-none focus:border-[#0D2322]"
                                />
                            </div>
                            {qrType === "dynamic" ? (
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                        Amount (PHP)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-xs font-bold text-[#566C6A]">₱</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full text-xs font-mono font-bold pl-7 pr-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:bg-white focus:outline-none focus:border-[#0D2322]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                        Amount Mode
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value="Customer Key-In"
                                        className="w-full text-xs px-3 py-2 rounded-xl bg-[#EDF4F2] border border-[#D3DEDB] text-[#566C6A] font-medium"
                                    />
                                </div>
                            )}
                        </div>

                        {qrType === "dynamic" && (
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Order / Bill Reference
                                </label>
                                <input
                                    type="text"
                                    value={orderRef}
                                    onChange={(e) => setOrderRef(e.target.value)}
                                    className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:bg-white focus:outline-none focus:border-[#0D2322]"
                                />
                            </div>
                        )}

                        {/* Cross-border toggle */}
                        <div className="p-3 rounded-xl bg-[#EDF4F2] border border-[#D3DEDB] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PaymentIcon name="public" className="w-4 h-4 text-[#0D2322]" />
                                <div>
                                    <span className="text-xs font-bold text-[#0D2322] block">
                                        Cross-Border Clearing (Sec. C.7)
                                    </span>
                                    <span className="text-[11px] text-[#566C6A]">
                                        Accept Alipay+, WeChat Pay &amp; PromptPay
                                    </span>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={crossBorderEnabled}
                                onChange={(e) => setCrossBorderEnabled(e.target.checked)}
                                className="w-4 h-4 rounded text-[#D97706] focus:ring-0 cursor-pointer accent-[#D97706]"
                            />
                        </div>
                    </div>

                    {/* Right: Live Standee / Screen Preview */}
                    <div className="flex flex-col items-center justify-center p-6 bg-[#F4F7F6] rounded-2xl border border-[#D3DEDB] text-center">
                        {/* Standee Header */}
                        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#D3DEDB]">
                            <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded bg-[#0D2322] text-white flex items-center justify-center text-[10px] font-black">
                                    M
                                </div>
                                <span className="text-xs font-extrabold text-[#0D2322] tracking-tight">Map-ePay</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D97706] text-white">
                                QR Ph Official
                            </span>
                        </div>

                        {/* QR Box Visualizer */}
                        <div className="p-4 bg-white rounded-2xl border-2 border-[#0D2322] shadow-md flex flex-col items-center relative">
                            {/* Simulated SVG QR */}
                            <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
                                <rect width="100" height="100" fill="white" />
                                {/* Top Left Corner Square */}
                                <rect x="10" y="10" width="24" height="24" fill="#0D2322" rx="3" />
                                <rect x="14" y="14" width="16" height="16" fill="white" rx="1.5" />
                                <rect x="18" y="18" width="8" height="8" fill="#D97706" rx="1" />
                                {/* Top Right Corner Square */}
                                <rect x="66" y="10" width="24" height="24" fill="#0D2322" rx="3" />
                                <rect x="70" y="14" width="16" height="16" fill="white" rx="1.5" />
                                <rect x="74" y="18" width="8" height="8" fill="#D97706" rx="1" />
                                {/* Bottom Left Corner Square */}
                                <rect x="10" y="66" width="24" height="24" fill="#0D2322" rx="3" />
                                <rect x="14" y="70" width="16" height="16" fill="white" rx="1.5" />
                                <rect x="18" y="74" width="8" height="8" fill="#D97706" rx="1" />
                                {/* Data Pixels */}
                                <rect x="42" y="12" width="6" height="6" fill="#0D2322" />
                                <rect x="52" y="12" width="6" height="6" fill="#0D2322" />
                                <rect x="46" y="22" width="6" height="6" fill="#0D2322" />
                                <rect x="14" y="44" width="6" height="6" fill="#0D2322" />
                                <rect x="24" y="44" width="6" height="6" fill="#0D2322" />
                                <rect x="34" y="44" width="8" height="8" fill="#0D2322" />
                                <rect x="58" y="44" width="6" height="6" fill="#0D2322" />
                                <rect x="70" y="44" width="6" height="6" fill="#0D2322" />
                                <rect x="80" y="44" width="6" height="6" fill="#0D2322" />
                                <rect x="42" y="56" width="6" height="6" fill="#0D2322" />
                                <rect x="52" y="64" width="6" height="6" fill="#0D2322" />
                                <rect x="64" y="68" width="6" height="6" fill="#0D2322" />
                                <rect x="76" y="62" width="8" height="8" fill="#0D2322" />
                                <rect x="82" y="76" width="6" height="6" fill="#0D2322" />
                                <rect x="68" y="82" width="6" height="6" fill="#0D2322" />
                                {/* Center Logo Badge */}
                                <rect x="38" y="38" width="24" height="24" fill="#0D2322" rx="4" />
                                <text x="50" y="54" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">
                                    QR Ph
                                </text>
                            </svg>

                            <div className="mt-2 text-center">
                                <span className="text-xs font-extrabold text-[#0D2322] block truncate max-w-[180px]">
                                    {merchantName}
                                </span>
                                {qrType === "dynamic" ? (
                                    <span className="text-sm font-black text-[#D97706] font-mono">
                                        ₱{parseFloat(amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-[#566C6A] font-semibold">Enter Amount on Device</span>
                                )}
                            </div>
                        </div>

                        {/* Partner Networks Badge */}
                        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-[#566C6A] flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-white border border-[#D3DEDB] font-bold">QR Ph</span>
                            <span className="px-1.5 py-0.5 rounded bg-white border border-[#D3DEDB] font-bold">InstaPay</span>
                            {crossBorderEnabled && (
                                <>
                                    <span className="px-1.5 py-0.5 rounded bg-white border border-[#D3DEDB] font-bold">Alipay+</span>
                                    <span className="px-1.5 py-0.5 rounded bg-white border border-[#D3DEDB] font-bold">WeChat Pay</span>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-4 w-full">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="flex-1 py-2 rounded-xl bg-[#0D2322] text-white text-xs font-bold hover:bg-[#163331] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <PaymentIcon name="download" className="w-3.5 h-3.5" />
                                <span>Print Standee</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCopyPayload}
                                className="px-3 py-2 rounded-xl bg-white border border-[#D3DEDB] text-[#0D2322] text-xs font-bold hover:bg-[#F4F7F6] transition-colors flex items-center gap-1 cursor-pointer"
                                title="Copy EMVCo Tag-Length-Value Payload"
                            >
                                <PaymentIcon name="content_copy" className="w-3.5 h-3.5" />
                                <span>EMVCo</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 bg-[#F4F7F6] border-t border-[#D3DEDB] flex items-center justify-between">
                    <span className="text-[11px] text-[#566C6A] font-mono truncate max-w-sm">
                        TLV: {emvcoPayload.slice(0, 42)}...
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg border border-[#D3DEDB] text-xs font-semibold text-[#566C6A] hover:bg-white transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
