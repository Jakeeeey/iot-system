"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { MerchantLedgerTransaction, MerchantRBACRole } from "../types";
import { PaymentIcon } from "./PaymentIcon";
import { MerchantRoleSwitcher } from "./merchant/MerchantRoleSwitcher";
import { PaymentLinkInvoiceModal } from "./merchant/PaymentLinkInvoiceModal";
import { MerchantQRGeneratorModal } from "./merchant/MerchantQRGeneratorModal";
import { TerminalFleetManager } from "./merchant/TerminalFleetManager";
import { DeveloperWebhookConsole } from "./merchant/DeveloperWebhookConsole";
import { BulkPayrollDisbursementModal } from "./merchant/BulkPayrollDisbursementModal";
import { SettlementSweepModal } from "./merchant/SettlementSweepModal";

const SEED_MERCHANT_LEDGER: MerchantLedgerTransaction[] = [
    {
        id: "TX-MNL-99824",
        time: "10:41 AM",
        cashier: "Anna Reyes (Cashier #02)",
        storeLocation: "Flagship BGC High Street",
        initials: "AR",
        railMethod: "QR Ph National (P2M)",
        grossAmount: 1850.0,
        mdrRate: 1.2,
        mdrFee: 22.2,
        netSettlement: 1827.8,
        status: "Settled",
    },
    {
        id: "TX-MNL-99818",
        time: "10:24 AM",
        cashier: "Carlos Mendez (Cashier #01)",
        storeLocation: "Flagship BGC High Street",
        initials: "CM",
        railMethod: "Contactless EMV (Visa)",
        grossAmount: 4200.0,
        mdrRate: 1.8,
        mdrFee: 75.6,
        netSettlement: 4124.4,
        status: "Settled",
    },
    {
        id: "TX-MNL-99805",
        time: "09:55 AM",
        cashier: "Anna Reyes (Cashier #02)",
        storeLocation: "Flagship BGC High Street",
        initials: "AR",
        railMethod: "Maya Wallet Direct",
        grossAmount: 650.0,
        mdrRate: 1.5,
        mdrFee: 9.75,
        netSettlement: 640.25,
        status: "Settled",
    },
    {
        id: "TX-MNL-99792",
        time: "09:12 AM",
        cashier: "Online Checkout API",
        storeLocation: "E-Commerce Gateway",
        initials: "EC",
        railMethod: "Map-ePay Dynamic Link",
        grossAmount: 3490.0,
        mdrRate: 1.5,
        mdrFee: 52.35,
        netSettlement: 3437.65,
        status: "Batch In-Flight",
    },
];

export function MerchantPortalView() {
    const [activeRole, setActiveRole] = useState<MerchantRBACRole>("administrator");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRailFilter, setSelectedRailFilter] = useState<string>("all");

    // Modal Visibility States
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
    const [isSweepModalOpen, setIsSweepModalOpen] = useState(false);

    const handleExportCsv = () => {
        toast.success("Exporting Merchant Settlement CSV", {
            description: "Generating settlement CSV with BIR 16-2023 compliant withholding columns.",
        });
    };

    const filteredLedger = SEED_MERCHANT_LEDGER.filter((tx) => {
        const matchesQuery =
            !searchQuery ||
            tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.cashier.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.storeLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.railMethod.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRail =
            selectedRailFilter === "all" ||
            tx.railMethod.toLowerCase().includes(selectedRailFilter.toLowerCase());

        return matchesQuery && matchesRail;
    });

    const totalGrossToday = SEED_MERCHANT_LEDGER.reduce((sum, tx) => sum + tx.grossAmount, 0);
    const totalMdrToday = SEED_MERCHANT_LEDGER.reduce((sum, tx) => sum + tx.mdrFee, 0);
    const totalNetToday = SEED_MERCHANT_LEDGER.reduce((sum, tx) => sum + tx.netSettlement, 0);

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Modals */}
            <PaymentLinkInvoiceModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} />
            <MerchantQRGeneratorModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
            <BulkPayrollDisbursementModal isOpen={isPayrollModalOpen} onClose={() => setIsPayrollModalOpen(false)} />
            <SettlementSweepModal isOpen={isSweepModalOpen} onClose={() => setIsSweepModalOpen(false)} />

            {/* Top Context Ribbon */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] text-[11px] font-bold uppercase tracking-wider border border-[#D3DEDB]">
                            Acquiring Store #084
                        </span>
                        <span className="text-[#8B9F9D] text-xs">•</span>
                        <span className="text-[#566C6A] text-[11px] font-semibold tracking-tight font-mono">
                            MID-MNL-884190
                        </span>
                        <span className="text-[#8B9F9D] text-xs">•</span>
                        <span className="text-[11px] text-[#059669] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                            T+0 Real-Time Clearing Active
                        </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2322] tracking-tight">
                            Merchant Gateway &amp; Acquiring Portal
                        </h1>
                        <span className="text-xs text-[#566C6A] font-medium hidden sm:inline font-mono">
                            Part II — Sec. J &amp; C.2–C.3
                        </span>
                    </div>
                </div>

                {/* Quick Action Bar */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#D3DEDB] rounded-xl shadow-xs">
                    <button
                        type="button"
                        onClick={() => setIsQrModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D2322] text-white text-xs hover:bg-[#163331] transition-all shadow-sm font-semibold cursor-pointer"
                    >
                        <PaymentIcon name="qr_code_2" className="w-[18px] h-[18px] text-[#D97706]" />
                        <span>QR Ph Generator</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLinkModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D97706] text-white text-xs hover:bg-[#B45309] transition-all shadow-sm shadow-[#D97706]/25 font-semibold cursor-pointer"
                    >
                        <PaymentIcon name="add_link" className="w-[18px] h-[18px]" />
                        <span>Payment Link / Invoice</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsSweepModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EDF4F2] text-[#0D2322] text-xs hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] font-medium cursor-pointer"
                    >
                        <PaymentIcon name="account_balance" className="w-[18px] h-[18px] text-[#0D2322]" />
                        <span>Net-Sweep &amp; BIR 2307</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsPayrollModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EDF4F2] text-[#0D2322] text-xs hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] font-medium cursor-pointer"
                    >
                        <PaymentIcon name="payments" className="w-[18px] h-[18px] text-[#0D2322]" />
                        <span>Bulk Payroll</span>
                    </button>
                </div>
            </div>

            {/* Merchant RBAC Role Switcher (Sec. J.2) */}
            <MerchantRoleSwitcher currentRole={activeRole} onRoleChange={setActiveRole} />

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Metric 1: Gross Sales */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">
                            Today&apos;s Gross Volume
                        </span>
                        <div className="flex items-center gap-1 text-[#059669] text-[11px] bg-[#E8F5F1] px-1.5 py-0.5 rounded font-bold border border-[#BCE3D6]">
                            <PaymentIcon name="arrow_upward" className="w-3.5 h-3.5" />
                            <span>+14.2%</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[28px] sm:text-[30px] leading-tight font-extrabold text-[#0D2322] tracking-tight font-mono">
                            ₱{totalGrossToday.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[#566C6A] text-xs">
                            <span>Across 4 settled channels</span>
                        </div>
                    </div>
                    <div className="w-full bg-[#E7F0EF] h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#D97706] h-full rounded-full" style={{ width: "75%" }} />
                    </div>
                </div>

                {/* Metric 2: Net Settlement */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">
                            Net Available for Sweep
                        </span>
                        <span className="text-[11px] text-[#059669] bg-[#E8F5F1] px-1.5 py-0.5 rounded font-bold border border-[#BCE3D6]">
                            T+0 Real-Time
                        </span>
                    </div>
                    <div>
                        <div className="text-[28px] sm:text-[30px] leading-tight font-extrabold text-[#059669] tracking-tight font-mono">
                            ₱{totalNetToday.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[#566C6A] text-xs">
                            <span>MDR Deductions: ₱{totalMdrToday.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="w-full bg-[#E7F0EF] h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#059669] h-full rounded-full" style={{ width: "95%" }} />
                    </div>
                </div>

                {/* Metric 3: Active POS Fleet */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">
                            POS Terminal Fleet
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#059669] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse" />
                            12/13 Online
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1 text-[28px] sm:text-[30px] leading-tight font-extrabold text-[#0D2322]">
                            <span className="font-mono">12</span>
                            <span className="text-[#566C6A] text-base font-semibold font-sans">Units Connected</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[#566C6A] text-xs font-medium">
                            <PaymentIcon name="sensors" className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>DUKPT Key Tier-3 Injected</span>
                        </div>
                    </div>
                    <div className="flex gap-1 mt-4">
                        <div className="bg-[#059669] w-[92%] h-1.5 rounded-full" />
                        <div className="bg-[#FEF3C7] w-[8%] h-1.5 rounded-full" />
                    </div>
                </div>

                {/* Metric 4: Success Rate */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[#D3DEDB] flex flex-col justify-between hover:border-[#0D2322]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#566C6A] uppercase tracking-wider font-semibold">
                            Authorization Success
                        </span>
                        <span className="text-[11px] text-[#0F5B46] bg-[#E8F5F1] px-1.5 py-0.5 rounded font-bold border border-[#BCE3D6]">
                            99.98% SLA
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1.5 text-[28px] sm:text-[30px] leading-tight font-extrabold text-[#0D2322]">
                            <span className="font-mono">100%</span>
                            <span className="text-[#566C6A] text-xs font-medium font-sans">Settled</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[#566C6A] text-xs">
                            <span>0 Rejections • Sub-50ms Routing</span>
                        </div>
                    </div>
                    <div className="w-full bg-[#E7F0EF] h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#0D2322] h-full rounded-full" style={{ width: "100%" }} />
                    </div>
                </div>
            </div>

            {/* Role Scoped Section: Terminal Fleet & Soundbox (Visible to Cashier & Admin) */}
            {(activeRole === "cashier" || activeRole === "administrator") && (
                <TerminalFleetManager />
            )}

            {/* Role Scoped Section: Developer Webhook & API Console (Visible to Admin) */}
            {activeRole === "administrator" && (
                <DeveloperWebhookConsole />
            )}

            {/* Merchant Transaction & Settlement Ledger Table (Visible to All, tailored to Accountant/Admin) */}
            <div className="bg-white rounded-xl shadow-sm border border-[#D3DEDB] p-6 flex flex-col gap-4">
                {/* Table Header Toolbar */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-1">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-[#0D2322]">Store Settlement Ledger</h2>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] font-mono font-bold border border-[#D3DEDB]">
                                Sec. J.2 / L.2
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Real-time journal with MDR and BIR Rev Regs 16-2023 withholding tax deductions
                        </p>
                    </div>

                    {/* Filters & Instant Search */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <PaymentIcon
                                name="search"
                                className="absolute left-3 top-2.5 w-[18px] h-[18px] text-[#566C6A]"
                            />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F4F7F6] text-[#0D2322] text-xs pl-9 pr-3 py-2 rounded-lg border border-[#D3DEDB] focus:outline-none focus:border-[#0D2322] focus:bg-white transition-all placeholder-[#8B9F9D]"
                                placeholder="Search ref, cashier, or method..."
                                type="text"
                            />
                        </div>

                        {/* Rail Filter Selector */}
                        <select
                            value={selectedRailFilter}
                            onChange={(e) => setSelectedRailFilter(e.target.value)}
                            className="px-3 py-2 bg-[#EDF4F2] text-[#0D2322] text-xs rounded-lg border border-[#D3DEDB] font-semibold cursor-pointer focus:outline-none"
                        >
                            <option value="all">All Rails</option>
                            <option value="QR Ph">QR Ph</option>
                            <option value="EMV">Visa/Mastercard</option>
                            <option value="Maya">Maya</option>
                            <option value="Link">Dynamic Link</option>
                        </select>

                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="px-3 py-2 bg-[#EDF4F2] text-[#0D2322] text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#E2EBE9] transition-colors border border-[#D3DEDB] font-semibold cursor-pointer"
                        >
                            <PaymentIcon name="file_download" className="w-[18px] h-[18px] text-[#0D2322]" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#EDF4F2] text-[#566C6A] text-[11px] uppercase tracking-wider border-b border-[#D3DEDB]">
                                <th className="py-2.5 px-4 rounded-l-lg font-bold">Time &amp; Ref ID</th>
                                <th className="py-2.5 px-4 font-bold">Cashier &amp; Store</th>
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
                                            <PaymentIcon name="receipt_long" className="w-9 h-9 text-[#8B9F9D]" />
                                            <p className="font-semibold text-sm text-[#0D2322]">No Store Transactions Match Filter</p>
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
                                                <PaymentIcon
                                                    name={
                                                        tx.railMethod.includes("QR")
                                                            ? "qr_code_2"
                                                            : tx.railMethod.includes("Maya")
                                                            ? "shopping_bag"
                                                            : tx.railMethod.includes("Link")
                                                            ? "add_link"
                                                            : "contactless"
                                                    }
                                                    className="w-[18px] h-[18px] text-[#D97706]"
                                                />
                                                <span className="text-xs text-[#0D2322] font-medium">{tx.railMethod}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-xs text-[#0D2322] font-bold">
                                            ₱{tx.grossAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-xs text-[#C2410C] font-medium">
                                            -₱{tx.mdrFee.toFixed(2)} <span className="text-[#566C6A] text-[11px]">({tx.mdrRate.toFixed(1)}%)</span>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-xs text-[#059669] font-bold">
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
                    <span>
                        Showing {filteredLedger.length} of {SEED_MERCHANT_LEDGER.length} transactions • MDR Withholding Applied: 1.0% BIR Rev Regs 16-2023 Compliant
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsSweepModalOpen(true)}
                            className="text-[#D97706] font-bold hover:underline"
                        >
                            Open Midnight Net-Sweep Console &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
