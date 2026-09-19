"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface QuickSendModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPayee?: string;
    onSendSuccess?: (amount: number, recipient: string) => void;
}

export function QuickSendModal({
    isOpen,
    onClose,
    initialPayee = "",
    onSendSuccess,
}: QuickSendModalProps) {
    const [recipient, setRecipient] = useState(initialPayee);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRecipient(initialPayee);
            setAmount("");
            setNote("");
        }
    }, [isOpen, initialPayee]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Invalid Amount", {
                description: "Please enter a valid transfer amount greater than ₱0.00.",
            });
            return;
        }

        if (!recipient.trim()) {
            toast.error("Missing Recipient", {
                description: "Please enter a mobile number or beneficiary name.",
            });
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
            toast.success("Transfer Completed!", {
                description: `Successfully sent ₱${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} to ${recipient} with zero fees.`,
            });
            if (onSendSuccess) {
                onSendSuccess(numAmount, recipient);
            }
        }, 600);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1C1B]/70 backdrop-blur-xs transition-opacity duration-200">
            <div className="fixed inset-0" onClick={onClose} />

            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#D3DEDB] transform transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-[#D3DEDB]">
                    <h3 className="text-lg font-bold text-[#0D2322]">
                        Send Money
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#566C6A] hover:bg-[#F4F7F6] transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                            To Recipient
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#566C6A]">person</span>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="0917-XXX-XXXX or contact name"
                                required
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F4F7F6] text-[#0D2322] text-sm border border-[#D3DEDB] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A]">
                                Amount (PHP)
                            </label>
                            <span className="text-xs text-[#566C6A]">
                                Max Avail: <strong className="text-[#0D2322]">₱124,500.00</strong>
                            </span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-2.5 text-lg font-bold text-[#566C6A]">₱</span>
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                max="124500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                className="w-full h-12 pl-9 pr-4 rounded-xl bg-[#F4F7F6] text-[#0D2322] text-xl font-bold border border-[#D3DEDB] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                            Optional Message / Purpose
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. Lunch split, Groceries, Project payment"
                            className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-[#0D2322] text-sm border border-[#D3DEDB] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all"
                        />
                    </div>

                    <div className="p-3 rounded-xl bg-[#E8F5F1] border border-[#BCE3D6] flex items-center justify-between text-xs">
                        <span className="text-[#059669] font-semibold">
                            InstaPay / P2P Rails Fee
                        </span>
                        <span className="text-[#059669] font-extrabold">
                            FREE (0.00)
                        </span>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl bg-[#F4F7F6] text-[#0D2322] font-bold text-sm hover:bg-[#EDF4F2] transition-colors border border-[#D3DEDB] cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white font-bold text-sm hover:brightness-105 transition-all shadow-md shadow-[#D97706]/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            <span>{isSubmitting ? "Transferring..." : "Confirm & Send"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
