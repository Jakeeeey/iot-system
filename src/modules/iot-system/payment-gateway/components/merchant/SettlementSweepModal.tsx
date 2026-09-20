"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "../PaymentIcon";

interface SettlementSweepModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettlementSweepModal({ isOpen, onClose }: SettlementSweepModalProps) {
    const [grossBalance] = useState(128450.0);
    const [mdrRate] = useState(1.5); // 1.5%
    const [birWithholdingRate] = useState(1.0); // 1% BIR RR 16-2023
    const [reserveHoldRate] = useState(0.5); // 0.5% dispute reserve hold
    const [linkedBank] = useState("BDO Unibank - CA #****4912");
    const [isSweeping, setIsSweeping] = useState(false);
    const [hasSwept, setHasSwept] = useState(false);
    const [autoSweepEnabled, setAutoSweepEnabled] = useState(true);

    if (!isOpen) return null;

    const mdrAmount = (grossBalance * mdrRate) / 100;
    const birAmount = (grossBalance * birWithholdingRate) / 100;
    const reserveAmount = (grossBalance * reserveHoldRate) / 100;
    const netSweepAmount = grossBalance - mdrAmount - birAmount - reserveAmount;

    const handleExecuteSweep = () => {
        setIsSweeping(true);
        toast.info("Initiating Net Settlement Sweep", {
            description: `Transmitting PhilPaSSplus clearing file to ${linkedBank}...`,
        });

        setTimeout(() => {
            setIsSweeping(false);
            setHasSwept(true);
            toast.success("Settlement Sweep Complete", {
                description: `₱${netSweepAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} transferred to ${linkedBank}.`,
            });
        }, 1200);
    };

    const handleDownloadBir2307 = () => {
        toast.success("BIR Form 2307 Downloaded", {
            description: "Official Certificate of Creditable Tax Withheld at Source (RR 16-2023) generated.",
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-xl border border-[#D3DEDB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#0D2322] to-[#163331] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#D97706] text-white flex items-center justify-center">
                            <PaymentIcon name="account_balance" className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold tracking-tight">Merchant Net-Settlement Sweep</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-[#FEF3C7] font-bold border border-white/30">
                                    Sec. E.3 / L.2
                                </span>
                            </div>
                            <p className="text-xs text-white/80">
                                Real-time clearing, MDR fee deduction, and BIR 1% withholding tax calculation
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
                <div className="p-6 overflow-y-auto flex flex-col gap-4">
                    {/* Settlement Calculation Breakdown */}
                    <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col gap-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#566C6A]">
                            Daily Settlement Liquidity Breakdown
                        </span>

                        <div className="flex items-center justify-between text-xs py-1 border-b border-[#D3DEDB]">
                            <span className="text-[#0D2322] font-semibold">Today&apos;s Gross Processed Sales</span>
                            <span className="font-mono font-bold text-[#0D2322]">
                                ₱{grossBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1 border-b border-[#D3DEDB]">
                            <span className="text-[#566C6A]">Merchant Discount Rate (MDR 1.5%)</span>
                            <span className="font-mono text-[#C2410C]">
                                -₱{mdrAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1 border-b border-[#D3DEDB]">
                            <div>
                                <span className="text-[#566C6A] block">BIR Withholding Tax (1.0%)</span>
                                <span className="text-[10px] text-[#8B9F9D]">Revenue Regulations No. 16-2023</span>
                            </div>
                            <span className="font-mono text-[#C2410C]">
                                -₱{birAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1 border-b border-[#D3DEDB]">
                            <div>
                                <span className="text-[#566C6A] block">Dispute Rolling Reserve Hold (0.5%)</span>
                                <span className="text-[10px] text-[#8B9F9D]">Sec. L.7 Merchant Collateral Lock</span>
                            </div>
                            <span className="font-mono text-[#566C6A]">
                                -₱{reserveAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm py-2 pt-3 font-bold">
                            <span className="text-[#0D2322]">Net Settled Payout</span>
                            <span className="font-mono text-base font-black text-[#059669]">
                                ₱{hasSwept ? "0.00" : netSweepAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Destination Bank & Automation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-[#EDF4F2] border border-[#D3DEDB]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#566C6A] block">
                                Linked Settlement Depository
                            </span>
                            <span className="text-xs font-bold text-[#0D2322] block mt-1">{linkedBank}</span>
                            <span className="text-[10px] text-[#059669] font-semibold mt-0.5 block">
                                RTGS PhilPaSSplus Ready
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#EDF4F2] border border-[#D3DEDB] flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#566C6A]">
                                    Midnight Auto-Sweep
                                </span>
                                <input
                                    type="checkbox"
                                    checked={autoSweepEnabled}
                                    onChange={(e) => setAutoSweepEnabled(e.target.checked)}
                                    className="w-4 h-4 rounded text-[#D97706] focus:ring-0 cursor-pointer accent-[#D97706]"
                                />
                            </div>
                            <span className="text-[11px] text-[#566C6A] mt-1">
                                Automated daily cutoff sweep at 23:59:59 PHT
                            </span>
                        </div>
                    </div>

                    {/* Tax Form 2307 Action */}
                    <div className="p-3.5 rounded-xl border border-[#D3DEDB] flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#EDF4F2] text-[#0D2322] flex items-center justify-center">
                                <PaymentIcon name="receipt" className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-[#0D2322] block">
                                    BIR Form 2307 Tax Certificate
                                </span>
                                <span className="text-[11px] text-[#566C6A]">
                                    Withholding tax credit slip for this settlement period
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownloadBir2307}
                            className="px-3 py-1.5 rounded-lg bg-[#EDF4F2] hover:bg-[#E2EBE9] text-[#0D2322] text-xs font-bold border border-[#D3DEDB] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <PaymentIcon name="download" className="w-3.5 h-3.5" />
                            <span>Download 2307</span>
                        </button>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3.5 bg-[#F4F7F6] border-t border-[#D3DEDB] flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-[#D3DEDB] text-xs font-semibold text-[#566C6A] hover:bg-white transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        disabled={isSweeping || hasSwept}
                        onClick={handleExecuteSweep}
                        className="px-6 py-2 rounded-xl bg-[#0D2322] text-white text-xs font-bold hover:bg-[#163331] transition-all flex items-center gap-1.5 shadow-md shadow-[#0D2322]/20 cursor-pointer disabled:opacity-60"
                    >
                        <PaymentIcon name="payments" className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>{isSweeping ? "Executing Net Sweep..." : hasSwept ? "Funds Swept" : "Sweep Funds to Bank"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
