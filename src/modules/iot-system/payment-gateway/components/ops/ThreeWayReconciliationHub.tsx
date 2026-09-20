"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ReconciliationReportItem, AdjudicationCase, DualControlAdjustment } from "../../types";
import { PaymentIcon } from "../PaymentIcon";

const INITIAL_RECON: ReconciliationReportItem[] = [
    {
        id: "REC-2026-0919-01",
        rail: "InstaPay",
        windowDate: "Today 10:00 Window",
        ledgerCount: 1420,
        ledgerAmount: 2840000,
        bankSwitchCount: 1420,
        bankSwitchAmount: 2840000,
        variance: 0,
        status: "Balanced",
    },
    {
        id: "REC-2026-0919-02",
        rail: "QR Ph P2M",
        windowDate: "Today 10:00 Window",
        ledgerCount: 890,
        ledgerAmount: 1145000,
        bankSwitchCount: 890,
        bankSwitchAmount: 1145000,
        variance: 0,
        status: "Balanced",
    },
    {
        id: "REC-2026-0919-03",
        rail: "Visa/Mastercard",
        windowDate: "Today 10:00 Window",
        ledgerCount: 452,
        ledgerAmount: 1680500,
        bankSwitchCount: 451,
        bankSwitchAmount: 1679000,
        variance: -1500,
        status: "Variance Flagged",
    },
    {
        id: "REC-2026-0919-04",
        rail: "PESONet",
        windowDate: "Yesterday Cutoff",
        ledgerCount: 310,
        ledgerAmount: 8940000,
        bankSwitchCount: 310,
        bankSwitchAmount: 8940000,
        variance: 0,
        status: "Auto-Settled",
    },
];

const INITIAL_DISPUTES: AdjudicationCase[] = [
    {
        caseId: "DSP-MNL-2026-081",
        disputedValue: 2450.0,
        payerName: "Roberto Gomez",
        payerCard: "Visa **** 4912",
        merchantName: "Flagship BGC High Street",
        merchantId: "MID-MNL-884190",
        claimCategory: "Goods Not Received (13.1)",
        reserveStatus: "Collateral Held (Sec. L.7)",
        evidenceDocument: "Proof_of_Delivery_Signed.pdf",
        uploadedTime: "2 hours ago",
        status: "Open",
    },
];

const INITIAL_MAKER_CHECKER: DualControlAdjustment[] = [
    {
        journalRef: "ADJ-2026-901",
        adjustmentAmount: 1500.0,
        targetAccount: "2010-MERCHANT-PAYABLE-084",
        correspondent: "Visa Acquiring Clearing Pool",
        reasonCode: "ERR-CARD-ORPHAN-AUTH",
        reasonDescription: "Late settlement clearing tape ingestion from card network",
        initiatingOfficer: "Officer J. Ramos (Maker)",
        timestamp: "10:15 AM",
        ledgerHash: "sha256:d8a9...120f",
        justification: "Acquiring switch log confirms auth code #8821 was captured at terminal.",
        status: "Pending",
    },
];

export function ThreeWayReconciliationHub() {
    const [reconList, setReconList] = useState<ReconciliationReportItem[]>(INITIAL_RECON);
    const [disputes, setDisputes] = useState<AdjudicationCase[]>(INITIAL_DISPUTES);
    const [makerCheckerQueue, setMakerCheckerQueue] = useState<DualControlAdjustment[]>(INITIAL_MAKER_CHECKER);

    // Sec. L.1 / L.4 Automated Break Matching
    const handleResolveBreak = (reportId: string) => {
        toast.info("Executing 3-Way Break Match Engine", {
            description: `Comparing clearing tape against internal shadow ledger and acquirer raw logs...`,
        });

        setTimeout(() => {
            setReconList((prev) =>
                prev.map((r) => (r.id === reportId ? { ...r, variance: 0, status: "Auto-Settled" } : r))
            );
            toast.success("Break Matched & Cleared", {
                description: "Orphaned transaction found in Visa batch 401 and auto-reconciled.",
            });
        }, 1000);
    };

    // Sec. L.3 Dispute Representment
    const handleRepresentDispute = (caseId: string) => {
        toast.info("Transmitting Chargeback Representment", {
            description: `Uploading evidence packet to Card Scheme Arbitration Portal...`,
        });

        setTimeout(() => {
            setDisputes((prev) =>
                prev.map((d) => (d.caseId === caseId ? { ...d, status: "Dismissed" } : d))
            );
            toast.success("Dispute Dismissed in Merchant Favor", {
                description: `Signed proof of delivery validated. Collateral reserve hold released to merchant.`,
            });
        }, 1000);
    };

    // Sec. L.10 Maker-Checker Second Officer Sign-off
    const handleAuthorizeAdjustment = (ref: string) => {
        toast.info("Dual-Control Signature Required", {
            description: "Signing adjustment with Checker Officer private key token...",
        });

        setTimeout(() => {
            setMakerCheckerQueue((prev) =>
                prev.map((m) => (m.journalRef === ref ? { ...m, status: "Authorized" } : m))
            );
            toast.success("Adjustment Authorized & Committed", {
                description: `Ledger entry ${ref} committed to master double-entry journal.`,
            });
        }, 800);
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#D3DEDB] shadow-xs flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D3DEDB]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D2322] text-white flex items-center justify-center">
                        <PaymentIcon name="account_balance" className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-[#0D2322]">
                                Settlement, Clearing &amp; 3-Way Reconciliation
                            </h2>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] font-mono font-bold border border-[#D3DEDB]">
                                Sec. L.1 – L.10
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Automated 3-way clearing match, break management, dispute arbitration, and dual-control adjustment
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-[#EDF4F2] text-[#0D2322] font-bold border border-[#D3DEDB] flex items-center gap-1 font-mono">
                        <span>Recon Cycle: Real-Time + T+1 Cutoff</span>
                    </span>
                </div>
            </div>

            {/* Module 1: Automated 3-Way Reconciliation Pipeline (Sec. L.1, L.4) */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-[#0D2322] uppercase tracking-wider">
                            3-Way Clearing &amp; Settlement Comparison
                        </span>
                        <p className="text-[11px] text-[#566C6A]">
                            Compares: 1. Core Internal Ledger &harr; 2. Switch Batch Clearing &harr; 3. Settlement Depository Nostro
                        </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F5F1] text-[#0F5B46] font-bold border border-[#BCE3D6]">
                        4 Active Clearing Rails
                    </span>
                </div>

                <div className="overflow-x-auto w-full border border-[#D3DEDB] rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-[#EDF4F2] text-[#566C6A] uppercase font-bold text-[10px] border-b border-[#D3DEDB]">
                            <tr>
                                <th className="py-2.5 px-3">Reconciliation Rail &amp; Window</th>
                                <th className="py-2.5 px-3 text-right">Internal Ledger Count &amp; Total</th>
                                <th className="py-2.5 px-3 text-right">Switch Tape Count &amp; Total</th>
                                <th className="py-2.5 px-3 text-right">Net Variance</th>
                                <th className="py-2.5 px-3 text-center">Status</th>
                                <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D3DEDB]/60">
                            {reconList.map((r) => (
                                <tr key={r.id} className="hover:bg-[#F4F7F6] transition-colors">
                                    <td className="py-2.5 px-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#0D2322]">{r.rail}</span>
                                            <span className="text-[10px] text-[#566C6A] font-mono">{r.windowDate}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#0D2322]">
                                                ₱{r.ledgerAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[10px] text-[#566C6A]">{r.ledgerCount} txs</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#0D2322]">
                                                ₱{r.bankSwitchAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[10px] text-[#566C6A]">{r.bankSwitchCount} txs</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-xs">
                                        <span className={r.variance !== 0 ? "text-[#DC2626]" : "text-[#059669]"}>
                                            ₱{r.variance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                                                r.status === "Balanced" || r.status === "Auto-Settled"
                                                    ? "bg-[#E8F5F1] text-[#0F5B46] border-[#BCE3D6]"
                                                    : "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                                            }`}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                        {r.status === "Variance Flagged" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleResolveBreak(r.id)}
                                                className="px-2.5 py-1 rounded bg-[#D97706] text-white text-[10px] font-bold hover:bg-[#B45309] transition-colors cursor-pointer shadow-xs"
                                            >
                                                Auto-Break Match
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-[#566C6A]">Reconciled</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Split: Left = Dispute Adjudication (Sec. L.3, L.7), Right = Maker-Checker Queue (Sec. L.10) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dispute & Chargeback Engine (Sec. L.3, L.7) */}
                <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <PaymentIcon name="gavel" className="w-4 h-4 text-[#D97706]" />
                                <span className="text-xs font-bold text-[#0D2322]">
                                    Chargeback &amp; Dispute Adjudication
                                </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#566C6A] border border-[#D3DEDB]">
                                Sec. L.3 / L.7
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Cardholder claim arbitration, merchant evidence representment, and collateral reserve hold
                        </p>
                    </div>

                    {disputes.map((d) => (
                        <div key={d.caseId} className="p-3 bg-white rounded-xl border border-[#D3DEDB] flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-xs font-bold text-[#0D2322] font-mono">{d.caseId}</span>
                                    <span className="text-[11px] text-[#566C6A] block">{d.claimCategory}</span>
                                </div>
                                <span className="font-mono font-bold text-sm text-[#C2410C]">
                                    ₱{d.disputedValue.toFixed(2)}
                                </span>
                            </div>

                            <div className="text-[11px] text-[#566C6A] flex items-center justify-between pt-1 border-t border-[#D3DEDB]">
                                <span>Payer: {d.payerName} ({d.payerCard})</span>
                                <span className="text-[#D97706] font-semibold">{d.reserveStatus}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-[#566C6A]">Evidence: {d.evidenceDocument}</span>
                                {d.status === "Open" ? (
                                    <button
                                        type="button"
                                        onClick={() => handleRepresentDispute(d.caseId)}
                                        className="px-2.5 py-1 rounded bg-[#0D2322] text-white text-[10px] font-bold hover:bg-[#163331] cursor-pointer"
                                    >
                                        Submit Evidence &amp; Dismiss
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-[#059669] font-bold">Claim Dismissed</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Maker-Checker Adjustment Protocol (Sec. L.10) */}
                <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <PaymentIcon name="how_to_reg" className="w-4 h-4 text-[#059669]" />
                                <span className="text-xs font-bold text-[#0D2322]">
                                    Dual-Control Maker-Checker Queue
                                </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#566C6A] border border-[#D3DEDB]">
                                Sec. L.10
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Manual back-office adjustments require 2nd officer multi-sig signoff prior to ledger broadcast
                        </p>
                    </div>

                    {makerCheckerQueue.map((m) => (
                        <div key={m.journalRef} className="p-3 bg-white rounded-xl border border-[#D3DEDB] flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-xs font-bold text-[#0D2322] font-mono">{m.journalRef}</span>
                                    <span className="text-[11px] text-[#566C6A] block">{m.reasonDescription}</span>
                                </div>
                                <span className="font-mono font-bold text-sm text-[#0D2322]">
                                    ₱{m.adjustmentAmount.toFixed(2)}
                                </span>
                            </div>

                            <div className="text-[11px] text-[#566C6A] flex items-center justify-between pt-1 border-t border-[#D3DEDB]">
                                <span>Target: {m.targetAccount}</span>
                                <span className="text-[#566C6A]">{m.initiatingOfficer}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-[#8B9F9D] font-mono truncate max-w-[160px]">
                                    Hash: {m.ledgerHash}
                                </span>
                                {m.status === "Pending" ? (
                                    <button
                                        type="button"
                                        onClick={() => handleAuthorizeAdjustment(m.journalRef)}
                                        className="px-2.5 py-1 rounded bg-[#059669] text-white text-[10px] font-bold hover:bg-[#047857] cursor-pointer"
                                    >
                                        Authorize as Checker
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-[#059669] font-bold">Authorized &amp; Committed</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
