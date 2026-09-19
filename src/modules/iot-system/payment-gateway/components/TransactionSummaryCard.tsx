"use client";

import React from "react";
import { SmartCardInfo } from "../types";

interface TransactionSummaryCardProps {
    card: SmartCardInfo;
    amount: number;
    fee: number;
    vat: number;
    total: number;
    isProcessing: boolean;
    onConfirmTopUp: () => void;
}

export function TransactionSummaryCard({
    card,
    amount,
    fee,
    vat,
    total,
    isProcessing,
    onConfirmTopUp,
}: TransactionSummaryCardProps) {
    const maskedUid = card.cardUid.length > 10 
        ? `${card.cardUid.substring(0, 8)}...${card.cardUid.slice(-3)}` 
        : card.cardUid;

    return (
        <div className="bg-white rounded-2xl border border-[#D3DEDB] shadow-sm p-5 flex flex-col justify-between sticky top-20">
            <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#D3DEDB]">
                    <div>
                        <h3 className="text-base font-bold text-[#0D2322]">Transaction Summary</h3>
                        <p className="text-xs text-[#566C6A]">
                            Review card balance adjustments before confirming.
                        </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EDF2F1] text-[#0D2322] border border-[#D3DEDB] font-bold">
                        NODE #TX-8910
                    </span>
                </div>

                <div className="py-4 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-[#566C6A]">
                        <span>Target Card:</span>
                        <span className="text-[#0D2322] font-semibold">{maskedUid}</span>
                    </div>
                    <div className="flex justify-between text-[#566C6A]">
                        <span>Recharge Principal:</span>
                        <span className="text-[#0D2322] font-bold">₱{amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#566C6A]">
                        <span>Channel Gateway Fee:</span>
                        <span className="text-[#0D2322]">₱{fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#566C6A]">
                        <span>VAT (12% inclusive):</span>
                        <span className="text-[#0D2322]">₱{vat.toFixed(2)}</span>
                    </div>
                    <div className="my-2 border-t border-[#D3DEDB]" />
                    <div className="flex justify-between text-sm font-sans font-black text-[#0D2322] pt-1">
                        <span>Total Amount Due:</span>
                        <span className="text-[#D97706] font-mono text-lg font-bold">₱{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
                <button
                    type="button"
                    onClick={onConfirmTopUp}
                    disabled={isProcessing || amount <= 0}
                    className="w-full h-11 text-sm font-bold bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white rounded-xl shadow-md shadow-[#D97706]/30 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                    {isProcessing ? (
                        <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                            <span>Processing Tap & Clearing...</span>
                        </>
                    ) : (
                        <>
                            <span>Confirm Top-up (₱{total.toFixed(2)})</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                    )}
                </button>

                <div className="p-3 rounded-xl bg-[#EDF2F1] border border-[#D3DEDB] text-[11px] space-y-1.5 text-[#566C6A]">
                    <div className="flex items-center gap-1.5 font-bold text-[#0D2322]">
                        <span className="material-symbols-outlined text-[16px] text-[#059669]">verified_user</span>
                        <span>PCI-DSS Level 1 &amp; ApexPay Guard</span>
                    </div>
                    <p className="text-[10px] leading-relaxed">
                        Card transactions are tokenized with end-to-end ECDSA signatures. Physical card balance updates via NFC edge antenna within 250ms.
                    </p>
                </div>
            </div>
        </div>
    );
}
