"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "../PaymentIcon";

interface BulkPayrollDisbursementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface PayrollRow {
    id: string;
    employeeName: string;
    accountNumber: string;
    bankOrWallet: string;
    grossAmount: number;
    taxWithheld: number;
    netPayout: number;
    status: "Pending" | "Ready" | "Disbursed";
}

const SAMPLE_PAYROLL: PayrollRow[] = [
    {
        id: "EMP-001",
        employeeName: "Juan Dela Cruz",
        accountNumber: "0917-555-0192",
        bankOrWallet: "Map-ePay Wallet",
        grossAmount: 25000,
        taxWithheld: 1250,
        netPayout: 23750,
        status: "Ready",
    },
    {
        id: "EMP-002",
        employeeName: "Maria Santos",
        accountNumber: "1092-8821-4401",
        bankOrWallet: "BDO Unibank (InstaPay)",
        grossAmount: 28000,
        taxWithheld: 1400,
        netPayout: 26600,
        status: "Ready",
    },
    {
        id: "EMP-003",
        employeeName: "Carlos Reyes",
        accountNumber: "0928-114-8890",
        bankOrWallet: "Map-ePay Wallet",
        grossAmount: 22000,
        taxWithheld: 1100,
        netPayout: 20900,
        status: "Ready",
    },
    {
        id: "EMP-004",
        employeeName: "Liza Soberano",
        accountNumber: "0021-9988-1200",
        bankOrWallet: "BPI (InstaPay)",
        grossAmount: 32000,
        taxWithheld: 1600,
        netPayout: 30400,
        status: "Ready",
    },
    {
        id: "EMP-005",
        employeeName: "Mark Anthony Tan",
        accountNumber: "0908-223-9912",
        bankOrWallet: "Map-ePay Wallet",
        grossAmount: 24000,
        taxWithheld: 1200,
        netPayout: 22800,
        status: "Ready",
    },
];

export function BulkPayrollDisbursementModal({ isOpen, onClose }: BulkPayrollDisbursementModalProps) {
    const [rows, setRows] = useState<PayrollRow[]>(SAMPLE_PAYROLL);
    const [batchRef] = useState("BATCH-PAY-20260919");
    const [isExecuting, setIsExecuting] = useState(false);
    const [hasDisbursed, setHasDisbursed] = useState(false);

    if (!isOpen) return null;

    const totalGross = rows.reduce((sum, r) => sum + r.grossAmount, 0);
    const totalTax = rows.reduce((sum, r) => sum + r.taxWithheld, 0);
    const totalNet = rows.reduce((sum, r) => sum + r.netPayout, 0);

    const handleExecute = () => {
        setIsExecuting(true);
        toast.info("Authorizing Bulk Payroll Batch", {
            description: `Dispatching ${rows.length} disbursements via InstaPay and internal ledger...`,
        });

        setTimeout(() => {
            setRows((prev) => prev.map((r) => ({ ...r, status: "Disbursed" })));
            setIsExecuting(false);
            setHasDisbursed(true);
            toast.success("Batch Payroll Disbursed Successfully", {
                description: `₱${totalNet.toLocaleString("en-US", { minimumFractionDigits: 2 })} credited across ${rows.length} accounts.`,
            });
        }, 1200);
    };

    const handleUploadMock = () => {
        toast.info("CSV Upload Simulated", {
            description: "Encrypted payroll CSV validated: 5 lines parsed with 0 format errors.",
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-3xl border border-[#D3DEDB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#0D2322] to-[#163331] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#D97706] text-white flex items-center justify-center">
                            <PaymentIcon name="payments" className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold tracking-tight">Bulk Payroll &amp; Disbursement Engine</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-[#FEF3C7] font-bold border border-white/30">
                                    Sec. J.8 / A.3
                                </span>
                            </div>
                            <p className="text-xs text-white/80">
                                Batch CSV ingestion, automated tax withholding, and instant multi-rail salary distribution
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                        <PaymentIcon name="close" className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex flex-col gap-4">
                    {/* Summary Tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#566C6A] block">
                                Batch ID
                            </span>
                            <span className="text-xs font-mono font-bold text-[#0D2322] block mt-0.5">{batchRef}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#566C6A] block">
                                Gross ({rows.length} Staff)
                            </span>
                            <span className="text-base font-extrabold text-[#0D2322] block font-mono">
                                ₱{totalGross.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#566C6A] block">
                                Tax Withheld (BIR)
                            </span>
                            <span className="text-base font-extrabold text-[#C2410C] block font-mono">
                                ₱{totalTax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#E8F5F1] border border-[#BCE3D6]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F5B46] block">
                                Total Net Disbursement
                            </span>
                            <span className="text-base font-black text-[#0F5B46] block font-mono">
                                ₱{totalNet.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Table of Employees */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0D2322] uppercase tracking-wider">
                                Itemized Salary Roster
                            </span>
                            <button
                                type="button"
                                onClick={handleUploadMock}
                                className="text-xs text-[#0D2322] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <PaymentIcon name="attachment" className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>Upload Encrypted CSV</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto w-full border border-[#D3DEDB] rounded-xl">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-[#EDF4F2] text-[#566C6A] uppercase font-bold text-[10px] border-b border-[#D3DEDB]">
                                    <tr>
                                        <th className="py-2.5 px-3">Employee &amp; ID</th>
                                        <th className="py-2.5 px-3">Destination Rail</th>
                                        <th className="py-2.5 px-3 text-right">Gross Pay</th>
                                        <th className="py-2.5 px-3 text-right">Tax (BIR)</th>
                                        <th className="py-2.5 px-3 text-right">Net Payout</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#D3DEDB]/60">
                                    {rows.map((r) => (
                                        <tr key={r.id} className="hover:bg-[#F4F7F6] transition-colors">
                                            <td className="py-2 px-3">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#0D2322]">{r.employeeName}</span>
                                                    <span className="text-[10px] text-[#566C6A] font-mono">{r.id}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[#0D2322]">{r.bankOrWallet}</span>
                                                    <span className="text-[10px] text-[#566C6A] font-mono">
                                                        {r.accountNumber}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono font-bold text-[#0D2322]">
                                                ₱{r.grossAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono text-[#C2410C]">
                                                -₱{r.taxWithheld.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono font-black text-[#059669]">
                                                ₱{r.netPayout.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                                                        r.status === "Disbursed"
                                                            ? "bg-[#E8F5F1] text-[#0F5B46] border-[#BCE3D6]"
                                                            : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                                                    }`}
                                                >
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Batch Settlement Notice */}
                    <div className="p-3 rounded-xl bg-[#EDF4F2] border border-[#D3DEDB] text-xs text-[#566C6A] flex items-center justify-between">
                        <span>
                            Rail Protocol: <strong className="text-[#0D2322]">InstaPay Batch ISO-20022 Pain.001</strong>
                        </span>
                        <span className="font-mono text-[11px] text-[#0D2322]">Audit Hash: sha256:b891...338c</span>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3.5 bg-[#F4F7F6] border-t border-[#D3DEDB] flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-[#D3DEDB] text-xs font-semibold text-[#566C6A] hover:bg-white transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        disabled={isExecuting || hasDisbursed}
                        onClick={handleExecute}
                        className="px-6 py-2 rounded-xl bg-[#0D2322] text-white text-xs font-bold hover:bg-[#163331] transition-all flex items-center gap-1.5 shadow-md shadow-[#0D2322]/20 cursor-pointer disabled:opacity-60"
                    >
                        <PaymentIcon name="send" className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>{isExecuting ? "Disbursing Batch..." : hasDisbursed ? "Disbursement Complete" : "Execute Batch Payout"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
