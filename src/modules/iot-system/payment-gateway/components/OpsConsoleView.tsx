"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export function OpsConsoleView() {
    // Live ticking settlement cutoff clock
    const [currentTime, setCurrentTime] = useState("");

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

    const handleExportAuditZip = () => {
        toast.success("Audit Archive Exported", {
            description: "ISO-20022 clearing tape & SHA-256 integrity report bundled as ZIP archive.",
        });
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Operational Status Bar & Header Summary */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] uppercase tracking-wider text-[#0D2322] font-bold bg-[#E1EAE9] px-2 py-0.5 rounded-md border border-[#526B68]/30">
                            Sec. K.4 Global Telemetry
                        </span>
                        <span className="text-[#566C6A]">•</span>
                        <span className="text-[11px] text-[#566C6A] font-medium font-mono">
                            Host Node: MNL-CENTRAL-01
                        </span>
                        <span className="text-[#566C6A]">•</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#059669] bg-[#E8F8F3] px-2 py-0.5 rounded-md border border-[#059669]/25 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                            Multi-Sig Guard Active
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2322] tracking-tight">
                        Institutional Operations &amp; Oversight Console
                    </h1>
                    <p className="text-xs sm:text-sm text-[#526B68]">
                        Real-time ledger state, dual-custody authorization queue, and AML risk management.
                    </p>
                </div>

                {/* Quick Action / Security Timestamp */}
                <div className="flex items-center gap-3 self-start xl:self-auto">
                    <div className="px-4 py-2 bg-white rounded-xl border border-[#D3DEDB] shadow-sm flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-[#D97706]">schedule</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#526B68] uppercase tracking-wider font-semibold">
                                Settlement Cutoff
                            </span>
                            <span className="text-sm font-bold text-[#0D2322] font-mono">
                                {currentTime || "14:11:01 UTC+8"}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleSignSessionToken}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#E07A1F] via-[#D97706] to-[#B45309] text-white hover:opacity-95 transition-all shadow-[0_4px_14px_rgba(217,119,6,0.35)] font-semibold text-xs sm:text-sm cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        <span>Sign Session Token</span>
                    </button>
                </div>
            </div>

            {/* Platform Vitals Banner (4 KPI Tiles) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Tile 1: Core Throughput */}
                <div className="bg-white p-5 rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] flex flex-col justify-between hover:border-[#D97706]/40 transition-colors">
                    <div className="flex items-center justify-between text-[#526B68]">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-[#526B68]">
                            Core Switch Throughput
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#E1EAE9] flex items-center justify-center text-[#0D2322]">
                            <span className="material-symbols-outlined text-[18px]">speed</span>
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-[#0D2322] font-mono tracking-tight">0</span>
                            <span className="text-sm text-[#526B68] font-semibold">TPS</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center text-[#526B68] text-[11px] font-bold bg-[#EDF5F5] px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-[14px]">horizontal_rule</span> 0.0%
                            </span>
                            <span className="text-[#526B68] text-xs">vs baseline</span>
                        </div>
                    </div>
                    <div className="w-full h-8 pt-1">
                        <svg className="w-full h-full text-[#D97706]" fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
                            <path d="M0 20 L100 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                        </svg>
                    </div>
                </div>

                {/* Tile 2: Settlement Float Reserves */}
                <div className="bg-white p-5 rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] flex flex-col justify-between hover:border-[#D97706]/40 transition-colors">
                    <div className="flex items-center justify-between text-[#526B68]">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-[#526B68]">
                            24h Settlement Float Pool
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#E8F8F3] flex items-center justify-center text-[#059669]">
                            <span className="material-symbols-outlined text-[18px]">account_balance</span>
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-[28px] font-black text-[#0D2322] font-mono tracking-tight">
                                ₱0.00
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#EDF5F5] text-[#526B68] font-bold border border-[#D3DEDB]">
                                100% Depository Backed
                            </span>
                            <span className="text-[#526B68] text-xs">BSP Escrow Standby</span>
                        </div>
                    </div>
                    <div className="w-full bg-[#E7F0EF] rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#059669] to-[#34D399] h-full rounded-full" style={{ width: "0%" }} />
                    </div>
                </div>

                {/* Tile 3: Active System Alerts */}
                <div className="bg-white p-5 rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] flex flex-col justify-between hover:border-[#D97706]/40 transition-colors">
                    <div className="flex items-center justify-between text-[#526B68]">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-[#526B68]">
                            Network Health Alerts
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#E1EAE9] flex items-center justify-center text-[#0D2322]">
                            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-center gap-4">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-[#059669] font-mono">0</span>
                                <span className="text-xs text-[#526B68] font-medium">Critical</span>
                            </div>
                            <span className="text-[#D3DEDB] font-bold">/</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-[#526B68] font-mono">0</span>
                                <span className="text-xs text-[#526B68] font-medium">Warnings</span>
                            </div>
                        </div>
                        <p className="text-xs text-[#526B68] mt-1 truncate">All network services operating normally</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#0D2322] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                        <span>Telemetry polling every 2,500ms</span>
                    </div>
                </div>

                {/* Tile 4: Dynamic Spot Feeder */}
                <div className="bg-gradient-to-br from-[#0A1C1B] via-[#0D2322] to-[#163331] text-white p-5 rounded-2xl shadow-[0_6px_20px_rgba(13,35,34,0.3)] flex flex-col justify-between relative overflow-hidden border border-[#526B68]/40">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#D97706]/10 pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-[#FEF3C7]">
                            Dynamic Spot Feeder
                        </span>
                        <span className="material-symbols-outlined text-[20px] text-[#FEF3C7]">currency_exchange</span>
                    </div>
                    <div className="my-2 relative z-10">
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl text-white tracking-tight font-extrabold font-mono">
                                58.4200
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#D97706]/25 text-[#FEF3C7] font-bold backdrop-blur-sm border border-[#FEF3C7]/30">
                                USD / PHP
                            </span>
                        </div>
                        <p className="text-xs text-white/70 mt-1">Ref: BAP Fix (Spread: +0.003)</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white/90 relative z-10 font-semibold">
                        <span className="text-white/80">InstaPay Cap: ₱50k/tx</span>
                        <span className="inline-flex items-center gap-1 text-[#6EE7B7] font-bold bg-[#059669]/20 px-2 py-0.5 rounded border border-[#059669]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />
                            Direct Rails Live
                        </span>
                    </div>
                </div>
            </div>

            {/* Real-Time Settlement Rails & Gateway Telemetry Strip */}
            <div className="bg-white p-5 rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D3DEDB]">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#0D2322]">Core Settlement Rails &amp; Clearings</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#E1EAE9] text-[#0D2322] font-bold border border-[#D3DEDB]">
                            Master Inventory Sec. IV
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-[#526B68] text-xs flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#059669]" /> Nominal &lt; 200ms
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#D97706]" /> Batch Queueing
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Degraded
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* InstaPay */}
                    <div className="p-3.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#0D2322]">InstaPay Rail</span>
                                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F8F3] text-[#059669] font-bold">
                                Operational
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs text-[#526B68] font-medium">Roundtrip Latency</span>
                            <span className="text-lg text-[#0D2322] font-bold font-mono">
                                --<span className="text-xs font-normal text-[#526B68]">ms</span>
                            </span>
                        </div>
                        <div className="mt-1 text-[#526B68] text-xs flex justify-between">
                            <span>Success Rate</span>
                            <span className="text-[#059669] font-bold">100%</span>
                        </div>
                    </div>

                    {/* PESONet */}
                    <div className="p-3.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#0D2322]">PESONet Clearing</span>
                                <span className="w-2 h-2 rounded-full bg-[#8B9F9D]" />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#EDF5F5] text-[#526B68] font-bold">
                                Window Standby
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs text-[#526B68] font-medium">Next Settlement Batch</span>
                            <span className="text-lg text-[#0D2322] font-bold font-mono">
                                16:00 <span className="text-xs font-normal text-[#526B68]">PHT</span>
                            </span>
                        </div>
                        <div className="mt-1 text-[#526B68] text-xs flex justify-between">
                            <span>Pending Outbound</span>
                            <span className="text-[#0D2322] font-bold">₱0.00 (0 items)</span>
                        </div>
                    </div>

                    {/* Card Gateway */}
                    <div className="p-3.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#0D2322]">Visa / Mastercard 3DS</span>
                                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F8F3] text-[#059669] font-bold">
                                Acquiring Live
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs text-[#526B68] font-medium">Auth Latency</span>
                            <span className="text-lg text-[#0D2322] font-bold font-mono">
                                --<span className="text-xs font-normal text-[#526B68]">ms</span>
                            </span>
                        </div>
                        <div className="mt-1 text-[#526B68] text-xs flex justify-between">
                            <span>Chargeback Index</span>
                            <span className="text-[#059669] font-bold">0.00% (Nominal)</span>
                        </div>
                    </div>

                    {/* RTGS RT-Clearing */}
                    <div className="p-3.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#0D2322]">PhilPaSSplus RTGS</span>
                                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F8F3] text-[#059669] font-bold">
                                Active Feed
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs text-[#526B68] font-medium">Depository Link</span>
                            <span className="text-base text-[#0D2322] font-bold font-mono">Synchronized</span>
                        </div>
                        <div className="mt-1 text-[#526B68] text-xs flex justify-between">
                            <span>Sub-account Sync</span>
                            <span className="text-[#0D2322] font-bold">Standby</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dual Grid: Left = Maker-Checker & AML Queue, Right = Dispute Hub & Audit Tape */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* LEFT COLUMN (7 Cols): Dual-Control Ledger & AML Queue */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                    {/* Module 1: Dual-Control Ledger Adjustment (Sec. L.10) */}
                    <div className="bg-white rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-[#E1EAE9] flex items-center justify-center text-[#0D2322]">
                                    <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#0D2322]">Dual-Control Ledger Adjustment</h2>
                                    <p className="text-xs text-[#526B68]">Maker-Checker Protocol • Sec. L.10 Back-Office Multi-Sig Rule</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-lg bg-[#E8F8F3] text-[#059669] text-xs font-bold border border-[#059669]/25">
                                Queue Clear (0 Pending)
                            </span>
                        </div>

                        {/* Empty Queue State */}
                        <div className="rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] p-8 flex flex-col items-center justify-center text-center gap-2">
                            <span className="material-symbols-outlined text-[36px] text-[#8B9F9D]">assignment_turned_in</span>
                            <p className="font-semibold text-sm text-[#0D2322]">No Pending Adjustments</p>
                            <p className="text-xs text-[#566C6A] max-w-md">The dual-control Maker-Checker multi-sig queue is clear. No journal entries require second officer sign-off or broadcast.</p>
                        </div>
                    </div>

                    {/* Module 2: AML & Sanctions Monitoring Queue (Sec. M.2, M.11) */}
                    <div className="bg-white rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] p-5 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F8F3] flex items-center justify-center text-[#059669]">
                                    <span className="material-symbols-outlined text-[22px]">shield</span>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#0D2322]">AML &amp; Sanctions Intercept Queue</h2>
                                    <p className="text-xs text-[#526B68]">Sec. M.2 Covered Threshold Alerts (&gt;₱500k) &amp; Sec. M.11 PEP Screening</p>
                                </div>
                            </div>
                            <span className="text-[11px] px-3 py-1 rounded-lg bg-[#E8F8F3] text-[#059669] border border-[#059669]/25 font-bold">
                                0 Cases Requiring Disposition
                            </span>
                        </div>

                        {/* Empty AML Queue */}
                        <div className="p-8 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex flex-col items-center justify-center text-center gap-2">
                            <span className="material-symbols-outlined text-[36px] text-[#059669]">verified_user</span>
                            <p className="font-semibold text-sm text-[#0D2322]">All Clear: No AML or Sanctions Intercepts</p>
                            <p className="text-xs text-[#566C6A] max-w-md">No covered threshold (&gt;₱500K), PEP screening hits, or structuring alerts detected.</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (5 Cols): Dispute Hub & Operational Ledgers */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                    {/* Module 3: Dispute & Chargeback Adjudication Hub (Sec. L.4) */}
                    <div className="bg-white rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-[#E1EAE9] flex items-center justify-center text-[#0D2322]">
                                    <span className="material-symbols-outlined text-[22px]">gavel</span>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#0D2322]">Dispute Adjudication Hub</h2>
                                    <p className="text-xs text-[#526B68]">Sec. L.4 Chargeback Arbiter &amp; Reserve Lock</p>
                                </div>
                            </div>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E8F8F3] text-[#059669] border border-[#059669]/25 font-bold">
                                0 Active Cases
                            </span>
                        </div>

                        {/* Empty Case State */}
                        <div className="rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] p-8 flex flex-col items-center justify-center text-center gap-2">
                            <span className="material-symbols-outlined text-[36px] text-[#8B9F9D]">gavel</span>
                            <p className="font-semibold text-sm text-[#0D2322]">No Open Adjudication Cases</p>
                            <p className="text-xs text-[#566C6A] max-w-sm">No cardholder chargebacks or merchant reserve locks currently require institutional arbiter disposition.</p>
                        </div>
                    </div>

                    {/* Module 4: High-Trust Real-time Audit Ledger Trail */}
                    <div className="bg-white rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#E1EAE9] flex items-center justify-center text-[#0D2322]">
                                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                </div>
                                <h3 className="text-sm font-bold text-[#0D2322]">Administrative Audit Tape</h3>
                            </div>
                            <span className="text-[11px] text-[#0D2322] font-bold bg-[#E8F8F3] px-2.5 py-0.5 rounded-full border border-[#059669]/25 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                                <span>Live Broadcast</span>
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="p-2.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex items-center justify-between text-[#0D2322]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[11px] text-[#526B68] shrink-0">15:48:12</span>
                                    <span className="text-xs truncate font-bold text-[#0D2322] font-mono">GATEWAY_ENCLAVE_ACTIVE</span>
                                    <span className="text-[#526B68] text-xs truncate">• Secure enclave operational on host node</span>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-[#059669] shrink-0 ml-2">check_circle</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex items-center justify-between text-[#0D2322]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[11px] text-[#526B68] shrink-0">15:41:09</span>
                                    <span className="text-xs truncate font-bold text-[#0D2322] font-mono">HSM_KEY_VALIDATED</span>
                                    <span className="text-[#526B68] text-xs truncate">• Hardware Security Module session key confirmed</span>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-[#059669] shrink-0 ml-2">check_circle</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex items-center justify-between text-[#0D2322]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[11px] text-[#526B68] shrink-0">15:33:45</span>
                                    <span className="text-xs truncate font-bold text-[#0D2322] font-mono">RULESET_SYNCHRONIZED</span>
                                    <span className="text-[#526B68] text-xs truncate">• AMLC threshold and sanction lists updated</span>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-[#059669] shrink-0 ml-2">check_circle</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex items-center justify-between text-[#0D2322]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[11px] text-[#526B68] shrink-0">15:20:00</span>
                                    <span className="text-xs truncate font-bold text-[#0D2322] font-mono">TELEMETRY_HEARTBEAT</span>
                                    <span className="text-[#526B68] text-xs truncate">• Nominal status report from MNL-CENTRAL-01</span>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-[#059669] shrink-0 ml-2">check_circle</span>
                            </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-xs text-[#526B68]">
                            <span>Ledger Protocol: Paxos / Quorum (5/5 nodes online)</span>
                            <button
                                type="button"
                                onClick={handleExportAuditZip}
                                className="text-[#D97706] hover:text-[#B45309] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <span>Export ISO-20022 Audit Zip</span>
                                <span className="material-symbols-outlined text-[14px]">download</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Guardrails Bottom Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#E1EAE9] via-white to-[#E1EAE9] border border-[#D3DEDB] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#0D2322] text-white flex items-center justify-center shadow-md shadow-[#0D2322]/20">
                        <span className="material-symbols-outlined text-[24px] text-[#D97706]">verified</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[#0D2322]">Bangko Sentral ng Pilipinas (BSP) Circular 982 Compliance Verified</h4>
                        <p className="text-xs text-[#526B68]">Electronic Money Issuer (EMI) &amp; Operator of Payment System (OPS) real-time risk supervision operational.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-white text-[#0D2322] font-bold border border-[#D3DEDB] shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#0D2322] text-[16px]">lock</span>
                        <span>SOC2 Type II Attested</span>
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-white text-[#0D2322] font-bold border border-[#D3DEDB] shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#0D2322] text-[16px]">security</span>
                        <span>PCI-DSS Level 1 v4.0</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
