"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "../PaymentIcon";
import { PaymentGatewayService } from "../../services/payment-gateway.service";

interface TransfersSectionProps {
    balance: number;
    onSendSuccess?: (amount: number, recipient: string) => void;
}

interface PendingTransfer {
    id: string;
    recipient: string;
    amount: number;
    rail: string;
    status: "Queued" | "Cancelled" | "Refunded";
    canCancel: boolean;
    timestamp: string;
}

export function TransfersSection({ balance, onSendSuccess }: TransfersSectionProps) {
    const [recipientInput, setRecipientInput] = useState("");
    const [sendAmount, setSendAmount] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-flight validation state (Sec. B.1)
    const [confirmedRecipient, setConfirmedRecipient] = useState<{ phone: string; maskedName: string } | null>(null);

    // Pre-settlement cancellation queue (Sec. B.5, B.6)
    const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([
        {
            id: "TRX-BATCH-9941",
            recipient: "JU** D** (0918-291-0021)",
            amount: 1200.0,
            rail: "PESONet Batch Outward",
            status: "Queued",
            canCancel: true,
            timestamp: "2 mins ago",
        },
        {
            id: "TRX-REV-8812",
            recipient: "SM Retail Counter #4",
            amount: 540.0,
            rail: "QR Ph P2M Refund",
            status: "Refunded",
            canCancel: false,
            timestamp: "Today, 10:14 AM",
        },
    ]);

    // Handle initial lookup
    const handleCheckRecipient = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientInput.trim()) {
            toast.error("Enter Recipient", { description: "Please enter mobile number or Map-ePay ID." });
            return;
        }

        const lookup = PaymentGatewayService.lookupMaskedRecipient(recipientInput);
        setConfirmedRecipient(lookup);
        toast.info("Recipient Found", {
            description: `Identity verified: ${lookup.maskedName}. Proceed to review transfer.`,
        });
    };

    // Execute atomic send (Sec. B.1)
    const handleExecuteSend = () => {
        const amt = parseFloat(sendAmount);
        if (isNaN(amt) || amt <= 0 || amt > balance) {
            toast.error("Invalid Amount", { description: "Amount exceeds spendable wallet balance." });
            return;
        }

        // Velocity check
        const velocityCheck = PaymentGatewayService.checkVelocityLimits(amt, "p2p", "Basic");
        if (!velocityCheck.allowed) {
            toast.error("Velocity Limit", { description: velocityCheck.reason });
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            if (onSendSuccess && confirmedRecipient) {
                onSendSuccess(amt, confirmedRecipient.maskedName);
            }
            toast.success("Transfer Completed!", {
                description: `Sent ₱${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })} to ${confirmedRecipient?.maskedName} with atomic ledger balance reflection.`,
            });
            setRecipientInput("");
            setSendAmount("");
            setNote("");
            setConfirmedRecipient(null);
        }, 600);
    };

    // Cancel in-flight scheduled/batch transfer (Sec. B.5)
    const handleCancelTransfer = (id: string) => {
        setPendingTransfers((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "Cancelled", canCancel: false } : t))
        );
        toast.success("Transfer Cancelled (Pre-Settlement)", {
            description: `Authorized transfer ${id} successfully revoked prior to clearing house batch cutoff.`,
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* P2P Send Form with Pre-Flight Masked Name Confirmation */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#0D2322]">Instant P2P Send Money</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#0F5B46] text-[10px] font-mono font-bold border border-[#BCE3D6]">
                            Sec. B.1
                        </span>
                    </div>
                    <p className="text-xs text-[#566C6A] mt-0.5">
                        Sub-second internal ledger transfer with pre-flight recipient verification to prevent mis-entry errors.
                    </p>
                </div>

                {!confirmedRecipient ? (
                    <form onSubmit={handleCheckRecipient} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                Recipient Mobile Number or Map-ePay ID
                            </label>
                            <div className="relative">
                                <PaymentIcon name="account_circle" className="absolute left-3.5 top-2.5 text-[#566C6A] w-5 h-5" />
                                <input
                                    type="text"
                                    value={recipientInput}
                                    onChange={(e) => setRecipientInput(e.target.value)}
                                    placeholder="0917-XXX-XXXX or @username"
                                    required
                                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F4F7F6] text-[#0D2322] text-sm border border-[#D3DEDB] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-[#0D2322] text-white font-bold text-xs hover:bg-[#163331] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <PaymentIcon name="search" className="w-4 h-4 text-[#D97706]" />
                            <span>Verify Recipient Identity</span>
                        </button>
                    </form>
                ) : (
                    <div className="p-4 rounded-xl bg-[#E8F5F1] border border-[#BCE3D6] flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PaymentIcon name="verified" className="w-5 h-5 text-[#059669]" />
                                <div>
                                    <span className="text-xs text-[#0F5B46] font-semibold block">Confirmed Legal Name:</span>
                                    <span className="text-base font-extrabold text-[#0D2322] font-mono">
                                        {confirmedRecipient.maskedName}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfirmedRecipient(null)}
                                className="text-xs text-[#0F5B46] hover:underline font-bold"
                            >
                                Change
                            </button>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A]">
                                    Amount to Send (PHP)
                                </label>
                                <span className="text-xs text-[#566C6A]">
                                    Avail: ₱{balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <input
                                type="number"
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                                placeholder="0.00"
                                min="1"
                                max={balance}
                                required
                                className="w-full h-11 px-4 rounded-xl bg-white text-lg font-bold font-mono text-[#0D2322] border border-[#BCE3D6] focus:outline-none"
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Optional message / purpose (e.g. Lunch share)"
                                className="w-full h-10 px-3 rounded-lg bg-white text-xs text-[#0D2322] border border-[#BCE3D6] focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setConfirmedRecipient(null)}
                                className="flex-1 py-2 rounded-lg bg-white border border-[#D3DEDB] text-xs font-bold text-[#566C6A] hover:bg-[#EDF2F1] cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteSend}
                                disabled={isSubmitting}
                                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white text-xs font-bold hover:brightness-105 shadow-sm cursor-pointer disabled:opacity-60"
                            >
                                {isSubmitting ? "Executing Atomic Debit..." : "Confirm & Send Instantly"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* In-Flight Transfers & Pre-Settlement Cancellation (Sec. B.5, B.6) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-[#0D2322]">In-Flight Batch &amp; Refunds</h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-mono font-bold border border-[#FDE68A]">
                            Sec. B.5 / B.6
                        </span>
                    </div>
                    <p className="text-xs text-[#566C6A] mb-4">
                        Cancel authorized outward batches before clearing windows or track core refunds.
                    </p>

                    <div className="flex flex-col gap-3">
                        {pendingTransfers.map((item) => (
                            <div
                                key={item.id}
                                className="p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col gap-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold text-[#0D2322]">{item.id}</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            item.status === "Queued"
                                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                                : item.status === "Cancelled"
                                                ? "bg-red-100 text-red-700 border border-red-300"
                                                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-[#566C6A]">
                                    <span>{item.recipient}</span>
                                    <span className="font-mono font-bold text-[#0D2322]">
                                        ₱{item.amount.toFixed(2)}
                                    </span>
                                </div>

                                {item.canCancel && (
                                    <button
                                        type="button"
                                        onClick={() => handleCancelTransfer(item.id)}
                                        className="mt-1 w-full py-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition-colors cursor-pointer"
                                    >
                                        Cancel Transfer (Pre-Settlement)
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-[#D3DEDB] text-[11px] text-[#566C6A]">
                    <span>Atomic balance locks prevent overdrafts during multi-hop clearing.</span>
                </div>
            </div>
        </div>
    );
}
