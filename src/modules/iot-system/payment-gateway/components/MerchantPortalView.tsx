"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { MerchantLedgerTransaction } from "../types";

const INITIAL_MERCHANT_LEDGER: MerchantLedgerTransaction[] = [];

export function MerchantPortalView() {
    const [searchQuery, setSearchQuery] = useState("");
    const [disputeSubmitted, setDisputeSubmitted] = useState(false);

    const handleCreateLink = () => {
        const link = `https://pay.apexpay.ph/checkout/${Math.random().toString(36).substring(2, 9)}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link);
        }
        toast.success("Payment Link Generated", {
            description: `Dynamic payment link copied to clipboard: ${link}`,
        });
    };

    const handleBirForm = () => {
        toast.info("BIR Form 2307 Generated", {
            description: "Withholding tax certificate generated for current settlement period.",
        });
    };

    const handleBatchPayout = () => {
        toast.success("Batch Payroll Queued", {
            description: "InstaPay batch remittance file queued for dispatch at cutoff.",
        });
    };

    const handleSoundboxAlert = () => {
        toast.info("Soundbox Voice Broadcast Tested", {
            description: "Speaker announcement sent: 'ApexPay received payment of ₱2,500.00'.",
        });
    };

    const handleSubmitEvidence = () => {
        setDisputeSubmitted(true);
        toast.success("POD Evidence Submitted", {
            description: "Proof of delivery uploaded for Dispute #DS-99042-VISA. Issuer notified.",
        });
    };

    const handleExportCsv = () => {
        toast.success("Exporting Merchant Ledger", {
            description: "Generating settlement CSV with BIR 16-2023 compliant withholding columns.",
        });
    };

    const filteredLedger = INITIAL_MERCHANT_LEDGER.filter((tx) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            tx.id.toLowerCase().includes(q) ||
            tx.cashier.toLowerCase().includes(q) ||
            tx.storeLocation.toLowerCase().includes(q) ||
            tx.railMethod.toLowerCase().includes(q)
        );
    });

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Top Context Ribbon */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] text-[11px] font-bold uppercase tracking-wider border border-[#D3DEDB]">
                            Store Fleet Standby
                        </span>
                        <span className="text-[#8B9F9D] text-xs">•</span>
                        <span className="text-[#566C6A] text-[11px] font-semibold tracking-tight font-mono">MID-DEFAULT</span>
                        <span className="text-[#8B9F9D] text-xs">•</span>
                        <span className="text-[11px] text-[#0D2322] font-bold">Standard Settlement Hub</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2322] tracking-tight">
                            Merchant Gateway Portal
                        </h1>
                        <span className="text-xs text-[#566C6A] font-medium hidden sm:inline">
                            Merchant Settlement Console
                        </span>
                    </div>
                </div>

                {/* Quick Action Bar */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#D3DEDB] rounded-xl shadow-xs">
                    <button
                        type="button"
                        onClick={handleCreateLink}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D97706] text-white text-xs hover:bg-[#B45309] transition-all shadow-sm shadow-[#D97706]/25 font-semibold cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_link</span>
                        <span>Dynamic Link / Invoice</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleBirForm}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EDF4F2] text-[#0D2322] text-xs hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] font-medium cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[#0D2322]">receipt</span>
                        <span>BIR 2307 Tax Form</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleBatchPayout}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EDF4F2] text-[#0D2322] text-xs hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] font-medium cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[#0D2322]">payments</span>
                        <span>Batch Payroll Payout</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleSoundboxAlert}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EDF4F2] text-[#0D2322] text-xs hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] font-medium cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[#0D2322]">volume_up</span>
                        <span>Soundbox Alerts</span>
                    </button>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">Today's Gross Volume</span>
                        <div className="flex items-center gap-1 text-[#566C6A] text-[11px] bg-[#EDF4F2] px-1.5 py-0.5 rounded font-bold border border-[#D3DEDB]">
                            <span className="material-symbols-outlined text-[14px]">horizontal_rule</span>
                            <span>0.0%</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[30px] sm:text-[32px] leading-tight font-extrabold text-[#0D2322] tracking-tight font-mono">
                            ₱0.00
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[#566C6A] text-xs">
                            <span>No transactions recorded today</span>
                        </div>
                    </div>
                    <div className="w-full bg-[#E7F0EF] h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#D97706] h-full rounded-full" style={{ width: "0%" }} />
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">Net Settled Funds</span>
                        <span className="text-[11px] text-[#0D2322] bg-[#E7F0EF] px-1.5 py-0.5 rounded font-bold border border-[#D3DEDB]">
                            T+0 Real-Time
                        </span>
                    </div>
                    <div>
                        <div className="text-[30px] sm:text-[32px] leading-tight font-extrabold text-[#0D2322] tracking-tight font-mono">
                            ₱0.00
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[#566C6A] text-xs">
                            <span>MDR Deductions: ₱0.00</span>
                        </div>
                    </div>
                    <div className="w-full bg-[#E7F0EF] h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#163331] h-full rounded-full" style={{ width: "0%" }} />
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">Active Terminals</span>
                        <span className="flex items-center gap-1 text-[11px] text-[#566C6A] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#8B9F9D]" />
                            Fleet Standby
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1 text-[30px] sm:text-[32px] leading-tight font-extrabold text-[#0D2322]">
                            <span className="font-mono">0</span>
                            <span className="text-[#566C6A] text-lg font-semibold font-sans">/ 0 Units</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[#566C6A] text-xs font-medium">
                            <span className="material-symbols-outlined text-[14px]">sensors</span>
                            <span>Fleet Standby • No active nodes</span>
                        </div>
                    </div>
                    <div className="flex gap-1 mt-4">
                        <div className="bg-[#D3DEDB] w-full h-1.5 rounded-full" />
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">Successful Transactions</span>
                        <span className="text-[11px] text-[#0F5B46] bg-[#E8F5F1] px-1.5 py-0.5 rounded font-bold border border-[#BCE3D6]">
                            100% Reliability
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1.5 text-[30px] sm:text-[32px] leading-tight font-extrabold text-[#0D2322]">
                            <span className="font-mono">0</span>
                            <span className="text-[#566C6A] text-sm font-medium font-sans">Settled</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[#566C6A] text-xs">
                            <span>0 Rejections • 0 Gateway Drop</span>
                        </div>
                    </div>
                    <div className="w-full bg-[#E7F0EF] h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#0F5B46] h-full rounded-full" style={{ width: "0%" }} />
                    </div>
                </div>
            </div>

            {/* Asymmetrical Split: Channel Liquidity & Fleet Status */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left (5 Cols): Checkout Performance */}
                <div className="xl:col-span-5 flex flex-col justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-[#D3DEDB]">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">Channel Liquidity</span>
                            <h2 className="text-xl font-bold text-[#0D2322]">Checkout Performance</h2>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-[#EDF4F2] text-[#0D2322] text-[11px] font-bold border border-[#D3DEDB]">
                            24h Real-Time
                        </span>
                    </div>

                    {/* Channel Metrics Bars */}
                    <div className="flex flex-col gap-4 my-auto">
                        {/* QR Ph */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-1.5 text-[#0D2322] font-semibold">
                                    <span className="material-symbols-outlined text-[#D97706] text-[18px]">qr_code_scanner</span>
                                    QR Ph National Rails (P2M)
                                </span>
                                <span className="text-[#0D2322] font-bold">
                                    0% <span className="text-[#566C6A] font-normal text-xs font-mono">(₱0.00)</span>
                                </span>
                            </div>
                            <div className="w-full bg-[#E7F0EF] h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#D97706] h-full rounded-full" style={{ width: "0%" }} />
                            </div>
                        </div>

                        {/* Contactless EMV */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-1.5 text-[#0D2322] font-semibold">
                                    <span className="material-symbols-outlined text-[#163331] text-[18px]">contactless</span>
                                    Contactless EMV (Visa / MC / JCB)
                                </span>
                                <span className="text-[#0D2322] font-bold">
                                    0% <span className="text-[#566C6A] font-normal text-xs font-mono">(₱0.00)</span>
                                </span>
                            </div>
                            <div className="w-full bg-[#E7F0EF] h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#163331] h-full rounded-full" style={{ width: "0%" }} />
                            </div>
                        </div>

                        {/* E-Commerce Checkout API */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-1.5 text-[#0D2322] font-semibold">
                                    <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">shopping_cart_checkout</span>
                                    E-Commerce Hosted Checkout API
                                </span>
                                <span className="text-[#0D2322] font-bold">
                                    0% <span className="text-[#566C6A] font-normal text-xs font-mono">(₱0.00)</span>
                                </span>
                            </div>
                            <div className="w-full bg-[#E7F0EF] h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: "0%" }} />
                            </div>
                        </div>

                        {/* OTC Traditional */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-1.5 text-[#0D2322] font-semibold">
                                    <span className="material-symbols-outlined text-[#566C6A] text-[18px]">store</span>
                                    Over-The-Counter Cash Voucher
                                </span>
                                <span className="text-[#0D2322] font-bold">
                                    0% <span className="text-[#566C6A] font-normal text-xs font-mono">(₱0.00)</span>
                                </span>
                            </div>
                            <div className="w-full bg-[#E7F0EF] h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#B4C5C2] h-full rounded-full" style={{ width: "0%" }} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Micro-Card Insights */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-[#EDF4F2] rounded-xl border border-[#D3DEDB]">
                        <div>
                            <span className="text-[11px] text-[#566C6A] uppercase tracking-wider block font-semibold">NFC Tap Velocity</span>
                            <span className="text-base font-bold text-[#0D2322]">Standby</span>
                        </div>
                        <div>
                            <span className="text-[11px] text-[#566C6A] uppercase tracking-wider block font-semibold">API Checkout SLA</span>
                            <span className="text-base font-bold text-[#0F5B46]">Ready (&lt;50ms)</span>
                        </div>
                    </div>
                </div>

                {/* Right Column (7 Cols): Chargeback Defense & POS Fleet Overview */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                    {/* Chargeback Defense Alert */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] border-l-4 border-l-[#0F5B46]">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#E8F5F1] text-[#0F5B46] flex items-center justify-center shrink-0 border border-[#BCE3D6]">
                                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-[#E8F5F1] text-[#0F5B46] text-[11px] font-bold border border-[#BCE3D6]">
                                            All Clear
                                        </span>
                                        <span className="text-[11px] text-[#566C6A] font-semibold font-mono">0 Active Disputes</span>
                                    </div>
                                    <h3 className="text-base font-bold text-[#0D2322] mt-1">
                                        No Chargebacks or Disputes Pending
                                    </h3>
                                    <p className="text-xs text-[#566C6A]">
                                        All merchant transactions are clear. Retrieval requests and customer claims will be logged here.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0 w-full md:w-auto">
                                <div className="flex items-center gap-1.5 text-[#0F5B46] font-bold text-xs">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    <span>Dispute Rate: 0.00%</span>
                                </div>
                                <button
                                    type="button"
                                    disabled
                                    className="mt-2 w-full md:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-[#F4F7F6] text-[#8B9F9D] border border-[#D3DEDB] cursor-not-allowed"
                                >
                                    No Actions Required
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Real-Time POS Terminal Fleet & Hardware Monitor */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] flex flex-col justify-between flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">Hardware Infrastructure</span>
                                <h2 className="text-xl font-bold text-[#0D2322]">Terminal Fleet Status</h2>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#EDF4F2] px-3 py-1 rounded-lg border border-[#D3DEDB]">
                                <span className="h-2 w-2 rounded-full bg-[#8B9F9D]" />
                                <span className="text-[11px] text-[#566C6A] font-bold">Fleet Standby</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Terminal 1 */}
                            <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-2 hover:border-[#0D2322]/40 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[#0D2322] text-[20px]">point_of_sale</span>
                                        <span className="text-sm text-[#0D2322] font-bold">Apex Hybrid Pro</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-md bg-[#EDF4F2] text-[#566C6A] border border-[#D3DEDB] text-[11px] font-bold">
                                        0 Online
                                    </span>
                                </div>
                                <p className="text-xs text-[#566C6A]">Dual Chip + NFC Contactless + Fallback Magstripe</p>
                                <div className="flex items-center justify-between text-[11px] text-[#566C6A]">
                                    <span className="flex items-center gap-1 font-medium">
                                        <span className="material-symbols-outlined text-[14px] text-[#8B9F9D]">battery_charging_full</span>
                                        Standby
                                    </span>
                                    <span className="font-semibold text-[#8B9F9D] font-mono">v4.1.2-PCI</span>
                                </div>
                            </div>

                            {/* Terminal 2 */}
                            <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-2 hover:border-[#0D2322]/40 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[#D97706] text-[20px]">speaker_phone</span>
                                        <span className="text-sm text-[#0D2322] font-bold">Apex Soundbox Q1</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-md bg-[#EDF4F2] text-[#566C6A] border border-[#D3DEDB] text-[11px] font-bold">
                                        0 Online
                                    </span>
                                </div>
                                <p className="text-xs text-[#566C6A]">Voice payment alert broadcast with 4G dual-SIM failover</p>
                                <div className="flex items-center justify-between text-[11px] text-[#566C6A]">
                                    <span className="flex items-center gap-1 font-medium">
                                        <span className="material-symbols-outlined text-[14px] text-[#8B9F9D]">wifi</span>
                                        Standby
                                    </span>
                                    <span className="font-semibold text-[#8B9F9D] font-mono">v2.0.8-Audio</span>
                                </div>
                            </div>

                            {/* Terminal 3 */}
                            <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-2 hover:border-[#0D2322]/40 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[#163331] text-[20px]">devices</span>
                                        <span className="text-sm text-[#0D2322] font-bold">Mobile Cashier mPOS</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-md bg-[#EDF4F2] text-[#566C6A] border border-[#D3DEDB] text-[11px] font-bold">
                                        0 Active
                                    </span>
                                </div>
                                <p className="text-xs text-[#566C6A]">Handheld queue-busting floor checkout units</p>
                                <div className="flex items-center justify-between text-[11px] text-[#566C6A]">
                                    <span className="flex items-center gap-1 text-[#566C6A] font-semibold">
                                        <span className="material-symbols-outlined text-[14px]">system_update</span>
                                        Standby
                                    </span>
                                    <span className="font-semibold text-[#8B9F9D] font-mono">v5.2.0-Patch</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#D3DEDB]">
                            <div className="flex items-center gap-4 text-xs text-[#566C6A] font-medium">
                                <span>Mesh Hub: <strong className="text-[#0D2322]">NCR-STANDBY</strong></span>
                                <span>Latency: <strong className="text-[#566C6A]">--</strong></span>
                                <span>Encryption: <strong className="text-[#0D2322]">DUKPT Key Tier-3 Ready</strong></span>
                            </div>
                            <button
                                type="button"
                                onClick={() => toast.info("Hardware Diagnostics", { description: "0 terminals currently attached to gateway." })}
                                className="text-xs text-[#D97706] font-bold hover:text-[#B45309] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <span>Open Hardware Diagnostics Panel</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Merchant Transaction Ledger */}
            <div className="bg-white rounded-xl shadow-sm border border-[#D3DEDB] p-6 flex flex-col gap-4">
                {/* Table Header Toolbar */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-1">
                    <div>
                        <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">Settlement Ledger</span>
                        <h2 className="text-xl font-bold text-[#0D2322]">Live Store Transactions</h2>
                    </div>

                    {/* Filters & Instant Search */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#566C6A]">search</span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F4F7F6] text-[#0D2322] text-xs pl-9 pr-3 py-2 rounded-lg border border-[#D3DEDB] focus:outline-none focus:border-[#0D2322] focus:bg-white transition-all placeholder-[#8B9F9D]"
                                placeholder="Search reference, cashier, or card..."
                                type="text"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => toast.info("Filter Rails", { description: "QR Ph, Visa, Mastercard, and Maya filters active." })}
                            className="px-3 py-2 bg-[#EDF4F2] text-[#0D2322] text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] font-semibold cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px] text-[#0D2322]">filter_list</span>
                            <span>Filter Rails</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="px-3 py-2 bg-[#EDF4F2] text-[#0D2322] text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] font-semibold cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px] text-[#0D2322]">file_download</span>
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#EDF4F2] text-[#566C6A] text-[11px] uppercase tracking-wider border-b border-[#D3DEDB]">
                                <th className="py-2.5 px-4 rounded-l-lg font-bold">Time & Ref ID</th>
                                <th className="py-2.5 px-4 font-bold">Cashier & Store</th>
                                <th className="py-2.5 px-4 font-bold">Rail / Method</th>
                                <th className="py-2.5 px-4 text-right font-bold">Gross Amount</th>
                                <th className="py-2.5 px-4 text-right font-bold">MDR Fee</th>
                                <th className="py-2.5 px-4 text-right font-bold">Net Settlement</th>
                                <th className="py-2.5 px-4 text-center rounded-r-lg font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D3DEDB]/60">
                            {filteredLedger.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-[#566C6A]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-[36px] text-[#8B9F9D]">receipt_long</span>
                                            <p className="font-semibold text-sm text-[#0D2322]">No Store Transactions Found</p>
                                            <p className="text-xs text-[#566C6A]">Transactions processed through POS terminals and checkout links will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLedger.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-[#F4F7F6] transition-colors h-14">
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-[#0D2322] font-semibold font-mono">{tx.time}</span>
                                                <span className="text-[#566C6A] text-[11px] font-mono">{tx.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[#E7F0EF] border border-[#D3DEDB] flex items-center justify-center text-[10px] font-bold text-[#0D2322]">
                                                    {tx.initials}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-[#0D2322] font-semibold">{tx.cashier}</span>
                                                    <span className="text-[#566C6A] text-[11px]">{tx.storeLocation}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[18px] text-[#D97706]">
                                                    {tx.railMethod.includes("QR") ? "qr_code_2" : tx.railMethod.includes("Maya") ? "shopping_bag" : "contactless"}
                                                </span>
                                                <span className="text-xs text-[#0D2322] font-medium">{tx.railMethod}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-xs text-[#0D2322] font-bold">
                                            ₱{tx.grossAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-xs text-[#C2410C] font-medium">
                                            -₱{tx.mdrFee.toFixed(2)} <span className="text-[#566C6A] text-[11px]">({tx.mdrRate.toFixed(1)}%)</span>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-xs text-[#0F5B46] font-bold">
                                            ₱{tx.netSettlement.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-block ${
                                                    tx.status === "Settled"
                                                        ? "bg-[#E8F5F1] text-[#0F5B46] border-[#BCE3D6]"
                                                        : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                                                }`}
                                            >
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#566C6A]">
                    <span>Showing 0 of 0 transactions • MDR Withholding Applied: 1.0% BIR Rev Regs 16-2023 Compliant</span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled
                            className="px-3 py-1 rounded-md bg-[#F4F7F6] border border-[#D3DEDB] text-[#8B9F9D] font-medium cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="font-semibold text-[#0D2322]">Page 0 of 0</span>
                        <button
                            type="button"
                            disabled
                            className="px-3 py-1 rounded-md bg-[#F4F7F6] border border-[#D3DEDB] text-[#8B9F9D] font-medium cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
