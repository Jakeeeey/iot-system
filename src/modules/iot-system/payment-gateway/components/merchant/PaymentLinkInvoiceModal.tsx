"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "../PaymentIcon";

interface PaymentLinkInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PaymentLinkInvoiceModal({ isOpen, onClose }: PaymentLinkInvoiceModalProps) {
    const [amount, setAmount] = useState("1250.00");
    const [invoiceRef, setInvoiceRef] = useState("INV-884102");
    const [customerName, setCustomerName] = useState("Juan dela Cruz");
    const [customerEmail, setCustomerEmail] = useState("juan.delacruz@example.ph");
    const [description, setDescription] = useState("Professional Services & Hardware Provisioning");
    const [expiryHours, setExpiryHours] = useState("24");
    const [generatedLink, setGeneratedLink] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Invalid Amount", { description: "Please enter a positive invoice amount." });
            return;
        }

        setIsGenerating(true);
        setTimeout(() => {
            const token = Math.random().toString(36).substring(2, 9);
            const link = `https://pay.map-epay.ph/checkout/${token}?ref=${encodeURIComponent(invoiceRef)}&amt=${numAmount.toFixed(2)}`;
            setGeneratedLink(link);
            setIsGenerating(false);
            toast.success("Dynamic Payment Link Active", {
                description: `Invoice ${invoiceRef} is ready for customer payment.`,
            });
        }, 400);
    };

    const handleCopy = () => {
        if (navigator.clipboard && generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            toast.success("Link Copied to Clipboard", { description: generatedLink });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-xl border border-[#D3DEDB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#0D2322] to-[#163331] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#D97706] text-white flex items-center justify-center">
                            <PaymentIcon name="add_link" className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold tracking-tight">Dynamic Payment Link &amp; Invoice</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-[#FEF3C7] font-bold border border-white/30">
                                    Sec. J.3
                                </span>
                            </div>
                            <p className="text-xs text-white/80">Itemized electronic checkout link dispatchable via chat or SMS</p>
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
                    <form onSubmit={handleGenerate} className="flex flex-col gap-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Invoice / Reference #
                                </label>
                                <input
                                    type="text"
                                    value={invoiceRef}
                                    onChange={(e) => setInvoiceRef(e.target.value)}
                                    className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:bg-white focus:outline-none focus:border-[#0D2322]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Payable Amount (PHP)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-xs font-bold text-[#566C6A]">₱</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full text-xs font-mono font-bold pl-7 pr-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:bg-white focus:outline-none focus:border-[#0D2322]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:bg-white focus:outline-none focus:border-[#0D2322]"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Customer Email / Phone
                                </label>
                                <input
                                    type="text"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:bg-white focus:outline-none focus:border-[#0D2322]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                Line Item Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full text-xs px-3 py-2 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:bg-white focus:outline-none focus:border-[#0D2322]"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A]">
                                    Expiry:
                                </label>
                                <select
                                    value={expiryHours}
                                    onChange={(e) => setExpiryHours(e.target.value)}
                                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] focus:outline-none"
                                >
                                    <option value="12">12 Hours</option>
                                    <option value="24">24 Hours (Standard)</option>
                                    <option value="72">3 Days</option>
                                    <option value="168">7 Days</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="px-5 py-2 rounded-xl bg-[#0D2322] text-white text-xs font-bold hover:bg-[#163331] transition-all flex items-center gap-1.5 shadow-md shadow-[#0D2322]/20 cursor-pointer disabled:opacity-60"
                            >
                                <PaymentIcon name="add_link" className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>{isGenerating ? "Generating..." : "Generate Link & QR"}</span>
                            </button>
                        </div>
                    </form>

                    {/* Generated Link Output Area */}
                    {generatedLink && (
                        <div className="p-4 rounded-xl bg-[#EDF4F2] border border-[#D3DEDB] flex flex-col gap-3 animate-in fade-in">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#0D2322] uppercase tracking-wider flex items-center gap-1.5">
                                    <PaymentIcon name="check_circle" className="w-4 h-4 text-[#059669]" />
                                    Active Checkout URL Generated
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#566C6A] font-mono border border-[#D3DEDB]">
                                    Expires in {expiryHours}h
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={generatedLink}
                                    className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white border border-[#D3DEDB] text-[#0D2322] select-all"
                                />
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="px-3 py-2 rounded-lg bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                    <PaymentIcon name="content_copy" className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-[#566C6A] pt-1 border-t border-[#D3DEDB]">
                                <span>Supports QR Ph, Visa, Mastercard, Maya &amp; GCash</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        toast.info("Opening Checkout Preview", { description: `Directing to ${generatedLink}` });
                                    }}
                                    className="text-[#0D2322] font-bold hover:underline"
                                >
                                    Test Customer Checkout &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 bg-[#F4F7F6] border-t border-[#D3DEDB] flex justify-end">
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
