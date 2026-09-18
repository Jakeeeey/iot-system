"use client";

import React from "react";
import { X, CheckCircle2, Download, Share2 } from "lucide-react";
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

            <div className="relative z-10 w-full max-w-md h-full bg-white dark:bg-card shadow-2xl p-6 flex flex-col justify-between border-l border-[#D3DEDB] dark:border-border overflow-y-auto animate-in slide-in-from-right duration-300">
                <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#D3DEDB] dark:border-border">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#566C6A] dark:text-muted-foreground">
                            Official Digital Receipt
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#566C6A] hover:bg-[#EDF4F2] dark:hover:bg-muted transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Receipt Card Container */}
                    <div className="bg-[#F4F7F6] dark:bg-muted/60 rounded-2xl p-6 text-center relative overflow-hidden my-5 border border-[#D3DEDB] dark:border-border">
                        <div className="w-12 h-12 rounded-full bg-[#E8F5F1] text-[#059669] mx-auto flex items-center justify-center mb-3 border border-[#BCE3D6]">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#059669] block">
                            Payment Successfully Settled
                        </span>
                        <h3 className="text-lg font-bold text-[#0D2322] dark:text-foreground mt-1 block">
                            {transaction.merchant}
                        </h3>
                        <div className="text-3xl font-mono font-extrabold text-[#D97706] my-2">
                            {transaction.amount < 0 ? "-" : "+"}₱{Math.abs(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-xs text-[#566C6A] dark:text-muted-foreground block">
                            {transaction.date} • {transaction.time}
                        </span>
                    </div>

                    {/* Breakdown */}
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center justify-between py-1.5 border-b border-[#D3DEDB]/60 dark:border-border/60">
                            <span className="text-[#566C6A] dark:text-muted-foreground">Reference Code</span>
                            <span className="font-mono text-[#0D2322] dark:text-foreground font-bold">
                                {transaction.referenceCode}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-[#D3DEDB]/60 dark:border-border/60">
                            <span className="text-[#566C6A] dark:text-muted-foreground">Payment Method</span>
                            <span className="text-[#0D2322] dark:text-foreground font-semibold">
                                {transaction.paymentMethod}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-[#D3DEDB]/60 dark:border-border/60">
                            <span className="text-[#566C6A] dark:text-muted-foreground">Category</span>
                            <span className="text-[#0D2322] dark:text-foreground font-semibold">
                                {transaction.category}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-[#D3DEDB]/60 dark:border-border/60">
                            <span className="text-[#566C6A] dark:text-muted-foreground">Cashback Earned</span>
                            <span className="text-[#059669] font-bold">
                                {transaction.cashback}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-[#566C6A] dark:text-muted-foreground">Service Fee</span>
                            <span className="text-[#0D2322] dark:text-foreground font-bold">₱0.00 (Waived)</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col gap-2 pt-6 mt-4 border-t border-[#D3DEDB] dark:border-border">
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white text-sm font-bold hover:brightness-105 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-[#D97706]/30 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download PDF Receipt</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleShare}
                        className="w-full py-2.5 rounded-xl bg-[#F4F7F6] dark:bg-muted text-[#0D2322] dark:text-foreground text-sm font-bold hover:bg-[#EDF4F2] transition-colors flex items-center justify-center gap-2 border border-[#D3DEDB] dark:border-border cursor-pointer"
                    >
                        <Share2 className="w-4 h-4 text-[#D97706]" />
                        <span>Share Receipt Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
