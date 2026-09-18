"use client";

import React, { useState } from "react";
import {
    Store,
    Link as LinkIcon,
    FileText,
    Users,
    Volume2,
    TrendingUp,
    ShieldAlert,
    Cpu,
    QrCode,
    CreditCard,
    ShoppingCart,
    ArrowUpRight,
    Search,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    Battery,
    Wifi,
    RefreshCw,
    Gavel,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { MerchantLedgerTransaction } from "../types";

const INITIAL_MERCHANT_LEDGER: MerchantLedgerTransaction[] = [
    {
        id: "TXN-8849-09312",
        time: "14:38:22",
        cashier: "C. Santos (T-04)",
        storeLocation: "BGC High Street",
        initials: "CS",
        railMethod: "QR Ph (GCash)",
        grossAmount: 4820.00,
        mdrRate: 1.0,
        mdrFee: 48.20,
        netSettlement: 4771.80,
        status: "Settled",
    },
    {
        id: "TXN-8849-09311",
        time: "14:35:10",
        cashier: "Online Web Store",
        storeLocation: "Checkout API",
        initials: "WS",
        railMethod: "Visa 3D-Secure 2.2",
        grossAmount: 12500.00,
        mdrRate: 2.0,
        mdrFee: 250.00,
        netSettlement: 12250.00,
        status: "Settled",
    },
    {
        id: "TXN-8849-09310",
        time: "14:31:04",
        cashier: "Shopify App API",
        storeLocation: "Web Checkout",
        initials: "SA",
        railMethod: "Maya Wallet",
        grossAmount: 2190.00,
        mdrRate: 1.5,
        mdrFee: 32.85,
        netSettlement: 2157.15,
        status: "Settled",
    },
    {
        id: "TXN-8849-09309",
        time: "14:29:15",
        cashier: "J. Lim (mPOS-01)",
        storeLocation: "Power Plant Mall",
        initials: "JL",
        railMethod: "Mastercard Contactless",
        grossAmount: 8900.00,
        mdrRate: 2.0,
        mdrFee: 178.00,
        netSettlement: 8722.00,
        status: "Batch In-Flight",
    },
    {
        id: "TXN-8849-09308",
        time: "14:18:50",
        cashier: "A. Aquino (T-01)",
        storeLocation: "Greenbelt 5 Hub",
        initials: "AA",
        railMethod: "BDO Magstripe Fallback",
        grossAmount: 1450.00,
        mdrRate: 2.5,
        mdrFee: 36.25,
        netSettlement: 1413.75,
        status: "Settled",
    },
];

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
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-2 animate-in fade-in duration-200">
            {/* Top Context Ribbon */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] font-bold uppercase tracking-wider border border-[#D3DEDB]">
                            Store Fleet Operational
                        </span>
                        <span className="text-[#8B9F9D]">•</span>
                        <span className="text-[#566C6A] font-semibold font-mono">MID-8849-PH</span>
                        <span className="text-[#8B9F9D]">•</span>
                        <span className="font-bold text-[#0D2322] dark:text-foreground">BGC Flagship Hub</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-2xl sm:text-3xl font-black text-[#0D2322] dark:text-foreground tracking-tight">
                            Blue Harbor Retail Group
                        </h1>
                        <span className="text-xs text-[#566C6A] dark:text-muted-foreground font-medium hidden sm:inline">
                            Tier-1 Merchant Dashboard
                        </span>
                    </div>
                </div>

                {/* Quick Action Bar */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white dark:bg-card border border-[#D3DEDB] dark:border-border rounded-xl shadow-xs">
                    <button
                        type="button"
                        onClick={handleCreateLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-all shadow-xs cursor-pointer"
                    >
                        <LinkIcon className="w-4 h-4" />
                        <span>Dynamic Link / Invoice</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleBirForm}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF4F2] dark:bg-muted text-[#0D2322] dark:text-foreground text-xs font-bold hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] dark:border-border cursor-pointer"
                    >
                        <FileText className="w-4 h-4 text-[#0D2322] dark:text-foreground" />
                        <span>BIR 2307 Form</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleBatchPayout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF4F2] dark:bg-muted text-[#0D2322] dark:text-foreground text-xs font-bold hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] dark:border-border cursor-pointer"
                    >
                        <Users className="w-4 h-4 text-[#0D2322] dark:text-foreground" />
                        <span>Batch Payroll Payout</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleSoundboxAlert}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF4F2] dark:bg-muted text-[#0D2322] dark:text-foreground text-xs font-bold hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] dark:border-border cursor-pointer"
                    >
                        <Volume2 className="w-4 h-4 text-[#0D2322] dark:text-foreground" />
                        <span>Soundbox Alert</span>
                    </button>
                </div>
            </div>

            {/* Top Metrics Row (4 KPI Tiles) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Metric 1: Gross Volume */}
                <div className="bg-white dark:bg-card rounded-xl p-5 shadow-xs border border-[#D3DEDB] dark:border-border flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#566C6A] dark:text-muted-foreground">
                            Today's Gross Volume
                        </span>
                        <div className="flex items-center gap-1 text-[#059669] text-xs font-bold bg-[#E8F5F1] px-1.5 py-0.5 rounded border border-[#BCE3D6]">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>14.2%</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black text-[#0D2322] dark:text-foreground font-mono tracking-tight">
                            ₱3,842,650.00
                        </div>
                        <span className="text-xs text-[#566C6A] mt-1 block">
                            vs ₱3,365,000.00 yesterday
                        </span>
                    </div>
                    <div className="w-full bg-[#E7F0EF] dark:bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#D97706] h-full rounded-full" style={{ width: "78%" }} />
                    </div>
                </div>

                {/* Metric 2: Net Settled Funds */}
                <div className="bg-white dark:bg-card rounded-xl p-5 shadow-xs border border-[#D3DEDB] dark:border-border flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#566C6A] dark:text-muted-foreground">
                            Net Settled Funds
                        </span>
                        <span className="text-[11px] font-bold text-[#0D2322] bg-[#E7F0EF] px-1.5 py-0.5 rounded border border-[#D3DEDB]">
                            T+0 Real-Time
                        </span>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black text-[#0D2322] dark:text-foreground font-mono tracking-tight">
                            ₱3,765,800.00
                        </div>
                        <span className="text-xs text-[#566C6A] mt-1 block">
                            MDR Deductions: ₱76,850.00 (avg 1.99%)
                        </span>
                    </div>
                    <div className="w-full bg-[#E7F0EF] dark:bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#163331] h-full rounded-full" style={{ width: "92%" }} />
                    </div>
                </div>

                {/* Metric 3: Active Terminals */}
                <div className="bg-white dark:bg-card rounded-xl p-5 shadow-xs border border-[#D3DEDB] dark:border-border flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#566C6A] dark:text-muted-foreground">
                            Active Terminals
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#059669] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse" /> 97.9% Fleet Up
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2 text-2xl sm:text-3xl font-black text-[#0D2322] dark:text-foreground font-mono">
                            <span>142</span>
                            <span className="text-[#566C6A] text-sm font-semibold">/ 145 Units</span>
                        </div>
                        <span className="text-xs text-[#DC2626] mt-1 flex items-center gap-1 font-medium">
                            <span>3 in Maintenance (Robinsons Manila #4)</span>
                        </span>
                    </div>
                    <div className="flex gap-1 mt-4">
                        <div className="bg-[#0D2322] flex-1 h-1.5 rounded-l-full" />
                        <div className="bg-[#0D2322] flex-1 h-1.5" />
                        <div className="bg-[#D97706] flex-1 h-1.5" />
                        <div className="bg-[#FED7AA] w-3 h-1.5 rounded-r-full" />
                    </div>
                </div>

                {/* Metric 4: Successful Transactions */}
                <div className="bg-white dark:bg-card rounded-xl p-5 shadow-xs border border-[#D3DEDB] dark:border-border flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#566C6A] dark:text-muted-foreground">
                            Successful Transactions
                        </span>
                        <span className="text-[11px] font-bold text-[#059669] bg-[#E8F5F1] px-1.5 py-0.5 rounded border border-[#BCE3D6]">
                            99.94% Rate
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2 text-2xl sm:text-3xl font-black text-[#0D2322] dark:text-foreground font-mono">
                            <span>4,921</span>
                            <span className="text-[#566C6A] text-xs font-semibold">Settled</span>
                        </div>
                        <span className="text-xs text-[#566C6A] mt-1 block">
                            3 Card Network Rejections • 0 Gateway Drop
                        </span>
                    </div>
                    <div className="w-full bg-[#E7F0EF] dark:bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#059669] h-full rounded-full" style={{ width: "99.9%" }} />
                    </div>
                </div>
            </div>

            {/* Asymmetrical Split: Channel Liquidity & Hardware / Dispute Alert */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left (5 Cols): Channel Liquidity */}
                <div className="xl:col-span-5 flex flex-col gap-4 bg-white dark:bg-card p-6 rounded-xl shadow-xs border border-[#D3DEDB] dark:border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs uppercase tracking-wider font-semibold text-[#566C6A] dark:text-muted-foreground">
                                Channel Liquidity
                            </span>
                            <h2 className="text-lg font-bold text-[#0D2322] dark:text-foreground">
                                Checkout Performance
                            </h2>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-[#EDF4F2] text-[#0D2322] text-xs font-bold border border-[#D3DEDB]">
                            24h Real-Time
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 my-auto pt-2">
                        {/* QR Ph */}
                        <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="flex items-center gap-1.5 text-[#0D2322] dark:text-foreground font-semibold">
                                    <QrCode className="w-4 h-4 text-[#D97706]" />
                                    <span>QR Ph National Rails (P2M)</span>
                                </span>
                                <span className="font-bold text-[#0D2322] dark:text-foreground">
                                    42% <span className="text-[#566C6A] font-normal">(₱1,613,913)</span>
                                </span>
                            </div>
                            <div className="w-full bg-[#E7F0EF] dark:bg-muted h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#D97706] h-full rounded-full" style={{ width: "42%" }} />
                            </div>
                        </div>

                        {/* Contactless EMV */}
                        <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="flex items-center gap-1.5 text-[#0D2322] dark:text-foreground font-semibold">
                                    <CreditCard className="w-4 h-4 text-[#163331] dark:text-foreground" />
                                    <span>Contactless EMV (Visa / MC / JCB)</span>
                                </span>
                                <span className="font-bold text-[#0D2322] dark:text-foreground">
                                    31% <span className="text-[#566C6A] font-normal">(₱1,191,221)</span>
                                </span>
                            </div>
                            <div className="w-full bg-[#E7F0EF] dark:bg-muted h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#163331] h-full rounded-full" style={{ width: "31%" }} />
                            </div>
                        </div>

                        {/* E-Commerce Checkout */}
                        <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="flex items-center gap-1.5 text-[#0D2322] dark:text-foreground font-semibold">
                                    <ShoppingCart className="w-4 h-4 text-[#F59E0B]" />
                                    <span>E-Commerce Hosted Checkout API</span>
                                </span>
                                <span className="font-bold text-[#0D2322] dark:text-foreground">
                                    18% <span className="text-[#566C6A] font-normal">(₱691,677)</span>
                                </span>
                            </div>
                            <div className="w-full bg-[#E7F0EF] dark:bg-muted h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: "18%" }} />
                            </div>
                        </div>

                        {/* OTC Traditional */}
                        <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="flex items-center gap-1.5 text-[#0D2322] dark:text-foreground font-semibold">
                                    <Store className="w-4 h-4 text-[#566C6A]" />
                                    <span>Over-The-Counter Cash Voucher</span>
                                </span>
                                <span className="font-bold text-[#0D2322] dark:text-foreground">
                                    9% <span className="text-[#566C6A] font-normal">(₱345,838)</span>
                                </span>
                            </div>
                            <div className="w-full bg-[#E7F0EF] dark:bg-muted h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#94A3B8] h-full rounded-full" style={{ width: "9%" }} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Micro Insights */}
                    <div className="grid grid-cols-2 gap-3 pt-3 bg-[#EDF4F2] dark:bg-muted/40 p-4 rounded-xl border border-[#D3DEDB] dark:border-border mt-2">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#566C6A] block">
                                NFC Tap Velocity
                            </span>
                            <span className="text-sm font-bold text-[#0D2322] dark:text-foreground">
                                1.2s Average
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#566C6A] block">
                                API Checkout SLA
                            </span>
                            <span className="text-sm font-bold text-[#059669]">
                                99.98% Latency &lt;80ms
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right (7 Cols): Chargeback Defense & Hardware Terminal Monitor */}
                <div className="xl:col-span-7 flex flex-col gap-4">
                    {/* Chargeback Defense Urgent Alert */}
                    <div className="bg-white dark:bg-card rounded-xl p-5 shadow-xs border border-[#D3DEDB] dark:border-border border-l-4 border-l-[#D97706]">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FED7AA]">
                                    <Gavel className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 rounded bg-[#FFF7ED] text-[#D97706] text-[10px] font-bold border border-[#FED7AA]">
                                            1 Action Required
                                        </span>
                                        <span className="text-xs text-[#566C6A] font-semibold font-mono">
                                            Dispute #DS-99042-VISA
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm text-[#0D2322] dark:text-foreground mt-0.5">
                                        Proof-of-Delivery Submission Required
                                    </h3>
                                    <p className="text-xs text-[#566C6A] mt-0.5">
                                        Cardholder claim: Unrecognized charge for ₱18,450.00 at SM Aura Premier store.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0 w-full md:w-auto">
                                <div className="flex items-center gap-1.5 text-[#D97706] font-bold text-xs">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>18h : 42m : 11s Remaining</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSubmitEvidence}
                                    disabled={disputeSubmitted}
                                    className="mt-2 w-full md:w-auto px-4 py-1.5 rounded-lg bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-all shadow-xs cursor-pointer disabled:opacity-60"
                                >
                                    {disputeSubmitted ? "✓ Evidence Submitted" : "Submit POD Evidence"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* POS Terminal Fleet Monitor */}
                    <div className="bg-white dark:bg-card rounded-xl p-5 shadow-xs border border-[#D3DEDB] dark:border-border flex flex-col justify-between flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <span className="text-xs uppercase tracking-wider font-semibold text-[#566C6A] dark:text-muted-foreground">
                                    Hardware Infrastructure
                                </span>
                                <h2 className="text-base sm:text-lg font-bold text-[#0D2322] dark:text-foreground">
                                    Terminal Fleet Status
                                </h2>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#E8F5F1] px-2.5 py-1 rounded-lg border border-[#BCE3D6]">
                                <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse" />
                                <span className="text-xs text-[#059669] font-bold">Real-time Telemetry</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Terminal 1 */}
                            <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between gap-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Cpu className="w-4 h-4 text-[#0D2322] dark:text-foreground" />
                                        <span className="font-bold text-xs text-[#0D2322] dark:text-foreground">
                                            Apex Hybrid Pro
                                        </span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded bg-[#E8F5F1] text-[#059669] text-[10px] font-bold border border-[#BCE3D6]">
                                        96 Online
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#566C6A]">
                                    Dual Chip + NFC Contactless + Fallback Magstripe
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-[#566C6A] font-semibold">
                                    <span className="flex items-center gap-1 text-[#059669]">
                                        <Battery className="w-3.5 h-3.5" /> 98% avg
                                    </span>
                                    <span className="font-mono">v4.1.2-PCI</span>
                                </div>
                            </div>

                            {/* Terminal 2 */}
                            <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between gap-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Volume2 className="w-4 h-4 text-[#D97706]" />
                                        <span className="font-bold text-xs text-[#0D2322] dark:text-foreground">
                                            Apex Soundbox Q1
                                        </span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded bg-[#E8F5F1] text-[#059669] text-[10px] font-bold border border-[#BCE3D6]">
                                        34 Online
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#566C6A]">
                                    Voice payment alert broadcast with 4G dual-SIM
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-[#566C6A] font-semibold">
                                    <span className="flex items-center gap-1 text-[#059669]">
                                        <Wifi className="w-3.5 h-3.5" /> 4G LTE High
                                    </span>
                                    <span className="font-mono">v2.0.8-Audio</span>
                                </div>
                            </div>

                            {/* Terminal 3 */}
                            <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between gap-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Store className="w-4 h-4 text-[#163331] dark:text-foreground" />
                                        <span className="font-bold text-xs text-[#0D2322] dark:text-foreground">
                                            Mobile mPOS
                                        </span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded bg-[#FFF7ED] text-[#B45309] text-[10px] font-bold border border-[#FED7AA]">
                                        12 Active / 3 Maint
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#566C6A]">
                                    Handheld queue-busting floor checkout units
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-[#566C6A] font-semibold">
                                    <span className="text-[#D97706]">Update Ready</span>
                                    <span className="font-mono">v5.2.0-Patch</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#D3DEDB] dark:border-border text-xs">
                            <div className="flex items-center gap-3 text-[#566C6A]">
                                <span>Mesh Hub: <strong className="text-[#0D2322] dark:text-foreground">NCR-BGC-01</strong></span>
                                <span>Latency: <strong className="text-[#059669]">14ms</strong></span>
                                <span>Encryption: <strong className="text-[#0D2322] dark:text-foreground">DUKPT Key Tier-3</strong></span>
                            </div>
                            <button
                                type="button"
                                onClick={() => toast.info("Opening Diagnostics", { description: "Connected to hardware node telemetry stream." })}
                                className="text-[#D97706] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <span>Open Hardware Diagnostics Panel</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Merchant Transaction Ledger */}
            <div className="bg-white dark:bg-card rounded-xl shadow-xs border border-[#D3DEDB] dark:border-border p-6 flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#566C6A] dark:text-muted-foreground">
                            Settlement Ledger
                        </span>
                        <h2 className="text-lg font-bold text-[#0D2322] dark:text-foreground">
                            Live Store Transactions
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#566C6A]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search reference, cashier, or card..."
                                className="w-full bg-[#F4F7F6] dark:bg-muted text-xs pl-9 pr-4 py-2 rounded-lg border border-[#D3DEDB] dark:border-border focus:outline-none focus:border-[#D97706]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => toast.info("Rails filter dialog loaded")}
                            className="px-3 py-2 bg-[#EDF4F2] dark:bg-muted text-[#0D2322] dark:text-foreground text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#E2EBE9] border border-[#D3DEDB] dark:border-border cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filter Rails</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="px-3 py-2 bg-[#EDF4F2] dark:bg-muted text-[#0D2322] dark:text-foreground text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#E2EBE9] border border-[#D3DEDB] dark:border-border cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#EDF4F2] dark:bg-muted/70 text-[#566C6A] dark:text-muted-foreground uppercase tracking-wider border-b border-[#D3DEDB] dark:border-border">
                                <th className="py-2.5 px-4 rounded-l-lg font-bold">Time & Ref ID</th>
                                <th className="py-2.5 px-4 font-bold">Cashier & Store</th>
                                <th className="py-2.5 px-4 font-bold">Rail / Method</th>
                                <th className="py-2.5 px-4 text-right font-bold">Gross Amount</th>
                                <th className="py-2.5 px-4 text-right font-bold">MDR Fee</th>
                                <th className="py-2.5 px-4 text-right font-bold">Net Settlement</th>
                                <th className="py-2.5 px-4 text-center rounded-r-lg font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D3DEDB]/60 dark:divide-border/60">
                            {filteredLedger.map((tx) => (
                                <tr key={tx.id} className="hover:bg-[#F4F7F6] dark:hover:bg-muted/40 transition-colors h-12">
                                    <td className="px-4 py-2">
                                        <span className="font-semibold text-[#0D2322] dark:text-foreground block">{tx.time}</span>
                                        <span className="text-[10px] text-[#566C6A] font-mono">{tx.id}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#E7F0EF] text-[#0D2322] flex items-center justify-center text-[10px] font-bold border border-[#D3DEDB]">
                                                {tx.initials}
                                            </div>
                                            <div>
                                                <span className="font-semibold text-[#0D2322] dark:text-foreground block">{tx.cashier}</span>
                                                <span className="text-[10px] text-[#566C6A]">{tx.storeLocation}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="font-medium text-[#0D2322] dark:text-foreground">{tx.railMethod}</span>
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold font-mono text-[#0D2322] dark:text-foreground">
                                        ₱{tx.grossAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium text-[#DC2626]">
                                        -₱{tx.mdrFee.toFixed(2)} <span className="text-[10px] text-[#566C6A]">({tx.mdrRate}%)</span>
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold font-mono text-[#059669]">
                                        ₱{tx.netSettlement.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                                            tx.status === "Settled"
                                                ? "bg-[#E8F5F1] text-[#059669] border-[#BCE3D6]"
                                                : "bg-[#FFF7ED] text-[#B45309] border-[#FED7AA]"
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[#D3DEDB] dark:border-border text-xs text-[#566C6A]">
                    <div className="flex items-center gap-2">
                        <span>Showing {filteredLedger.length} of 4,921 transactions</span>
                        <span>•</span>
                        <span>MDR Withholding Applied: 1.0% BIR Rev Regs 16-2023 Compliant</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button type="button" className="px-2.5 py-1 rounded bg-[#EDF4F2] dark:bg-muted text-xs font-semibold hover:bg-[#E2EBE9] cursor-pointer">Previous</button>
                        <span className="px-2 py-1 font-bold text-[#0D2322] dark:text-foreground">Page 1 of 985</span>
                        <button type="button" className="px-2.5 py-1 rounded bg-[#EDF4F2] dark:bg-muted text-xs font-semibold hover:bg-[#E2EBE9] cursor-pointer">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
