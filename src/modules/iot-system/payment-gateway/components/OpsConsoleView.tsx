"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "./PaymentIcon";
import { LedgerEngineVisualizer } from "./ops/LedgerEngineVisualizer";
import { ThreeWayReconciliationHub } from "./ops/ThreeWayReconciliationHub";
import { AMLComplianceSecurityHub } from "./ops/AMLComplianceSecurityHub";

type OpsTab = "telemetry" | "ledger" | "reconciliation" | "compliance";

export function OpsConsoleView() {
    const [activeTab, setActiveTab] = useState<OpsTab>("telemetry");
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

    const tabs: { key: OpsTab; label: string; icon: string; sectionBadge: string }[] = [
        { key: "telemetry", label: "Global Telemetry & Rails", icon: "speed", sectionBadge: "Sec. K.4 / L.6" },
        { key: "ledger", label: "Core Ledger Engine", icon: "account_balance", sectionBadge: "Sec. K.1 – K.11" },
        { key: "reconciliation", label: "3-Way Recon & Clearing", icon: "receipt_long", sectionBadge: "Sec. L.1 – L.10" },
        { key: "compliance", label: "AML, Risk & Security", icon: "shield", sectionBadge: "Sec. M.1 – M.15" },
    ];

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Operational Status Bar & Header Summary */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] uppercase tracking-wider text-[#0D2322] font-bold bg-[#E1EAE9] px-2 py-0.5 rounded-md border border-[#526B68]/30">
                            Part III — Backend &amp; Processing Engines
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
                        Real-time ledger invariants, automated 3-way clearing recon, AML sanctions queue, and HSM key custody.
                    </p>
                </div>

                {/* Quick Action / Security Timestamp */}
                <div className="flex items-center gap-3 self-start xl:self-auto">
                    <div className="px-4 py-2 bg-white rounded-xl border border-[#D3DEDB] shadow-sm flex items-center gap-3">
                        <PaymentIcon name="schedule" className="w-5 h-5 text-[#D97706]" />
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
                        <PaymentIcon name="verified_user" className="w-[18px] h-[18px]" />
                        <span>Sign Session Token</span>
                    </button>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex p-1 bg-white rounded-2xl border border-[#D3DEDB] shadow-xs overflow-x-auto gap-1">
                {tabs.map((t) => {
                    const isActive = activeTab === t.key;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                isActive
                                    ? "bg-[#0D2322] text-white shadow-sm"
                                    : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#F4F7F6]"
                            }`}
                        >
                            <PaymentIcon
                                name={t.icon}
                                className={`w-4 h-4 ${isActive ? "text-[#D97706]" : "text-[#566C6A]"}`}
                            />
                            <span>{t.label}</span>
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                    isActive ? "bg-white/20 text-white" : "bg-[#EDF4F2] text-[#566C6A]"
                                }`}
                            >
                                {t.sectionBadge}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENT 1: GLOBAL TELEMETRY & RAILS */}
            {activeTab === "telemetry" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-150">
                    {/* Platform Vitals Banner (4 KPI Tiles) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {/* Tile 1: Core Throughput */}
                        <div className="bg-white p-5 rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] flex flex-col justify-between hover:border-[#D97706]/40 transition-colors">
                            <div className="flex items-center justify-between text-[#526B68]">
                                <span className="text-[11px] uppercase tracking-wider font-bold text-[#526B68]">
                                    Core Switch Throughput
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-[#E1EAE9] flex items-center justify-center text-[#0D2322]">
                                    <PaymentIcon name="speed" className="w-[18px] h-[18px]" />
                                </div>
                            </div>
                            <div className="my-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#0D2322] font-mono tracking-tight">142</span>
                                    <span className="text-sm text-[#526B68] font-semibold">TPS</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center text-[#059669] text-[11px] font-bold bg-[#E8F5F1] px-1.5 py-0.5 rounded border border-[#BCE3D6]">
                                        <PaymentIcon name="arrow_upward" className="w-3.5 h-3.5" /> +12.4%
                                    </span>
                                    <span className="text-[#526B68] text-xs">Peak load headroom: 85%</span>
                                </div>
                            </div>
                            <div className="w-full bg-[#E7F0EF] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#D97706] h-full rounded-full" style={{ width: "42%" }} />
                            </div>
                        </div>

                        {/* Tile 2: Settlement Float Reserves */}
                        <div className="bg-white p-5 rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] flex flex-col justify-between hover:border-[#D97706]/40 transition-colors">
                            <div className="flex items-center justify-between text-[#526B68]">
                                <span className="text-[11px] uppercase tracking-wider font-bold text-[#526B68]">
                                    24h Settlement Float Pool
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-[#E8F8F3] flex items-center justify-center text-[#059669]">
                                    <PaymentIcon name="account_balance" className="w-[18px] h-[18px]" />
                                </div>
                            </div>
                            <div className="my-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-[28px] font-black text-[#0D2322] font-mono tracking-tight">
                                        ₱48,500,000.00
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#E8F8F3] text-[#059669] font-bold border border-[#BCE3D6]">
                                        100% Depository Backed
                                    </span>
                                    <span className="text-[#526B68] text-xs">BSP Escrow Compliant</span>
                                </div>
                            </div>
                            <div className="w-full bg-[#E7F0EF] rounded-full h-1.5 overflow-hidden">
                                <div className="bg-[#059669] h-full rounded-full" style={{ width: "100%" }} />
                            </div>
                        </div>

                        {/* Tile 3: Active System Alerts */}
                        <div className="bg-white p-5 rounded-2xl border border-[#D3DEDB] shadow-[0_2px_8px_rgba(13,35,34,0.03)] flex flex-col justify-between hover:border-[#D97706]/40 transition-colors">
                            <div className="flex items-center justify-between text-[#526B68]">
                                <span className="text-[11px] uppercase tracking-wider font-bold text-[#526B68]">
                                    Network Health Alerts
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-[#E1EAE9] flex items-center justify-center text-[#0D2322]">
                                    <PaymentIcon name="notifications_active" className="w-[18px] h-[18px]" />
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
                                <PaymentIcon name="currency_exchange" className="w-5 h-5 text-[#FEF3C7]" />
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

                    {/* Settlement Rails Telemetry Strip */}
                    <div className="bg-white p-5 rounded-2xl border border-[#D3DEDB] shadow-xs">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D3DEDB]">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-[#0D2322]">Core Settlement Rails &amp; Clearings</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#E1EAE9] text-[#0D2322] font-bold border border-[#D3DEDB]">
                                    Sec. K.4
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-[#526B68] text-xs flex-wrap">
                                <span className="flex items-center gap-1 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-[#059669]" /> Nominal &lt; 200ms
                                </span>
                                <span className="flex items-center gap-1 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-[#D97706]" /> Batch Queueing
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* InstaPay */}
                            <div className="p-3.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-[#0D2322]">InstaPay Rail</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F8F3] text-[#059669] font-bold">
                                        Operational
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xs text-[#526B68] font-medium">Latency</span>
                                    <span className="text-lg text-[#0D2322] font-bold font-mono">
                                        42<span className="text-xs font-normal text-[#526B68]">ms</span>
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
                                    <span className="text-xs font-bold text-[#0D2322]">PESONet Clearing</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#EDF5F5] text-[#566C6A] font-bold">
                                        Window Standby
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xs text-[#526B68] font-medium">Next Settlement Batch</span>
                                    <span className="text-lg text-[#0D2322] font-bold font-mono">16:00 PHT</span>
                                </div>
                                <div className="mt-1 text-[#526B68] text-xs flex justify-between">
                                    <span>Pending Outbound</span>
                                    <span className="text-[#0D2322] font-bold">₱0.00 (0 items)</span>
                                </div>
                            </div>

                            {/* Card Gateway */}
                            <div className="p-3.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-[#0D2322]">Visa / Mastercard 3DS</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F8F3] text-[#059669] font-bold">
                                        Acquiring Live
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xs text-[#526B68] font-medium">Auth Latency</span>
                                    <span className="text-lg text-[#0D2322] font-bold font-mono">
                                        88<span className="text-xs font-normal text-[#526B68]">ms</span>
                                    </span>
                                </div>
                                <div className="mt-1 text-[#526B68] text-xs flex justify-between">
                                    <span>Chargeback Index</span>
                                    <span className="text-[#059669] font-bold">0.00% (Nominal)</span>
                                </div>
                            </div>

                            {/* RTGS PhilPaSSplus */}
                            <div className="p-3.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-[#0D2322]">PhilPaSSplus RTGS</span>
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
                                    <span className="text-[#059669] font-bold">Nominal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audit Tape & Non-Repudiation */}
                    <div className="bg-white rounded-2xl border border-[#D3DEDB] shadow-xs p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#E1EAE9] flex items-center justify-center text-[#0D2322]">
                                    <PaymentIcon name="receipt_long" className="w-[18px] h-[18px]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#0D2322]">Cryptographic Administrative Audit Tape</h3>
                                    <p className="text-[11px] text-[#566C6A]">Sec. L.6 append-only tamper-evident hash chain</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleExportAuditZip}
                                className="text-xs text-[#D97706] hover:text-[#B45309] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <PaymentIcon name="download" className="w-3.5 h-3.5" />
                                <span>Export ISO-20022 Audit Zip</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5 font-mono text-xs">
                            <div className="p-2.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex items-center justify-between text-[#0D2322]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[11px] text-[#566C6A] shrink-0">10:44:12</span>
                                    <span className="font-bold text-[#0D2322]">GATEWAY_ENCLAVE_ACTIVE</span>
                                    <span className="text-[#566C6A] text-xs truncate font-sans">• Host node MNL-CENTRAL-01 operational</span>
                                </div>
                                <PaymentIcon name="check_circle" className="w-4 h-4 text-[#059669] shrink-0 ml-2" />
                            </div>

                            <div className="p-2.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex items-center justify-between text-[#0D2322]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[11px] text-[#566C6A] shrink-0">10:41:09</span>
                                    <span className="font-bold text-[#0D2322]">HSM_KEY_VALIDATED</span>
                                    <span className="text-[#566C6A] text-xs truncate font-sans">• Hardware Security Module session key confirmed</span>
                                </div>
                                <PaymentIcon name="check_circle" className="w-4 h-4 text-[#059669] shrink-0 ml-2" />
                            </div>

                            <div className="p-2.5 rounded-xl bg-[#EDF5F5] border border-[#D3DEDB] flex items-center justify-between text-[#0D2322]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[11px] text-[#566C6A] shrink-0">10:33:45</span>
                                    <span className="font-bold text-[#0D2322]">RULESET_SYNCHRONIZED</span>
                                    <span className="text-[#566C6A] text-xs truncate font-sans">• AMLC threshold and sanction lists updated</span>
                                </div>
                                <PaymentIcon name="check_circle" className="w-4 h-4 text-[#059669] shrink-0 ml-2" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: CORE LEDGER ENGINE (SEC. K) */}
            {activeTab === "ledger" && <LedgerEngineVisualizer />}

            {/* TAB CONTENT 3: RECONCILIATION & CLEARING (SEC. L) */}
            {activeTab === "reconciliation" && <ThreeWayReconciliationHub />}

            {/* TAB CONTENT 4: AML, RISK & COMPLIANCE (SEC. M) */}
            {activeTab === "compliance" && <AMLComplianceSecurityHub />}

            {/* Operational Guardrails Bottom Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#E1EAE9] via-white to-[#E1EAE9] border border-[#D3DEDB] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#0D2322] text-white flex items-center justify-center shadow-md shadow-[#0D2322]/20">
                        <PaymentIcon name="verified" className="w-6 h-6 text-[#D97706]" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[#0D2322]">
                            Bangko Sentral ng Pilipinas (BSP) Circular 982 Compliance Verified
                        </h4>
                        <p className="text-xs text-[#526B68]">
                            Electronic Money Issuer (EMI) &amp; Operator of Payment System (OPS) real-time risk supervision operational.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-white text-[#0D2322] font-bold border border-[#D3DEDB] shadow-sm flex items-center gap-1">
                        <PaymentIcon name="lock" className="text-[#0D2322] w-4 h-4" />
                        <span>SOC2 Type II Attested</span>
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-white text-[#0D2322] font-bold border border-[#D3DEDB] shadow-sm flex items-center gap-1">
                        <PaymentIcon name="security" className="text-[#0D2322] w-4 h-4" />
                        <span>PCI-DSS Level 1 v4.0</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
