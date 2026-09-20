"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "../PaymentIcon";
import { KYCTier } from "../../types";

interface SecurityKYCSectionProps {
    cardUid: string;
}

export function SecurityKYCSection({ cardUid }: SecurityKYCSectionProps) {
    const [kycTier, setKycTier] = useState<KYCTier>("Basic");
    const [isUpgradingKyc, setIsUpgradingKyc] = useState(false);
    const [selectedIdType, setSelectedIdType] = useState("Philippine Passport");
    const [idNumber, setIdNumber] = useState("");

    // Security Toggles (Sec. H.5, H.6, H.9)
    const [biometricsEnabled, setBiometricsEnabled] = useState(true);
    const [otpSmsEnabled, setOtpSmsEnabled] = useState(true);
    const [isAccountFrozen, setIsAccountFrozen] = useState(false);

    // Linked Accounts (Sec. H.7)
    const [linkedCards] = useState([
        { id: "1", name: "BPI Gold Debit", last4: "4920", isDefault: true },
        { id: "2", name: "UnionBank Miles+", last4: "8831", isDefault: false },
    ]);

    // Dispute Filing (Sec. H.8)
    const [disputeTxId, setDisputeTxId] = useState("");
    const [disputeReason, setDisputeReason] = useState("Duplicate charge at POS terminal");
    const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

    // Virtual & Physical Card Issuance (Sec. G.2)
    const [virtualCardRequested, setVirtualCardRequested] = useState(false);

    const handleKycUpgrade = (e: React.FormEvent) => {
        e.preventDefault();
        if (!idNumber.trim()) {
            toast.error("Missing ID Number", { description: "Please enter your government ID number." });
            return;
        }

        setIsUpgradingKyc(true);
        setTimeout(() => {
            setIsUpgradingKyc(false);
            setKycTier("Fully Verified");
            toast.success("KYC Tier Upgrade Approved!", {
                description: `Government ID (${selectedIdType}) and biometric selfie matched. Daily outflow limit increased to ₱100,000.00.`,
            });
            setIdNumber("");
        }, 1000);
    };

    const handleToggleFreeze = () => {
        const nextState = !isAccountFrozen;
        setIsAccountFrozen(nextState);
        if (nextState) {
            toast.warning("Account Operations Frozen (Sec. H.9)", {
                description: "Emergency kill switch active. In-flight and outward debits suspended.",
            });
        } else {
            toast.success("Account Unfrozen", {
                description: "Wallet operations restored via secondary biometric authentication.",
            });
        }
    };

    const handleSubmitDispute = (e: React.FormEvent) => {
        e.preventDefault();
        if (!disputeTxId.trim()) {
            toast.error("Enter Reference", { description: "Please enter transaction reference code." });
            return;
        }
        setIsSubmittingDispute(true);
        setTimeout(() => {
            setIsSubmittingDispute(false);
            toast.success("Dispute Ticket Filed (Sec. H.8)", {
                description: `Ticket #DS-${Math.floor(10000 + Math.random() * 90000)} dispatched to back-office arbitration.`,
            });
            setDisputeTxId("");
        }, 800);
    };

    const handleIssueVirtualCard = () => {
        setVirtualCardRequested(true);
        toast.success("Virtual Card Issued (Sec. G.2)", {
            description: "Tokenized 16-digit virtual Visa card generated for secure online spending.",
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Top Tier Status Banner */}
            <div className="p-6 rounded-2xl bg-white border border-[#D3DEDB] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0D2322] flex items-center justify-center text-[#D97706] shadow-sm">
                        <PaymentIcon name="verified_user" className="w-6 h-6 text-[#D97706]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-[#0D2322]">KYC Tier Status:</h3>
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                                    kycTier === "Fully Verified"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                        : "bg-amber-100 text-amber-800 border border-amber-300"
                                }`}
                            >
                                {kycTier}
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A] mt-0.5">
                            {kycTier === "Fully Verified"
                                ? "Highest regulatory tier unlocked • ₱100k daily outward • ₱500k monthly ceiling"
                                : "Basic Tier • ₱50,000 daily outflow limit • Upgrade below for higher caps"}
                        </p>
                    </div>
                </div>

                {/* Account Freeze Kill Switch (Sec. H.9) */}
                <button
                    type="button"
                    onClick={handleToggleFreeze}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isAccountFrozen
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                    }`}
                >
                    <PaymentIcon name={isAccountFrozen ? "lock_open" : "lock"} className="w-4 h-4" />
                    <span>{isAccountFrozen ? "Unfreeze Account" : "Emergency Account Freeze (Sec. H.9)"}</span>
                </button>
            </div>

            {/* KYC Upgrade & Limits Grid (Sec. H.2, H.4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form: KYC Upgrade (Sec. H.2) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-[#0D2322]">Upgrade to Fully Verified Tier</h4>
                            <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#0F5B46] text-[10px] font-mono font-bold border border-[#BCE3D6]">
                                Sec. H.2
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A] mb-4">
                            Submit your Philippine government-issued ID and live biometric selfie to unlock higher limits.
                        </p>

                        {kycTier === "Fully Verified" ? (
                            <div className="p-4 rounded-xl bg-[#E8F5F1] border border-[#BCE3D6] text-xs text-[#0F5B46] flex items-center gap-3">
                                <PaymentIcon name="check_circle" className="w-6 h-6 text-[#059669] shrink-0" />
                                <div>
                                    <span className="font-bold block text-sm">You are Fully Verified</span>
                                    <span>All limits and cross-border capabilities are active under BSP Circular 982.</span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleKycUpgrade} className="flex flex-col gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                        Primary Valid ID
                                    </label>
                                    <select
                                        value={selectedIdType}
                                        onChange={(e) => setSelectedIdType(e.target.value)}
                                        className="w-full h-11 px-3.5 rounded-xl bg-[#F4F7F6] text-sm text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                                    >
                                        <option value="Philippine Passport">Philippine Passport (DFA)</option>
                                        <option value="PhilSys National ID">PhilSys National ID (PCN)</option>
                                        <option value="Driver's License">Driver&apos;s License (LTO)</option>
                                        <option value="UMID Card">Unified Multi-Purpose ID (UMID)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                        ID Document Number
                                    </label>
                                    <input
                                        type="text"
                                        value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)}
                                        placeholder="e.g. P9018281A"
                                        required
                                        className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-sm font-mono font-bold text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                                    />
                                </div>

                                <div className="p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between text-xs text-[#566C6A]">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <PaymentIcon name="photo_camera" className="w-4 h-4 text-[#D97706]" />
                                        Live Biometric Selfie Scan
                                    </span>
                                    <span className="font-bold text-[#059669]">Camera Ready</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUpgradingKyc}
                                    className="mt-2 py-3 rounded-xl bg-[#0D2322] text-white font-bold text-xs hover:bg-[#163331] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    <PaymentIcon name="verified" className="w-4 h-4 text-[#D97706]" />
                                    <span>{isUpgradingKyc ? "Verifying with Registry..." : "Submit Biometric Verification"}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Spending Limits Comparison (Sec. H.4) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-[#0D2322]">Transaction Limits Matrix</h4>
                            <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-mono font-bold border border-[#FDE68A]">
                                Sec. H.4
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A] mb-3">
                            Current regulatory caps per Temporary Business Rules (Page 1).
                        </p>

                        <div className="flex flex-col gap-2.5 text-xs">
                            <div className="p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                <span className="text-[#566C6A]">Daily Outflow Cap</span>
                                <span className="font-mono font-bold text-[#0D2322]">
                                    {kycTier === "Fully Verified" ? "₱100,000.00" : "₱50,000.00"}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                <span className="text-[#566C6A]">Monthly Cumulative Ceiling</span>
                                <span className="font-mono font-bold text-[#0D2322]">₱500,000.00</span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                <span className="text-[#566C6A]">InstaPay Max per Transaction</span>
                                <span className="font-mono font-bold text-[#0D2322]">₱50,000.00</span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                <span className="text-[#566C6A]">Contactless NFC Tap without PIN</span>
                                <span className="font-mono font-bold text-[#0D2322]">₱2,000.00</span>
                            </div>
                        </div>
                    </div>

                    <span className="text-[11px] text-[#566C6A] pt-3 border-t border-[#D3DEDB]">
                        Limits enforced automatically at the Core Ledger layer (Sec. M.2).
                    </span>
                </div>
            </div>

            {/* Authentication & Dispute Tools (Sec. H.5, H.6, H.7, H.8, G.2) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 2FA & Security Toggles (Sec. H.5, H.6) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                    <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                            Authentication (Sec. H.5 / H.6)
                        </span>
                        <h4 className="text-sm font-bold text-[#0D2322] mt-1 mb-4">
                            Biometric 2FA &amp; OTP
                        </h4>

                        <div className="flex flex-col gap-3 text-xs">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB]">
                                <div>
                                    <span className="font-bold text-[#0D2322] block">Biometric 2FA (FaceID/PIN)</span>
                                    <span className="text-[11px] text-[#566C6A]">For debits &gt; ₱2,000</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                                    className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                                        biometricsEnabled ? "bg-[#059669] text-white" : "bg-gray-300 text-gray-700"
                                    }`}
                                >
                                    {biometricsEnabled ? "ON" : "OFF"}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB]">
                                <div>
                                    <span className="font-bold text-[#0D2322] block">SMS OTP Verification</span>
                                    <span className="text-[11px] text-[#566C6A]">Out-of-band codes</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOtpSmsEnabled(!otpSmsEnabled)}
                                    className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                                        otpSmsEnabled ? "bg-[#059669] text-white" : "bg-gray-300 text-gray-700"
                                    }`}
                                >
                                    {otpSmsEnabled ? "ON" : "OFF"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <span className="text-[11px] text-[#566C6A] mt-3">
                        Protects against shoulder-surfing credential risk.
                    </span>
                </div>

                {/* Card Issuance & Linked Accounts (Sec. G.2, H.7) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                    <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                            Cards &amp; Accounts (Sec. G.2 / H.7)
                        </span>
                        <h4 className="text-sm font-bold text-[#0D2322] mt-1 mb-4">
                            Issuance &amp; Linked Sources
                        </h4>

                        <div className="flex flex-col gap-2 text-xs">
                            {linkedCards.map((c) => (
                                <div
                                    key={c.id}
                                    className="p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between"
                                >
                                    <div>
                                        <span className="font-bold text-[#0D2322] block">{c.name}</span>
                                        <span className="text-[11px] text-[#566C6A] font-mono">•••• {c.last4}</span>
                                    </div>
                                    {c.isDefault && (
                                        <span className="px-2 py-0.5 rounded bg-[#EDF2F1] text-[10px] font-bold text-[#0D2322]">
                                            Default
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleIssueVirtualCard}
                            disabled={virtualCardRequested}
                            className="mt-3 w-full py-2 rounded-xl bg-[#EDF2F1] hover:bg-[#D3DEDB] text-[#0D2322] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {virtualCardRequested ? "Virtual Token Active" : "+ Issue Virtual Visa Token"}
                        </button>
                    </div>

                    <span className="text-[11px] text-[#566C6A] mt-3">
                        Physical dual-interface smart card UID: <code>{cardUid}</code>
                    </span>
                </div>

                {/* Dispute / Chargeback Filing (Sec. H.8, H.10) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                    <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                            Disputes &amp; Support (Sec. H.8 / H.10)
                        </span>
                        <h4 className="text-sm font-bold text-[#0D2322] mt-1 mb-2">
                            File Transaction Dispute
                        </h4>

                        <form onSubmit={handleSubmitDispute} className="flex flex-col gap-2.5 text-xs">
                            <div>
                                <label className="font-bold text-[#566C6A] block mb-1">Transaction Ref</label>
                                <input
                                    type="text"
                                    value={disputeTxId}
                                    onChange={(e) => setDisputeTxId(e.target.value)}
                                    placeholder="TX-01928"
                                    required
                                    className="w-full h-9 px-3 rounded-lg bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322] font-mono"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-[#566C6A] block mb-1">Claim Reason</label>
                                <select
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    className="w-full h-9 px-2.5 rounded-lg bg-[#F4F7F6] border border-[#D3DEDB] text-[#0D2322]"
                                >
                                    <option value="Duplicate charge at POS terminal">Duplicate charge at POS terminal</option>
                                    <option value="Goods/services not delivered">Goods/services not delivered</option>
                                    <option value="Suspected unauthorized debit">Suspected unauthorized debit</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingDispute}
                                className="mt-1 py-2 rounded-lg bg-[#0D2322] text-white font-bold hover:bg-[#163331] cursor-pointer disabled:opacity-50"
                            >
                                Submit to Dispute Arbitration
                            </button>
                        </form>
                    </div>

                    <div className="pt-3 border-t border-[#D3DEDB] flex items-center justify-between text-xs text-[#566C6A]">
                        <span>24/7 Priority Desk:</span>
                        <span className="font-bold text-[#0D2322] font-mono">1-800-MAP-EPAY</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
