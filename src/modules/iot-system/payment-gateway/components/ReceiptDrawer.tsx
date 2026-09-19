"use client";

import React from "react";
import { WalletTransactionItem } from "../types";
import { toast } from "sonner";

interface ReceiptDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: WalletTransactionItem | null;
}

export function ReceiptDrawer({ isOpen, onClose, transaction }: ReceiptDrawerProps) {
    if (!isOpen || !transaction) return null;

    const handleDownload = () => {
        toast.success("Receipt Downloaded", {
            description: `Official digital receipt for ${transaction.merchant} saved to device.`,
        });
    };

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(
                `ApexPay Receipt: ${transaction.merchant} - ₱${Math.abs(transaction.amount).toFixed(2)} (${transaction.referenceCode})`
            );
        }
        toast.info("Receipt Link Copied", {
            description: "Encrypted transaction verification link copied to clipboard.",
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0A1C1B]/70 backdrop-blur-xs transition-opacity duration-300">
            {/* Backdrop click to close */}
            <div className="fixed inset-0" onClick={onClose} />

            <div className="relative z-10 w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-[#D3DEDB] overflow-y-auto animate-in slide-in-from-right duration-300">
                <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#D3DEDB]">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#566C6A]">
                            Official Digital Receipt
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#566C6A] hover:bg-[#EDF4F2] transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Receipt Card Container */}
                    <div className="bg-[#F4F7F6] rounded-2xl p-6 text-center relative overflow-hidden my-5 border border-[#D3DEDB]">
                        <div className="w-12 h-12 rounded-full bg-[#E8F5F1] text-[#059669] mx-auto flex items-center justify-center mb-3 border border-[#BCE3D6]">
                            <span className="material-symbols-outlined text-[26px]">check_circle</span>
                        </div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#059669] block">
                            Payment Successfully Settled
                        </span>
                        <h3 className="text-lg font-bold text-[#0D2322] mt-1 block">
                            {transaction.merchant}
                        </h3>
                        <div className="text-3xl font-mono font-extrabold text-[#D97706] my-2">
                            {transaction.amount < 0 ? "-" : "+"}₱{Math.abs(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-xs text-[#566C6A] block">
                            {transaction.date} • {transaction.time}
                        </span>
                    </div>

                    {/* Breakdown */}
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center justify-between py-1.5 border-b border-[#D3DEDB]/60">
                            <span className="text-[#566C6A]">Reference Code</span>
                            <span className="font-mono text-[#0D2322] font-bold">
                                {transaction.referenceCode}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-[#D3DEDB]/60">
                            <span className="text-[#566C6A]">Payment Method</span>
                            <span className="text-[#0D2322] font-semibold">
                                {transaction.paymentMethod}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-[#D3DEDB]/60">
                            <span className="text-[#566C6A]">Category</span>
                            <span className="text-[#0D2322] font-semibold">
                                {transaction.category}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-[#D3DEDB]/60">
                            <span className="text-[#566C6A]">Cashback Earned</span>
                            <span className="text-[#059669] font-bold">
                                {transaction.cashback}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-[#566C6A]">Service Fee</span>
                            <span className="text-[#0D2322] font-bold">₱0.00 (Waived)</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col gap-2 pt-6 mt-4 border-t border-[#D3DEDB]">
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white text-sm font-bold hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#D97706]/30 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span>Download PDF Receipt</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleShare}
                        className="w-full py-2.5 rounded-xl bg-[#F4F7F6] text-[#0D2322] text-sm font-bold hover:bg-[#EDF4F2] transition-colors flex items-center justify-center gap-2 border border-[#D3DEDB] cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[#D97706]">share</span>
                        <span>Share Receipt Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
