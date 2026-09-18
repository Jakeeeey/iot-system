"use client";

import React, { useState, useEffect } from "react";
import {
    Activity,
    Clock,
    Shield,
    CheckCircle2,
    AlertTriangle,
    Lock,
    Key,
    UserCheck,
    FileText,
    Download,
    Paperclip,
    Undo,
    Eye,
    TrendingUp,
    RefreshCw,
    ShieldAlert,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export function OpsConsoleView() {
    // Live ticking settlement cutoff clock
    const [currentTime, setCurrentTime] = useState("");
    const [dualControlState, setDualControlState] = useState<"pending" | "authorized" | "rejected">("pending");
    const [disputeDecision, setDisputeDecision] = useState<"open" | "dismissed" | "reversed">("open");

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, "0");
            const m = String(now.getMinutes()).padStart(2, "0");
            const s = String(now.getSeconds()).padStart(2, "0");
            setCurrentTime(`${h}:${m}:${s} UTC+8`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSignSessionToken = () => {
        toast.success("Multi-Sig Session Signed", {
            description: "Session token validated with HSM Hardware Security Module key.",
        });
    };

    const handleAuthorizeDualControl = () => {
        setDualControlState("authorized");
        toast.success("Adjustment Authorized", {
            description: "Journal entry #JRN-2024-0914-ADJ signed by Checker and broadcast to core ledger.",
        });
    };

    const handleRejectDualControl = () => {
        setDualControlState("rejected");
        toast.error("Adjustment Rejected", {
            description: "Journal entry rejected. Non-compliance audit notice dispatched.",
        });
    };

    const handleDismissDispute = () => {
        setDisputeDecision("dismissed");
        toast.success("Dispute Dismissed", {
            description: "Merchant upheld. Ring-fenced ₱64,990.00 released back to merchant float.",
        });
    };

    const handleReverseDispute = () => {
        setDisputeDecision("reversed");
        toast.info("Dispute Reversed to Payer", {
            description: "Ring-fenced ₱64,990.00 refunded to Cardholder Corazon Mercado.",
        });
    };

    const handleExportAuditZip = () => {
        toast.success("Audit Archive Exported", {
            description: "ISO-20022 clearing tape & SHA-256 integrity report bundled as ZIP archive.",
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-2 animate-in fade-in duration-200">
            {/* Operational Status Bar & Header Summary */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap text-xs">
                        <span className="font-bold uppercase tracking-wider text-[#0D2322] dark:text-foreground bg-[#E1EAE9] dark:bg-muted px-2 py-0.5 rounded-md border border-[#526B68]/30">
                            Sec. K.4 Global Telemetry
                        </span>
                        <span className="text-[#566C6A]">•</span>
                        <span className="text-[#566C6A] dark:text-muted-foreground font-medium font-mono">
                            Host Node: MNL-CENTRAL-01
                        </span>
                        <span className="text-[#566C6A]">•</span>
                        <span className="inline-flex items-center gap-1 text-[#059669] bg-[#E8F8F3] px-2 py-0.5 rounded-md border border-[#059669]/25 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                            Multi-Sig Guard Active
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-[#0D2322] dark:text-foreground tracking-tight">
                        Institutional Operations & Oversight Console
                    </h1>
                    <p className="text-xs sm:text-sm text-[#566C6A] dark:text-muted-foreground">
                        Real-time ledger state, dual-custody authorization queue, and AML risk management.
                    </p>
                </div>

                {/* Quick Action / Live Settlement Cutoff Timestamp */}
                <div className="flex items-center gap-2 self-start xl:self-auto">
                    <div className="px-4 py-2 bg-white dark:bg-card rounded-xl border border-[#D3DEDB] dark:border-border shadow-xs flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#D97706]" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#566C6A] dark:text-muted-foreground uppercase tracking-wider font-semibold">
                                Settlement Cutoff
                            </span>
                            <span className="text-sm font-bold text-[#0D2322] dark:text-foreground font-mono">
                                {currentTime || "14:11:01 UTC+8"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSignSessionToken}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E07A1F] via-[#D97706] to-[#B45309] text-white hover:opacity-95 transition-all shadow-md shadow-[#D97706]/30 font-bold text-xs cursor-pointer"
                    >
                        <Shield className="w-4 h-4" />
                        <span>Sign Session Token</span>
                    </button>
                </div>
            </div>

            {/* Platform Vitals Banner (4 KPI Tiles) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Core Throughput */}
                <div className="bg-white dark:bg-card p-5 rounded-2xl border border-[#D3DEDB] dark:border-border shadow-xs flex flex-col justify-between hover:border-[#D97706]/40 transition-colors">
                    <div className="flex items-center justify-between text-[#566C6A] dark:text-muted-foreground">
                        <span className="text-xs uppercase tracking-wider font-bold">
                            Core Switch Throughput
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#E1EAE9] dark:bg-muted flex items-center justify-center text-[#0D2322] dark:text-foreground">
                            <Activity className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-[#0D2322] dark:text-foreground font-mono tracking-tight">
                                2,840
                            </span>
                            <span className="text-sm text-[#566C6A] font-semibold">TPS</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center text-[#059669] text-xs font-bold bg-[#E8F8F3] px-1.5 py-0.5 rounded">
                                +14.8%
                            </span>
                            <span className="text-[#566C6A] text-xs">vs 30-min baseline</span>
                        </div>
                    </div>
                    {/* Mini Sparkline Visualization */}
                    <div className="w-full h-8 pt-1">
                        <svg className="w-full h-full text-[#D97706]" fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
                            <path d="M0 18 L15 14 L30 16 L45 10 L60 12 L75 6 L90 8 L100 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                            <path d="M0 18 L15 14 L30 16 L45 10 L60 12 L75 6 L90 8 L100 4 V24 H0 Z" fill="currentColor" fillOpacity="0.12" />
                        </svg>
                    </div>
                </div>

                {/* Settlement Float Reserves */}
                <div className="bg-white dark:bg-card p-5 rounded-2xl border border-[#D3DEDB] dark:border-border shadow-xs flex flex-col justify-between hover:border-[#D97706]/40 transition-colors">
                    <div className="flex items-center justify-between text-[#566C6A] dark:text-muted-foreground">
                        <span className="text-xs uppercase tracking-wider font-bold">
                            24h Settlement Float Pool
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#E8F8F3] flex items-center justify-center text-[#059669]">
                            <Lock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="text-2xl sm:text-3xl font-black text-[#0D2322] dark:text-foreground font-mono tracking-tight">
                            ₱842,500,000
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-[#D97706]/10 text-[#B45309] font-bold border border-[#D97706]/30">
                                100% Depository Backed
                            </span>
                            <span className="text-xs text-[#566C6A]">BSP Escrow</span>
                        </div>
                    </div>
                    <div className="w-full bg-[#E7F0EF] dark:bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#059669] to-[#34D399] h-full rounded-full" style={{ width: "82%" }} />
                    </div>
                </div>

                {/* Active System Alerts */}
                <div className="bg-white dark:bg-card p-5 rounded-2xl border border-[#D3DEDB] dark:border-border shadow-xs flex flex-col justify-between hover:border-[#D97706]/40 transition-colors">
                    <div className="flex items-center justify-between text-[#566C6A] dark:text-muted-foreground">
                        <span className="text-xs uppercase tracking-wider font-bold">
                            Network Health Alerts
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#E1EAE9] dark:bg-muted flex items-center justify-center text-[#0D2322] dark:text-foreground">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-center gap-4">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-[#059669]">0</span>
                                <span className="text-xs text-[#566C6A]">Critical</span>
                            </div>
                            <span className="text-[#D3DEDB] font-bold">/</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-[#D97706]">2</span>
                                <span className="text-xs text-[#566C6A]">Warnings</span>
                            </div>
                        </div>
                        <p className="text-xs text-[#566C6A] mt-1 truncate">PESONet queued window spike detected</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#0D2322] dark:text-foreground font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                        <span>Telemetry polling every 2,500ms</span>
                    </div>
                </div>

                {/* Dynamic Spot FX Feeder */}
                <div className="bg-gradient-to-br from-[#0A1C1B] via-[#0D2322] to-[#163331] text-white p-5 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden border border-[#526B68]/40">
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs uppercase tracking-wider font-bold text-amber-200">
                            Dynamic Spot Feeder
                        </span>
                        <TrendingUp className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="my-2 relative z-10">
                        <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-black text-white font-mono tracking-tight">
                                58.4200
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-[#D97706]/30 text-amber-200 font-bold border border-amber-300/30">
                                USD / PHP
                            </span>
                        </div>
                        <p className="text-xs text-white/70 mt-1">Ref: BAP Fix (Spread: +0.003)</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/90 relative z-10 font-semibold">
                        <span className="text-white/70">InstaPay Cap: ₱50k/tx</span>
                        <span className="inline-flex items-center gap-1 text-[#6EE7B7] bg-[#059669]/25 px-2 py-0.5 rounded border border-[#059669]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />
                            <span>Direct Rails Live</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Core Settlement Rails & Gateway Telemetry Strip */}
            <div className="bg-white dark:bg-card p-5 rounded-2xl border border-[#D3DEDB] dark:border-border shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D3DEDB] dark:border-border">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0D2322] dark:text-foreground">
                            Core Settlement Rails & Clearings
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#E1EAE9] dark:bg-muted text-[#0D2322] dark:text-foreground font-bold border border-[#D3DEDB]">
                            Master Inventory Sec. IV
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#566C6A]">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#059669]" /> Nominal &lt; 200ms</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D97706]" /> Batch Queueing</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Degraded</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* InstaPay */}
                    <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#0D2322] dark:text-foreground">InstaPay Rail</span>
                                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F8F3] text-[#059669] font-bold">Operational</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs text-[#566C6A]">Roundtrip Latency</span>
                            <span className="font-mono font-bold text-sm">120<span className="text-xs font-normal">ms</span></span>
                        </div>
                        <div className="mt-1 text-xs text-[#566C6A] flex justify-between">
                            <span>Success Rate</span>
                            <span className="text-[#059669] font-bold">99.98%</span>
                        </div>
                    </div>

                    {/* PESONet */}
                    <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#0D2322] dark:text-foreground">PESONet Clearing</span>
                                <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFF7ED] text-[#B45309] font-bold">Staged Window</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs text-[#566C6A]">Next Batch</span>
                            <span className="font-mono font-bold text-sm">16:00 <span className="text-xs font-normal">PHT</span></span>
                        </div>
                        <div className="mt-1 text-xs text-[#566C6A] flex justify-between">
                            <span>Pending Outbound</span>
                            <span className="font-bold text-[#0D2322] dark:text-foreground">₱188.4M</span>
                        </div>
                    </div>

                    {/* Card Gateway */}
                    <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#0D2322] dark:text-foreground">Visa/MC 3DS</span>
                                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F8F3] text-[#059669] font-bold">Acquiring Live</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs text-[#566C6A]">Auth Latency</span>
                            <span className="font-mono font-bold text-sm">244<span className="text-xs font-normal">ms</span></span>
                        </div>
                        <div className="mt-1 text-xs text-[#566C6A] flex justify-between">
                            <span>Chargeback Index</span>
                            <span className="text-[#059669] font-bold">0.04%</span>
                        </div>
                    </div>

                    {/* RTGS PhilPaSSplus */}
                    <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#0D2322] dark:text-foreground">PhilPaSSplus RTGS</span>
                                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F8F3] text-[#059669] font-bold">Active Feed</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs text-[#566C6A]">Depository Link</span>
                            <span className="font-mono font-bold text-sm">Synchronized</span>
                        </div>
                        <div className="mt-1 text-xs text-[#566C6A] flex justify-between">
                            <span>Sub-account Sync</span>
                            <span className="font-bold text-[#0D2322] dark:text-foreground">Continuous</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dual Grid: Left = Maker-Checker & AML, Right = Dispute Spotlight & Audit Tape */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left Column (7 Cols): Dual-Control Ledger & AML Queue */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                    {/* Module 1: Dual-Control Ledger Adjustment */}
                    <div className="bg-white dark:bg-card rounded-2xl border border-[#D3DEDB] dark:border-border shadow-xs p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#B45309] flex items-center justify-center">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#0D2322] dark:text-foreground">
                                        Dual-Control Ledger Adjustment
                                    </h2>
                                    <p className="text-xs text-[#566C6A]">
                                        Maker-Checker Protocol • Sec. L.10 Back-Office Multi-Sig Rule
                                    </p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-[#FFF7ED] text-[#B45309] text-[10px] font-bold border border-[#FED7AA]">
                                Pending 2nd Officer Sign-Off
                            </span>
                        </div>

                        <div className="rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-1 text-xs">
                                <div>
                                    <span className="uppercase tracking-wider text-[#566C6A] font-bold block">
                                        Journal Adjustment Ref
                                    </span>
                                    <span className="font-mono font-bold text-sm text-[#0D2322] dark:text-foreground">
                                        #JRN-2024-0914-ADJ
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="uppercase tracking-wider text-[#566C6A] font-bold block">
                                        Adjustment Amount
                                    </span>
                                    <span className="font-mono font-black text-lg text-[#DC2626]">
                                        -₱2,450,000.00
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-card p-3 rounded-xl border border-[#D3DEDB] dark:border-border text-xs">
                                <div>
                                    <span className="text-[#566C6A] font-medium block">Target Account</span>
                                    <span className="font-mono font-bold text-[#0D2322] dark:text-foreground block">
                                        GL-88301-SETTLE-FLOAT
                                    </span>
                                    <span className="text-[11px] text-[#566C6A]">BPI Correspondent Pool</span>
                                </div>
                                <div>
                                    <span className="text-[#566C6A] font-medium block">Reason Code</span>
                                    <span className="font-bold text-[#0D2322] dark:text-foreground block">
                                        RC-08: Batch Mismatch
                                    </span>
                                    <span className="text-[11px] text-[#566C6A]">EOD Clearing Breakage</span>
                                </div>
                                <div>
                                    <span className="text-[#566C6A] font-medium block">Initiating Officer</span>
                                    <span className="font-bold text-[#0D2322] dark:text-foreground block">
                                        M. Santos (OpID 4091)
                                    </span>
                                    <span className="text-[11px] text-[#566C6A]">Today, 14:22 PHT</span>
                                </div>
                            </div>

                            <div className="p-3 bg-white dark:bg-card rounded-xl border border-[#D3DEDB] dark:border-border text-xs flex flex-col gap-1">
                                <div className="flex items-center justify-between text-[#566C6A]">
                                    <span className="font-mono text-[10px]">
                                        SHA-256 Ledger Hash: 8b7e21a0f918c4e...d283c8
                                    </span>
                                    <span className="text-[#B45309] font-bold">Multi-Sig: 1 of 2 Valid</span>
                                </div>
                                <p className="text-[#0D2322] dark:text-foreground mt-0.5">
                                    <strong>Operator Justification:</strong> Reclassification of unrouted ACH remittance from settlement escrow to suspense refund holding pool.
                                </p>
                            </div>

                            {/* Actions */}
                            {dualControlState === "pending" && (
                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleRejectDualControl}
                                        className="px-4 py-2 rounded-xl bg-white dark:bg-card text-[#DC2626] border border-[#DC2626]/30 text-xs font-bold hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                                    >
                                        Reject Adjustment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAuthorizeDualControl}
                                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E07A1F] to-[#D97706] text-white text-xs font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer"
                                    >
                                        Authorize Journal Entry (Checker Sign)
                                    </button>
                                </div>
                            )}

                            {dualControlState === "authorized" && (
                                <div className="p-2.5 bg-[#E8F8F3] text-[#059669] rounded-xl border border-[#059669]/30 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Adjustment Authorized & Broadcast to Core Ledger.</span>
                                </div>
                            )}

                            {dualControlState === "rejected" && (
                                <div className="p-2.5 bg-[#FEE2E2] text-[#DC2626] rounded-xl border border-[#DC2626]/30 text-xs font-bold text-center">
                                    Adjustment Rejected and Archived in Audit Logs.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Module 2: AML & Sanctions Queue */}
                    <div className="bg-white dark:bg-card rounded-2xl border border-[#D3DEDB] dark:border-border shadow-xs p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
                                    <ShieldAlert className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#0D2322] dark:text-foreground">
                                        AML & Sanctions Intercept Queue
                                    </h2>
                                    <p className="text-xs text-[#566C6A]">
                                        Covered Threshold Alerts (&gt;₱500k) & PEP Screening
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#E1EAE9] dark:bg-muted text-[#0D2322] dark:text-foreground">
                                3 Cases Pending
                            </span>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {/* Alert 1 */}
                            <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                <div className="flex items-start gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] mt-1 shrink-0" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#0D2322] dark:text-foreground">
                                                Apex Global Logistics Inc.
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold">
                                                Threshold &gt;₱500K
                                            </span>
                                        </div>
                                        <p className="text-[#566C6A] mt-0.5">
                                            Single inward wire of <strong>₱1,850,000.00</strong> via PhilPaSSplus. Velocity surge 420% above median.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    <button
                                        type="button"
                                        onClick={() => toast.info("Investigating Apex Global Logistics Inc.")}
                                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-card border border-[#D3DEDB] text-xs font-semibold hover:bg-[#E1EAE9] cursor-pointer"
                                    >
                                        Investigate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toast.success("Covered Transaction Report (CTR) Drafted")}
                                        className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-xs font-semibold hover:bg-[#B91C1C] cursor-pointer"
                                    >
                                        File CTR
                                    </button>
                                </div>
                            </div>

                            {/* Alert 2 */}
                            <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                <div className="flex items-start gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] mt-1 shrink-0" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#0D2322] dark:text-foreground">
                                                Hon. Arturo V. Dela Cerna
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-[#FFF7ED] text-[#B45309] text-[10px] font-bold">
                                                PEP Screening Hit
                                            </span>
                                        </div>
                                        <p className="text-[#566C6A] mt-0.5">
                                            Beneficiary match with Dow Jones PEP Watchlist. Outward transfer <strong>₱350,000.00</strong> to private wallet.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    <button
                                        type="button"
                                        onClick={() => toast.info("Investigating PEP match details.")}
                                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-card border border-[#D3DEDB] text-xs font-semibold hover:bg-[#E1EAE9] cursor-pointer"
                                    >
                                        Investigate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toast.warning("Enhanced Due Diligence (EDD) Level 3 Flagged")}
                                        className="px-3 py-1.5 rounded-lg bg-[#FFF7ED] text-[#B45309] border border-[#FED7AA] text-xs font-semibold hover:bg-[#D97706] hover:text-white cursor-pointer"
                                    >
                                        Flag EDD
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (5 Cols): Dispute Spotlight & Audit Tape */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                    {/* Active Adjudication Case Spotlight */}
                    <div className="bg-white dark:bg-card rounded-2xl border border-[#D3DEDB] dark:border-border shadow-xs p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-1 border-b border-[#D3DEDB] dark:border-border text-xs">
                            <div>
                                <span className="uppercase tracking-wider text-[#566C6A] font-bold block">
                                    Active Adjudication Case
                                </span>
                                <span className="font-mono font-bold text-sm text-[#0D2322] dark:text-foreground">
                                    Case #DSP-2024-9182
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="uppercase tracking-wider text-[#566C6A] font-bold block">
                                    Disputed Value
                                </span>
                                <span className="font-mono font-black text-base text-[#0D2322] dark:text-foreground">
                                    ₱64,990.00
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-3 bg-[#F4F7F6] dark:bg-muted rounded-xl border border-[#D3DEDB] text-xs">
                            <div>
                                <span className="text-[#566C6A] font-semibold block">Cardholder / Payer</span>
                                <span className="font-bold text-[#0D2322] dark:text-foreground block truncate">Corazon C. Mercado</span>
                                <span className="text-[11px] text-[#566C6A]">BDO Visa **** 4912</span>
                            </div>
                            <div>
                                <span className="text-[#566C6A] font-semibold block">Merchant Entity</span>
                                <span className="font-bold text-[#0D2322] dark:text-foreground block truncate">ElectroPulse Manila Corp.</span>
                                <span className="text-[11px] text-[#566C6A]">MID: 8901239088</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-[#566C6A]">Claim Category:</span>
                                <span className="font-bold text-[#DC2626]">Merchandise Not Received (13.1)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#566C6A]">Reserve Status:</span>
                                <span className="font-bold text-[#059669]">₱64,990.00 Ring-Fenced</span>
                            </div>
                        </div>

                        {/* Evidence Attachment */}
                        <div className="p-2.5 rounded-xl bg-[#E1EAE9] dark:bg-muted border border-[#D3DEDB] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                                <Paperclip className="w-4 h-4 text-[#0D2322] dark:text-foreground shrink-0" />
                                <div className="truncate">
                                    <span className="font-bold text-[#0D2322] dark:text-foreground block truncate">
                                        POD_Signed_LBC_AirWaybill_9921.pdf
                                    </span>
                                    <span className="text-[10px] text-[#566C6A]">Uploaded today at 11:05 PHT</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => toast.info("Opening signed proof of delivery attachment")}
                                className="p-1 text-[#0D2322] hover:text-[#D97706] transition-colors cursor-pointer"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Adjudication Decision Buttons */}
                        {disputeDecision === "open" && (
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleDismissDispute}
                                    className="flex-1 py-2 px-3 rounded-xl bg-[#059669] text-white text-xs font-bold hover:opacity-95 transition-all shadow-xs cursor-pointer"
                                >
                                    Dismiss (Uphold Merchant)
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReverseDispute}
                                    className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-card text-[#DC2626] border border-[#DC2626]/30 text-xs font-bold hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                                >
                                    Reverse to Payer
                                </button>
                            </div>
                        )}

                        {disputeDecision === "dismissed" && (
                            <div className="p-2.5 bg-[#E8F8F3] text-[#059669] rounded-xl border border-[#059669]/25 text-xs font-bold text-center">
                                Case Dismissed: Reserve released back to Merchant wallet.
                            </div>
                        )}

                        {disputeDecision === "reversed" && (
                            <div className="p-2.5 bg-[#FEE2E2] text-[#DC2626] rounded-xl border border-[#DC2626]/20 text-xs font-bold text-center">
                                Chargeback Upheld: Ring-fenced ₱64,990.00 reversed to Payer Card.
                            </div>
                        )}
                    </div>

                    {/* Module 4: Administrative Audit Tape */}
                    <div className="bg-white dark:bg-card rounded-2xl border border-[#D3DEDB] dark:border-border shadow-xs p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-1">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#0D2322] dark:text-foreground" />
                                <h3 className="text-sm font-bold text-[#0D2322] dark:text-foreground">
                                    Administrative Audit Tape
                                </h3>
                            </div>
                            <span className="text-[10px] font-bold text-[#0D2322] bg-[#D97706]/15 px-2 py-0.5 rounded-full border border-[#D97706]/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-ping" />
                                Live Broadcast
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5 text-xs">
                            <div className="p-2 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[10px] text-[#566C6A]">15:48:12</span>
                                    <span className="font-bold text-[#0D2322] dark:text-foreground font-mono">TOKEN_REVOCATION</span>
                                    <span className="text-[#566C6A] truncate hidden sm:inline">• Client API Key #API-8812</span>
                                </div>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                            </div>

                            <div className="p-2 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[10px] text-[#566C6A]">15:41:09</span>
                                    <span className="font-bold text-[#0D2322] dark:text-foreground font-mono">RESERVE_REBALANCE</span>
                                    <span className="text-[#566C6A] truncate hidden sm:inline">• ₱15,000,000 swept</span>
                                </div>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                            </div>

                            <div className="p-2 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[10px] text-[#566C6A]">15:33:45</span>
                                    <span className="font-bold text-[#0D2322] dark:text-foreground font-mono">SANCTION_MATCH_ALERT</span>
                                </div>
                                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs text-[#566C6A] border-t border-[#D3DEDB] dark:border-border">
                            <span>Quorum Paxos: 5/5 nodes online</span>
                            <button
                                type="button"
                                onClick={handleExportAuditZip}
                                className="text-[#D97706] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                                <span>Export Full ISO-20022 Audit Zip</span>
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Guardrails Bottom Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#E1EAE9] via-white dark:via-card to-[#E1EAE9] dark:to-muted border border-[#D3DEDB] dark:border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D2322] text-white flex items-center justify-center shadow-md">
                        <Shield className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0D2322] dark:text-foreground">
                            Bangko Sentral ng Pilipinas (BSP) Circular 982 Compliance Verified
                        </h4>
                        <p className="text-[11px] text-[#566C6A]">
                            Electronic Money Issuer (EMI) & Operator of Payment System (OPS) real-time risk supervision operational.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-card text-[#0D2322] dark:text-foreground font-bold border border-[#D3DEDB] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> SOC2 Type II Attested
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-card text-[#0D2322] dark:text-foreground font-bold border border-[#D3DEDB] flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> PCI-DSS Level 1 v4.0
                    </span>
                </div>
            </div>
        </div>
    );
}
