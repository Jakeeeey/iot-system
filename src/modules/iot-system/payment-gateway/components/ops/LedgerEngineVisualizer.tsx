"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { DoubleEntryJournalEntry } from "../../types";
import { PaymentIcon } from "../PaymentIcon";

const INITIAL_JOURNAL: DoubleEntryJournalEntry[] = [
    {
        id: "JRN-9081",
        timestamp: "10:44:12 AM",
        description: "P2M Settlement: Merchant Flagship BGC",
        debitAccount: "1010-SETTLEMENT-CLEARING",
        creditAccount: "2010-MERCHANT-PAYABLE-084",
        amount: 1827.8,
        currency: "PHP",
        idempotencyKey: "idem_8f912bc09a4",
        signature: "ecdsa:3045022100...d81a",
    },
    {
        id: "JRN-9080",
        timestamp: "10:44:12 AM",
        description: "MDR Revenue Withholding: 1.2% + BIR 1%",
        debitAccount: "2010-MERCHANT-PAYABLE-084",
        creditAccount: "4010-FEE-REVENUE-MDR",
        amount: 22.2,
        currency: "PHP",
        idempotencyKey: "idem_8f912bc09a4_fee",
        signature: "ecdsa:3045022101...99e2",
    },
    {
        id: "JRN-9078",
        timestamp: "10:41:00 AM",
        description: "InstaPay Inbound Cash-In: BDO Unibank",
        debitAccount: "1020-INSTAPAY-NOSTRO-BDO",
        creditAccount: "2001-CONSUMER-WALLET-ESCROW",
        amount: 5000.0,
        currency: "PHP",
        idempotencyKey: "idem_9104fae8910",
        signature: "ecdsa:3045022100...77b1",
    },
];

export function LedgerEngineVisualizer() {
    const [journal, setJournal] = useState<DoubleEntryJournalEntry[]>(INITIAL_JOURNAL);
    const [holdState, setHoldState] = useState<"idle" | "holding" | "captured" | "voided">("idle");
    const [holdAmount] = useState(3500);
    const [idempotencyKey] = useState("idem_8f912bc09a4");
    const [sagaStep, setSagaStep] = useState<number>(0);
    const [sagaStatus, setSagaStatus] = useState<"idle" | "running" | "completed" | "compensated">("idle");

    // Two-Phase Hold & Capture simulation (Sec. K.1, K.7)
    const handleAuthorizeHold = () => {
        setHoldState("holding");
        toast.info("Phase 1: Authorization Hold Locked", {
            description: `₱${holdAmount.toFixed(2)} temporarily reserved in Escrow (Pessimistic Lock Sec. K.7).`,
        });
    };

    const handleCaptureHold = () => {
        setHoldState("captured");
        const newEntry: DoubleEntryJournalEntry = {
            id: `JRN-${Math.floor(9090 + Math.random() * 100)}`,
            timestamp: new Date().toLocaleTimeString(),
            description: `Captured Pre-Auth Hold: ₱${holdAmount.toFixed(2)}`,
            debitAccount: "2001-CONSUMER-RESERVED-HOLD",
            creditAccount: "1010-MERCHANT-SETTLED-FUNDS",
            amount: holdAmount,
            currency: "PHP",
            idempotencyKey: idempotencyKey,
            signature: `ecdsa:3045022100...${Math.random().toString(16).substring(2, 6)}`,
        };
        setJournal((prev) => [newEntry, ...prev]);
        toast.success("Phase 2: Authorization Captured", {
            description: `Atomic journal debit/credit executed. Balance locked funds finalized to merchant.`,
        });
    };

    const handleVoidHold = () => {
        setHoldState("voided");
        toast.warning("Phase 2: Authorization Voided", {
            description: `Hold released back to user wallet. Zero fee incurred.`,
        });
    };

    // Saga Distributed Transaction Simulation (Sec. K.8)
    const handleRunSaga = () => {
        setSagaStatus("running");
        setSagaStep(1);
        toast.info("Saga Step 1: Ledger Pre-Allocation", { description: "Reserving float on source account..." });

        setTimeout(() => {
            setSagaStep(2);
            toast.info("Saga Step 2: Switch Clearing", { description: "Transmitting ISO-20022 Pacs.008 to InstaPay..." });

            setTimeout(() => {
                setSagaStep(3);
                setSagaStatus("completed");
                toast.success("Saga Step 3: Destination Ack Confirmed", {
                    description: "All 3 distributed stages committed with 0 compensations required.",
                });
            }, 1000);
        }, 1000);
    };

    const handleCompensateSaga = () => {
        setSagaStatus("compensated");
        setSagaStep(0);
        toast.error("Saga Compensation Dispatched", {
            description: "Executing reverse compensating transactions on ledger to restore pre-failure invariant.",
        });
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#D3DEDB] shadow-xs flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D3DEDB]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D2322] text-white flex items-center justify-center">
                        <PaymentIcon name="speed" className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-[#0D2322]">
                                Core Ledger &amp; Distributed Processing Engine
                            </h2>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] font-mono font-bold border border-[#D3DEDB]">
                                Sec. K.1 – K.11
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Two-phase hold/capture, double-entry invariant journal, and Saga distributed state orchestrator
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-[#E8F5F1] text-[#0F5B46] font-bold border border-[#BCE3D6] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                        <span>Invariant Check: Σ(Dr) - Σ(Cr) = ₱0.00</span>
                    </span>
                </div>
            </div>

            {/* Split Visualizer: Left = Two-Phase Hold/Capture & Idempotency, Right = Saga Orchestrator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Module 1: Two-Phase Hold & Capture (Sec. K.1, K.3, K.7) */}
                <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <PaymentIcon name="lock" className="w-4 h-4 text-[#D97706]" />
                                <span className="text-xs font-bold text-[#0D2322]">
                                    Two-Phase Hold &amp; Capture Pattern
                                </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#566C6A] border border-[#D3DEDB]">
                                Sec. K.1 / K.7
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Pessimistic balance locking to prevent double-spend during async card/e-commerce checkout
                        </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#D3DEDB] flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[#566C6A]">Test Reservation Hold:</span>
                            <span className="font-mono font-bold text-[#0D2322]">₱{holdAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[#566C6A]">Idempotency Key:</span>
                            <span className="font-mono text-[11px] text-[#0D2322] truncate max-w-[180px]">
                                {idempotencyKey}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D3DEDB]">
                            <span className="text-[#566C6A]">Phase 1 Status:</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    holdState === "holding"
                                        ? "bg-[#FEF3C7] text-[#B45309]"
                                        : holdState === "captured"
                                        ? "bg-[#E8F5F1] text-[#0F5B46]"
                                        : holdState === "voided"
                                        ? "bg-[#FEE2E2] text-[#DC2626]"
                                        : "bg-[#EDF4F2] text-[#566C6A]"
                                }`}
                            >
                                {holdState === "idle" ? "Ready" : holdState}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            disabled={holdState === "holding"}
                            onClick={handleAuthorizeHold}
                            className="px-2 py-1.5 rounded-lg bg-[#0D2322] text-white text-[11px] font-bold hover:bg-[#163331] transition-colors cursor-pointer disabled:opacity-50"
                        >
                            1. Authorize Hold
                        </button>
                        <button
                            type="button"
                            disabled={holdState !== "holding"}
                            onClick={handleCaptureHold}
                            className="px-2 py-1.5 rounded-lg bg-[#059669] text-white text-[11px] font-bold hover:bg-[#047857] transition-colors cursor-pointer disabled:opacity-40"
                        >
                            2. Capture Hold
                        </button>
                        <button
                            type="button"
                            disabled={holdState !== "holding"}
                            onClick={handleVoidHold}
                            className="px-2 py-1.5 rounded-lg bg-white border border-[#D3DEDB] text-[#DC2626] text-[11px] font-bold hover:bg-[#FEE2E2] transition-colors cursor-pointer disabled:opacity-40"
                        >
                            Void / Release
                        </button>
                    </div>
                </div>

                {/* Module 2: Saga Distributed Orchestrator (Sec. K.8) */}
                <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <PaymentIcon name="call_split" className="w-4 h-4 text-[#059669]" />
                                <span className="text-xs font-bold text-[#0D2322]">
                                    Saga Distributed Transaction Orchestration
                                </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#566C6A] border border-[#D3DEDB]">
                                Sec. K.8
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Manages multi-service commit pipelines with automatic reverse compensating actions
                        </p>
                    </div>

                    {/* Step Pipeline Visualization */}
                    <div className="p-3 bg-white rounded-xl border border-[#D3DEDB] flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-[#0D2322]">
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        sagaStep >= 1 ? "bg-[#059669] text-white" : "bg-[#EDF4F2] text-[#566C6A]"
                                    }`}
                                >
                                    1
                                </span>
                                Source Float Debit
                            </span>
                            <span className="text-[10px] text-[#566C6A] font-mono">
                                {sagaStep >= 1 ? "COMMITTED" : "PENDING"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-[#0D2322]">
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        sagaStep >= 2 ? "bg-[#059669] text-white" : "bg-[#EDF4F2] text-[#566C6A]"
                                    }`}
                                >
                                    2
                                </span>
                                Interbank Switch Transit
                            </span>
                            <span className="text-[10px] text-[#566C6A] font-mono">
                                {sagaStep >= 2 ? "ACKNOWLEDGED" : "PENDING"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-[#0D2322]">
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        sagaStep >= 3 ? "bg-[#059669] text-white" : "bg-[#EDF4F2] text-[#566C6A]"
                                    }`}
                                >
                                    3
                                </span>
                                Recipient Ledger Credit
                            </span>
                            <span className="text-[10px] text-[#566C6A] font-mono">
                                {sagaStep >= 3 ? "FINALIZED" : "PENDING"}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            disabled={sagaStatus === "running"}
                            onClick={handleRunSaga}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0D2322] text-white text-[11px] font-bold hover:bg-[#163331] transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Execute Distributed Saga
                        </button>
                        <button
                            type="button"
                            onClick={handleCompensateSaga}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D3DEDB] text-[#B45309] text-[11px] font-bold hover:bg-[#FEF3C7] transition-colors cursor-pointer"
                        >
                            Simulate Rollback
                        </button>
                    </div>
                </div>
            </div>

            {/* Real-Time Double-Entry Journal Table (Sec. K.2) */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-[#0D2322] uppercase tracking-wider">
                            Immutable Double-Entry General Ledger Journal
                        </span>
                        <p className="text-[11px] text-[#566C6A]">
                            Sec. K.2 strict dual-legged balance entry with cryptographic SHA-256 state non-repudiation
                        </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#EDF4F2] text-[#0D2322] font-mono font-bold border border-[#D3DEDB]">
                        Paxos Quorum Validated
                    </span>
                </div>

                <div className="overflow-x-auto w-full border border-[#D3DEDB] rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-[#EDF4F2] text-[#566C6A] uppercase font-bold text-[10px] border-b border-[#D3DEDB]">
                            <tr>
                                <th className="py-2.5 px-3">Journal Ref &amp; Time</th>
                                <th className="py-2.5 px-3">Description</th>
                                <th className="py-2.5 px-3">Debit Account (Dr)</th>
                                <th className="py-2.5 px-3">Credit Account (Cr)</th>
                                <th className="py-2.5 px-3 text-right">Amount (PHP)</th>
                                <th className="py-2.5 px-3 text-right">Idempotency &amp; Signature</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D3DEDB]/60">
                            {journal.map((j) => (
                                <tr key={j.id} className="hover:bg-[#F4F7F6] transition-colors font-mono">
                                    <td className="py-2 px-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#0D2322]">{j.id}</span>
                                            <span className="text-[10px] text-[#566C6A]">{j.timestamp}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 font-sans text-xs text-[#0D2322] font-medium">
                                        {j.description}
                                    </td>
                                    <td className="py-2 px-3 text-[#C2410C] font-semibold text-[11px]">
                                        Dr {j.debitAccount}
                                    </td>
                                    <td className="py-2 px-3 text-[#059669] font-semibold text-[11px]">
                                        Cr {j.creditAccount}
                                    </td>
                                    <td className="py-2 px-3 text-right font-bold text-[#0D2322] text-xs">
                                        ₱{j.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-2 px-3 text-right text-[10px] text-[#566C6A]">
                                        <div className="flex flex-col items-end">
                                            <span>{j.idempotencyKey}</span>
                                            <span className="text-[#8B9F9D]">{j.signature}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
