"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { AMLAlertItem } from "../../types";
import { PaymentIcon } from "../PaymentIcon";

const INITIAL_AML_ALERTS: AMLAlertItem[] = [
    {
        id: "AML-CTR-8891",
        entityName: "Golden Bridge Holdings Inc.",
        alertType: "Covered Threshold",
        severity: "danger",
        accountNumber: "0917-882-9012",
        amount: 650000.0,
        channel: "PESONet Interbank",
        description: "Covered Transaction Report: Single transfer exceeds BSP statutory threshold of ₱500,000.00.",
        matchRule: "BSP Circ. 982 / AMLC Rule 5.1 (CTR Threshold)",
        originNode: "MNL-CLEARING-02",
        queueAge: "14 mins ago",
        status: "Pending",
    },
    {
        id: "AML-STR-8884",
        entityName: "Danilo Santos & Co.",
        alertType: "Structuring Surge",
        severity: "danger",
        accountNumber: "0928-331-4409",
        amount: 495000.0,
        channel: "InstaPay Direct",
        description: "Smurfing Detection: 4 consecutive transactions of ₱495,000 within 35 minutes just below reporting ceiling.",
        matchRule: "Sec. M.4 Velocity Structuring / Smurfing Heuristic",
        originNode: "MNL-SWITCH-01",
        queueAge: "42 mins ago",
        status: "Investigating",
    },
    {
        id: "AML-PEP-8872",
        entityName: "Elena V. Morales",
        alertType: "PEP Match",
        severity: "amber",
        accountNumber: "0908-112-7781",
        amount: 85000.0,
        channel: "Cross-Border Remittance",
        description: "Politically Exposed Person (PEP) fuzzy name match against Anti-Money Laundering Council registry.",
        matchRule: "Sec. M.9 UN / AMLC PEP Watchlist Screening",
        originNode: "MNL-GW-REMIT",
        queueAge: "1 hour ago",
        status: "Pending",
    },
];

export function AMLComplianceSecurityHub() {
    const [alerts, setAlerts] = useState<AMLAlertItem[]>(INITIAL_AML_ALERTS);
    const [hsmKeyVersion, setHsmKeyVersion] = useState("v4.2-FIPS140-L3");
    const [isRotatingKeys, setIsRotatingKeys] = useState(false);

    // Sec. M.2 / M.9 AML Adjudication Actions
    const handleFileStr = (alertId: string) => {
        toast.info("Transmitting AMLC STR Report", {
            description: `Transmitting XML Suspicious Transaction Report to Anti-Money Laundering Council (AMLC)...`,
        });

        setTimeout(() => {
            setAlerts((prev) =>
                prev.map((a) => (a.id === alertId ? { ...a, status: "Report Filed" } : a))
            );
            toast.success("STR Report Filed with AMLC", {
                description: `Statutory filing acknowledged by AMLC Gateway with Ack #AMLC-ACK-${Date.now().toString().slice(-6)}.`,
            });
        }, 1000);
    };

    const handleClearAlert = (alertId: string) => {
        toast.info("Clearing False Positive", {
            description: "Compliance officer rationale logged in permanent audit log.",
        });

        setTimeout(() => {
            setAlerts((prev) => prev.filter((a) => a.id !== alertId));
            toast.success("Alert Cleared", { description: "Transaction unblocked and funds released." });
        }, 500);
    };

    // Sec. M.13 HSM Key Rotation
    const handleRotateHsmKeys = () => {
        setIsRotatingKeys(true);
        toast.info("Initiating FIPS 140-2 Key Ceremony", {
            description: "Generating new Zone Master Key (ZMK) inside hardware secure cryptoprocessor...",
        });

        setTimeout(() => {
            setHsmKeyVersion("v4.3-FIPS140-L3");
            setIsRotatingKeys(false);
            toast.success("HSM Key Rotation Complete", {
                description: "New DUKPT base keys and ZMK v4.3 active across all host security modules.",
            });
        }, 1500);
    };

    // Sec. M.15 BSP Statutory Report Export
    const handleExportBspReport = () => {
        toast.success("BSP Statutory Returns Exported", {
            description: "Generated BSP Form EMI-OPS (Circular 982) XML package with digital supervisor signature.",
        });
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#D3DEDB] shadow-xs flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D3DEDB]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D2322] text-white flex items-center justify-center">
                        <PaymentIcon name="shield" className="w-5 h-5 text-[#059669]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-[#0D2322]">
                                Risk, AML/CFT, Security &amp; Compliance Core
                            </h2>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] font-mono font-bold border border-[#D3DEDB]">
                                Sec. M.1 – M.15
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            AMLC covered threshold monitoring, structuring detection, HSM key custody, and BSP statutory reporting
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleExportBspReport}
                        className="px-3 py-1.5 rounded-xl bg-[#0D2322] text-white text-xs font-bold hover:bg-[#163331] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                        <PaymentIcon name="download" className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Export BSP Form EMI-OPS</span>
                    </button>
                </div>
            </div>

            {/* AML / Sanctions Intercept Queue (Sec. M.2, M.4, M.9) */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-[#0D2322] uppercase tracking-wider">
                            AML / CFT &amp; Sanctions Intercept Queue
                        </span>
                        <p className="text-[11px] text-[#566C6A]">
                            Automated screening for covered transactions (&gt;₱500k), smurfing structuring, and PEP matches
                        </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-bold border border-[#FDE68A]">
                        {alerts.filter((a) => a.status !== "Report Filed").length} Active Cases Requiring Disposition
                    </span>
                </div>

                <div className="flex flex-col gap-3">
                    {alerts.length === 0 ? (
                        <div className="p-8 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] text-center text-[#566C6A]">
                            All AML &amp; Sanctions queues are clear.
                        </div>
                    ) : (
                        alerts.map((a) => (
                            <div
                                key={a.id}
                                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                                    a.severity === "danger"
                                        ? "bg-white border-l-4 border-l-[#DC2626] border-[#D3DEDB]"
                                        : "bg-white border-l-4 border-l-[#D97706] border-[#D3DEDB]"
                                }`}
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-mono font-bold text-[#0D2322]">{a.id}</span>
                                        <span className="text-[#8B9F9D]">•</span>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                a.severity === "danger"
                                                    ? "bg-[#FEE2E2] text-[#DC2626]"
                                                    : "bg-[#FEF3C7] text-[#B45309]"
                                            }`}
                                        >
                                            {a.alertType}
                                        </span>
                                        <span className="text-[#8B9F9D]">•</span>
                                        <span className="text-xs font-bold text-[#0D2322]">{a.entityName}</span>
                                        <span className="text-[11px] text-[#566C6A] font-mono">({a.accountNumber})</span>
                                    </div>
                                    <p className="text-xs text-[#566C6A]">{a.description}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-[#8B9F9D] mt-1">
                                        <span>Rule: <strong className="text-[#566C6A]">{a.matchRule}</strong></span>
                                        <span>•</span>
                                        <span>Node: <strong className="text-[#566C6A]">{a.originNode}</strong></span>
                                        <span>•</span>
                                        <span>Age: {a.queueAge}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-2 shrink-0">
                                    <span className="font-mono font-black text-lg text-[#0D2322]">
                                        ₱{a.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                    {a.status === "Pending" || a.status === "Investigating" ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleClearAlert(a.id)}
                                                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D3DEDB] text-[#566C6A] text-[11px] font-semibold hover:bg-[#F4F7F6] cursor-pointer"
                                            >
                                                Clear (False Positive)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleFileStr(a.id)}
                                                className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-[11px] font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-xs"
                                            >
                                                File STR with AMLC
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-[#059669] flex items-center gap-1">
                                            <PaymentIcon name="check_circle" className="w-4 h-4" />
                                            <span>AMLC STR Form Dispatched</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Security Grid: HSM Key Management & Security Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* HSM Hardware Key Custody (Sec. M.13) */}
                <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <PaymentIcon name="key" className="w-4 h-4 text-[#0D2322]" />
                                <span className="text-xs font-bold text-[#0D2322]">
                                    HSM Key Management Vault (FIPS 140-2 Level 3)
                                </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#566C6A] border border-[#D3DEDB]">
                                Sec. M.13
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Hardware Security Modules generating, rotating, and managing master zone and PIN encryption keys
                        </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#D3DEDB] flex flex-col gap-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[#566C6A] font-sans">Active Zone Master Key:</span>
                            <span className="font-bold text-[#0D2322]">{hsmKeyVersion}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[#566C6A] font-sans">DUKPT Base Derivation Key:</span>
                            <span className="text-[#059669] font-bold">SYNCHRONIZED (Tier-3)</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[#566C6A] font-sans">Hardware Enclave State:</span>
                            <span className="text-[#059669] font-bold">TAMPER-EVIDENT SECURE</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={isRotatingKeys}
                        onClick={handleRotateHsmKeys}
                        className="w-full py-2 rounded-lg bg-[#0D2322] text-white text-xs font-bold hover:bg-[#163331] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                        <PaymentIcon name="sync" className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>{isRotatingKeys ? "Rotating Cryptographic Keys..." : "Perform Key Ceremony & Rotate ZMK"}</span>
                    </button>
                </div>

                {/* Additional Risk & Defense Heuristics (Sec. M.3, M.5, M.6, M.7, M.14) */}
                <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <PaymentIcon name="security" className="w-4 h-4 text-[#059669]" />
                                <span className="text-xs font-bold text-[#0D2322]">
                                    Risk Supervision &amp; Threat Defense Invariants
                                </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#566C6A] border border-[#D3DEDB]">
                                Sec. M.3 – M.15
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Real-time threat heuristics active across all processing pipelines
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-white border border-[#D3DEDB]">
                            <span className="text-[#566C6A] block">Sec. M.5 BIN Defense</span>
                            <span className="text-[#059669] font-bold">CVV Brute Lock Active</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-[#D3DEDB]">
                            <span className="text-[#566C6A] block">Sec. M.6 Travel Velocity</span>
                            <span className="text-[#059669] font-bold">Geo-Hop Intercept On</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-[#D3DEDB]">
                            <span className="text-[#566C6A] block">Sec. M.7 Device Binding</span>
                            <span className="text-[#059669] font-bold">Hardware Keystore Bound</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-[#D3DEDB]">
                            <span className="text-[#566C6A] block">Sec. M.14 TLS 1.3 mTLS</span>
                            <span className="text-[#059669] font-bold">Forward Secrecy Strict</span>
                        </div>
                    </div>

                    <div className="text-[11px] text-[#566C6A] p-2 rounded-lg bg-[#EDF4F2] border border-[#D3DEDB]">
                        Supervisory audit trail stream connected directly to Bangko Sentral ng Pilipinas supervisory node.
                    </div>
                </div>
            </div>
        </div>
    );
}
