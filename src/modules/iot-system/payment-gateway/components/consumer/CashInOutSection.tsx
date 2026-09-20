"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "../PaymentIcon";

interface CashInOutSectionProps {
    balance: number;
    onTopUpSuccess?: (amount: number, method: string) => void;
}

export function CashInOutSection({ balance, onTopUpSuccess }: CashInOutSectionProps) {
    const [activeSubTab, setActiveSubTab] = useState<"cash-in" | "cash-out" | "gov-aid" | "remittance">("cash-in");

    // Cash-In States
    const [cashInAmount, setCashInAmount] = useState("500");
    const [bankChannel, setBankChannel] = useState<"instapay" | "pesonet">("instapay");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Virtual Account State
    const [virtualAccountCopied, setVirtualAccountCopied] = useState(false);
    const virtualAccountNum = "9820-0192-8841-0029";

    // MTCN State
    const [mtcnCode, setMtcnCode] = useState("");
    const [remittancePartner, setRemittancePartner] = useState("Western Union");

    // Gov Subsidy State
    const [nationalId, setNationalId] = useState("");
    const [subsidyProgram, setSubsidyProgram] = useState("4Ps Pantawid Pamilya");

    // Cash-Out State
    const [cashOutAmount, setCashOutAmount] = useState("");
    const [cashOutDest, setCashOutDest] = useState("BDO Unibank");
    const [destAccount, setDestAccount] = useState("");

    // Cash-In Handler (Sec. A.1)
    const handleCashIn = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(cashInAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Invalid Amount", { description: "Please enter a valid cash-in amount." });
            return;
        }
        if (bankChannel === "instapay" && amt > 50000) {
            toast.error("Limit Exceeded", { description: "InstaPay is capped at PHP 50,000.00 max per transaction." });
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            if (onTopUpSuccess) onTopUpSuccess(amt, `Bank Push (${bankChannel.toUpperCase()})`);
            toast.success("Cash-In Successful", {
                description: `Successfully credited ₱${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })} via ${bankChannel.toUpperCase()}.`,
            });
        }, 700);
    };

    // MTCN Remittance Claim (Sec. A.2, B.4)
    const handleClaimMtcn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mtcnCode.trim()) {
            toast.error("Missing MTCN", { description: "Please enter the 10-digit MTCN reference code." });
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            const credited = 12500;
            if (onTopUpSuccess) onTopUpSuccess(credited, `Remittance (${remittancePartner})`);
            toast.success("International Remittance Credited", {
                description: `Claimed USD 225.00 (₱${credited.toLocaleString()}) via ${remittancePartner} with locked FX rate USD/PHP 55.55.`,
            });
            setMtcnCode("");
        }, 800);
    };

    // Gov Subsidy Claim (Sec. A.5)
    const handleClaimSubsidy = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nationalId.trim()) {
            toast.error("Missing National ID", { description: "Please enter your PhilSys National ID number." });
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            const subsidyAmt = 3000;
            if (onTopUpSuccess) onTopUpSuccess(subsidyAmt, `Gov Social Subsidy (${subsidyProgram})`);
            toast.success("Government Social Subsidy Credited", {
                description: `Disbursed ₱${subsidyAmt.toLocaleString()} for ${subsidyProgram} matching PhilSys ID registry.`,
            });
            setNationalId("");
        }, 800);
    };

    // Cash-Out Outward Transfer (Sec. E.1, E.2)
    const handleCashOut = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(cashOutAmount);
        if (isNaN(amt) || amt <= 0 || amt > balance) {
            toast.error("Invalid Amount", { description: "Amount exceeds spendable balance." });
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Outward Bank Transfer Dispatched", {
                description: `Sent ₱${amt.toLocaleString()} to ${cashOutDest} (${destAccount}) via real-time rails.`,
            });
            setCashOutAmount("");
            setDestAccount("");
        }, 700);
    };

    const handleCopyVirtualAcc = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(virtualAccountNum.replace(/-/g, ""));
            setVirtualAccountCopied(true);
            setTimeout(() => setVirtualAccountCopied(false), 2000);
        }
        toast.info("Virtual Account Copied", {
            description: "Direct bank deposit account number copied to clipboard.",
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Sub-Nav Pill Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() => setActiveSubTab("cash-in")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeSubTab === "cash-in"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="account_balance" className="w-4 h-4 text-[#D97706]" />
                        Bank Cash-In (Sec. A.1)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSubTab("remittance")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeSubTab === "remittance"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="public" className="w-4 h-4 text-[#059669]" />
                        Partner Remittance (Sec. A.2)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSubTab("gov-aid")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeSubTab === "gov-aid"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="assured_workload" className="w-4 h-4 text-[#2563EB]" />
                        Government Subsidy (Sec. A.5)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSubTab("cash-out")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeSubTab === "cash-out"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="logout" className="w-4 h-4 text-[#C2410C]" />
                        Cash-Out &amp; Outward (Sec. E.1-2)
                    </span>
                </button>
            </div>

            {/* TAB 1: BANK CASH-IN & VIRTUAL ACCOUNT */}
            {activeSubTab === "cash-in" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Bank Top-up Form */}
                    <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-[#0D2322]">Bank Transfer Cash-In</h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#0F5B46] text-[10px] font-mono font-bold border border-[#BCE3D6]">
                                    Sec. A.1
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A] mt-0.5">
                                Real-time InstaPay (up to ₱50,000) or batch PESONet for high-value funding.
                            </p>
                        </div>

                        <form onSubmit={handleCashIn} className="flex flex-col gap-4">
                            {/* Rail Selector */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1.5">
                                    Interbank Rail
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setBankChannel("instapay")}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                            bankChannel === "instapay"
                                                ? "bg-[#0D2322] text-white border-[#0D2322]"
                                                : "bg-[#F4F7F6] text-[#0D2322] border-[#D3DEDB] hover:border-[#0D2322]/40"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between font-bold text-xs">
                                            <span>InstaPay Instant</span>
                                            <span className="text-[10px] text-[#D97706] font-mono">0.00s</span>
                                        </div>
                                        <p className={`text-[11px] mt-1 ${bankChannel === "instapay" ? "text-gray-300" : "text-[#566C6A]"}`}>
                                            Up to ₱50,000/tx • Real-time
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setBankChannel("pesonet")}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                            bankChannel === "pesonet"
                                                ? "bg-[#0D2322] text-white border-[#0D2322]"
                                                : "bg-[#F4F7F6] text-[#0D2322] border-[#D3DEDB] hover:border-[#0D2322]/40"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between font-bold text-xs">
                                            <span>PESONet Batch</span>
                                            <span className="text-[10px] text-[#059669] font-mono">Same-Day</span>
                                        </div>
                                        <p className={`text-[11px] mt-1 ${bankChannel === "pesonet" ? "text-gray-300" : "text-[#566C6A]"}`}>
                                            Unlimited • Cutoff clearing
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Top-Up Amount (PHP)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-lg font-bold text-[#566C6A]">₱</span>
                                    <input
                                        type="number"
                                        value={cashInAmount}
                                        onChange={(e) => setCashInAmount(e.target.value)}
                                        min="100"
                                        max={bankChannel === "instapay" ? 50000 : 500000}
                                        step="50"
                                        required
                                        className="w-full h-11 pl-9 pr-4 rounded-xl bg-[#F4F7F6] text-lg font-bold text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:border-[#D97706] focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="flex items-center gap-2">
                                {[500, 1000, 2500, 5000, 10000].map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setCashInAmount(amt.toString())}
                                        className="flex-1 py-1.5 rounded-lg bg-[#EDF2F1] hover:bg-[#D3DEDB] text-[#0D2322] text-xs font-semibold font-mono transition-colors cursor-pointer"
                                    >
                                        +₱{amt.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white font-bold text-sm hover:brightness-105 transition-all shadow-md shadow-[#D97706]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                                <PaymentIcon name="add_card" className="w-4 h-4" />
                                <span>{isSubmitting ? "Initiating Interbank Push..." : "Confirm Bank Cash-In"}</span>
                            </button>
                        </form>
                    </div>

                    {/* Virtual Account Number Card (Sec. A.4) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                                        Virtual Account (Sec. A.4)
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-[#EDF2F1] text-[#0D2322] text-[10px] font-bold font-mono">
                                        Dedicated Rail
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-[#0D2322] mt-2">
                                    Personal Deposit Account Number
                                </h4>
                                <p className="text-xs text-[#566C6A] mt-1 leading-relaxed">
                                    Receive direct funds from any Philippine bank via account number lookup without exposing your personal mobile number.
                                </p>

                                <div className="p-3.5 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] my-4 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-[#566C6A] uppercase tracking-wider font-semibold block">
                                            Map-ePay Virtual Clearing Acc
                                        </span>
                                        <span className="text-base font-extrabold text-[#0D2322] font-mono tracking-wider">
                                            {virtualAccountNum}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCopyVirtualAcc}
                                        className="p-2 rounded-lg bg-white hover:bg-[#EDF2F1] border border-[#D3DEDB] text-[#0D2322] transition-colors cursor-pointer"
                                        title="Copy Virtual Account"
                                    >
                                        <PaymentIcon
                                            name={virtualAccountCopied ? "check" : "content_copy"}
                                            className="w-4 h-4 text-[#D97706]"
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Promotional Purse Info (Sec. A.6) */}
                            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2.5">
                                <PaymentIcon name="redeem" className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block">Promotional Cashback Purse (Sec. A.6)</span>
                                    <span className="text-[11px] text-[#B45309]">
                                        Active Balance: <strong>₱150.00</strong> • Auto-deducted on eligible merchant checkout sessions. Expires in 14 days.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: PARTNER REMITTANCE (Sec. A.2, B.4) */}
            {activeSubTab === "remittance" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] max-w-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#0D2322]">Claim Inbound Remittance</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#0F5B46] text-[10px] font-mono font-bold border border-[#BCE3D6]">
                            Sec. A.2 / B.4
                        </span>
                    </div>
                    <p className="text-xs text-[#566C6A] mb-4">
                        Claim money sent via Western Union, MoneyGram, or Ria with automatic MTCN verification and upfront FX lock.
                    </p>

                    <form onSubmit={handleClaimMtcn} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                Remittance Partner
                            </label>
                            <select
                                value={remittancePartner}
                                onChange={(e) => setRemittancePartner(e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl bg-[#F4F7F6] text-sm text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                            >
                                <option value="Western Union">Western Union (Worldwide)</option>
                                <option value="MoneyGram">MoneyGram International</option>
                                <option value="Ria Financial">Ria Money Transfer</option>
                                <option value="Alipay+ Cross-Border">Alipay+ Global Rails</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                10-Digit MTCN / Reference Code
                            </label>
                            <input
                                type="text"
                                value={mtcnCode}
                                onChange={(e) => setMtcnCode(e.target.value)}
                                placeholder="e.g. 190-281-9921"
                                required
                                className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-sm font-mono font-bold text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                            />
                        </div>

                        <div className="p-3 rounded-xl bg-[#E8F5F1] border border-[#BCE3D6] text-xs text-[#0F5B46] flex items-center justify-between">
                            <span>Locked FX Conversion Rate:</span>
                            <span className="font-bold font-mono">1 USD = 55.55 PHP</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="py-3 rounded-xl bg-[#0D2322] text-white font-bold text-sm hover:bg-[#163331] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            <PaymentIcon name="check_circle" className="w-4 h-4 text-[#D97706]" />
                            <span>{isSubmitting ? "Validating MTCN..." : "Validate & Credit to Wallet"}</span>
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 3: GOVERNMENT SOCIAL SUBSIDY (Sec. A.5) */}
            {activeSubTab === "gov-aid" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] max-w-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#0D2322]">Government Social Subsidy Direct Disbursement</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF] text-[10px] font-mono font-bold border border-[#BFDBFE]">
                            Sec. A.5
                        </span>
                    </div>
                    <p className="text-xs text-[#566C6A] mb-4">
                        Automated cash assistance disbursements (4Ps, TUPAD, Social Pension) authenticated via PhilSys National ID registry.
                    </p>

                    <form onSubmit={handleClaimSubsidy} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                Aid Program
                            </label>
                            <select
                                value={subsidyProgram}
                                onChange={(e) => setSubsidyProgram(e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl bg-[#F4F7F6] text-sm text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                            >
                                <option value="4Ps Pantawid Pamilya">DSWD: 4Ps Pantawid Pamilyang Pilipino Program</option>
                                <option value="TUPAD DOLE Aid">DOLE: TUPAD Emergency Employment Subsidy</option>
                                <option value="Social Pension Senior">NCSC: Indigent Senior Citizen Social Pension</option>
                                <option value="DA Fertilizer Subsidy">DA: Fuel &amp; Fertilizer Cash Discount</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                PhilSys National ID (16-Digit PCN)
                            </label>
                            <input
                                type="text"
                                value={nationalId}
                                onChange={(e) => setNationalId(e.target.value)}
                                placeholder="1234-5678-9012-3456"
                                required
                                className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-sm font-mono font-bold text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="py-3 rounded-xl bg-[#1E3A8A] text-white font-bold text-sm hover:bg-[#1E40AF] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            <PaymentIcon name="verified_user" className="w-4 h-4 text-emerald-300" />
                            <span>{isSubmitting ? "Matching PhilSys Registry..." : "Verify Identity & Disburse Subsidy"}</span>
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 4: CASH-OUT & OUTWARD DISBURSEMENT (Sec. E.1, E.2, B.3) */}
            {activeSubTab === "cash-out" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB]">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-[#0D2322]">Outward Bank Cash-Out</h3>
                            <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-mono font-bold border border-[#FDE68A]">
                                Sec. E.1 / E.2
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A] mb-4">
                            Transfer wallet balance to any Philippine bank or e-wallet destination.
                        </p>

                        <form onSubmit={handleCashOut} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Destination Bank / Institution
                                </label>
                                <select
                                    value={cashOutDest}
                                    onChange={(e) => setCashOutDest(e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-xl bg-[#F4F7F6] text-sm text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                                >
                                    <option value="BDO Unibank">BDO Unibank (InstaPay)</option>
                                    <option value="Bank of the Philippine Islands">BPI (InstaPay)</option>
                                    <option value="Metrobank">Metrobank (InstaPay)</option>
                                    <option value="UnionBank of the Philippines">UnionBank of the Philippines</option>
                                    <option value="Land Bank of the Philippines">Landbank (PESONet)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Destination Account Number
                                </label>
                                <input
                                    type="text"
                                    value={destAccount}
                                    onChange={(e) => setDestAccount(e.target.value)}
                                    placeholder="10 to 12-digit account number"
                                    required
                                    className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-sm font-mono font-bold text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A]">
                                        Amount to Cash-Out
                                    </label>
                                    <span className="text-xs text-[#566C6A]">
                                        Avail: <strong>₱{balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-lg font-bold text-[#566C6A]">₱</span>
                                    <input
                                        type="number"
                                        value={cashOutAmount}
                                        onChange={(e) => setCashOutAmount(e.target.value)}
                                        max={balance}
                                        min="100"
                                        required
                                        className="w-full h-11 pl-9 pr-4 rounded-xl bg-[#F4F7F6] text-lg font-bold text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="py-3 rounded-xl bg-[#0D2322] text-white font-bold text-sm hover:bg-[#163331] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                                <PaymentIcon name="send" className="w-4 h-4 text-[#D97706]" />
                                <span>{isSubmitting ? "Dispatching Outflow..." : "Confirm Outward Transfer"}</span>
                            </button>
                        </form>
                    </div>

                    {/* Padala Cash Pick-up info (Sec. B.3) */}
                    <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                                    Cash Pick-Up (Sec. B.3)
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-[#EDF2F1] text-[#0D2322] text-[10px] font-bold">
                                    Padala Rails
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-[#0D2322] mt-2">
                                Over-the-Counter Branch Pick-Up
                            </h4>
                            <p className="text-xs text-[#566C6A] mt-1 leading-relaxed">
                                Beneficiaries without bank accounts can claim funds at over 15,000 partner branches nationwide using claim code and valid ID.
                            </p>

                            <div className="mt-4 flex flex-col gap-2 text-xs">
                                <div className="p-2.5 rounded-lg bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                    <span className="font-semibold text-[#0D2322]">Palawan Express Pera Padala</span>
                                    <span className="text-[#059669] font-bold">Instant</span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                    <span className="font-semibold text-[#0D2322]">Cebuana Lhuillier</span>
                                    <span className="text-[#059669] font-bold">Instant</span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-[#F4F7F6] border border-[#D3DEDB] flex items-center justify-between">
                                    <span className="font-semibold text-[#0D2322]">M Lhuillier Financial</span>
                                    <span className="text-[#059669] font-bold">Instant</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#D3DEDB] text-[11px] text-[#566C6A]">
                            <span>Zero hidden fees. Standard padala carrier surcharge applies at pickup.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
