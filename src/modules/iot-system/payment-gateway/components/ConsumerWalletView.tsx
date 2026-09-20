"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { WalletTransactionItem } from "../types";
import { QuickSendModal } from "./QuickSendModal";
import { ReceiptDrawer } from "./ReceiptDrawer";
import { usePaymentGatewayContext } from "../providers/PaymentGatewayProvider";
import { PaymentIcon } from "./PaymentIcon";
import { CashInOutSection } from "./consumer/CashInOutSection";
import { TransfersSection } from "./consumer/TransfersSection";
import { QRPaySection } from "./consumer/QRPaySection";
import { BillsAndServicesSection } from "./consumer/BillsAndServicesSection";
import { SecurityKYCSection } from "./consumer/SecurityKYCSection";

const INITIAL_TRANSACTIONS: WalletTransactionItem[] = [
    {
        id: "TX-9901",
        merchant: "Meralco Electricity (Direct Clearing)",
        amount: -3420.5,
        type: "spending",
        time: "10:14 AM",
        date: "Today",
        referenceCode: "REF-MER-9901",
        cashback: "₱15.00",
        category: "Utilities & Billers (Sec. F.1)",
        paymentMethod: "Map-ePay Balance",
        status: "Settled",
        icon: "bolt",
    },
    {
        id: "TX-9902",
        merchant: "InstaPay Cash-In (BDO Unibank)",
        amount: 5000.0,
        type: "in",
        time: "09:30 AM",
        date: "Today",
        referenceCode: "INSTA-BDO-491",
        cashback: "₱0.00",
        category: "Bank Transfer Cash-In (Sec. A.1)",
        paymentMethod: "InstaPay Real-Time",
        status: "Settled",
        icon: "account_balance",
    },
    {
        id: "TX-9903",
        merchant: "MRT-3 North Avenue Turnstile #02",
        amount: -25.0,
        type: "spending",
        time: "08:15 AM",
        date: "Today",
        referenceCode: "TAP-NFC-0912",
        cashback: "₱2.50",
        category: "Contactless NFC Tap (Sec. D.4)",
        paymentMethod: "Smart Pass NFC",
        status: "Settled",
        icon: "contactless",
    },
    {
        id: "TX-9904",
        merchant: "Seven-Eleven Dynamic QR Ph",
        amount: -185.5,
        type: "spending",
        time: "Yesterday",
        date: "Yesterday",
        referenceCode: "QR-711-8841",
        cashback: "₱5.00",
        category: "QR Code Scan-to-Pay (Sec. C.4)",
        paymentMethod: "QR Ph P2M",
        status: "Settled",
        icon: "qr_code_2",
    },
    {
        id: "TX-9905",
        merchant: "P2P Transfer to JU** D**",
        amount: -1200.0,
        type: "spending",
        time: "Sep 18",
        date: "Sep 18, 2026",
        referenceCode: "P2P-99218-MNL",
        cashback: "₱0.00",
        category: "P2P Send Money (Sec. B.1)",
        paymentMethod: "Map-ePay Internal Ledger",
        status: "Settled",
        icon: "send",
    },
];

type ConsumerTab = "overview" | "cash-in-out" | "transfers" | "qr-tap" | "bills" | "security-kyc";

export function ConsumerWalletView() {
    const { card } = usePaymentGatewayContext();

    const [activeTab, setActiveTab] = useState<ConsumerTab>("overview");
    const [balanceVisible, setBalanceVisible] = useState(true);

    // Dynamic CVV (Sec. H.5)
    const [cvvCode, setCvvCode] = useState("•••");
    const [cvvSecondsLeft, setCvvSecondsLeft] = useState(0);
    const cvvDisplay = cvvSecondsLeft > 0 ? cvvCode : "•••";

    const [transactions, setTransactions] = useState<WalletTransactionItem[]>(INITIAL_TRANSACTIONS);
    const [txFilter, setTxFilter] = useState<"all" | "in" | "spending">("all");
    const [selectedTx, setSelectedTx] = useState<WalletTransactionItem | null>(null);

    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [modalPayee] = useState("");

    const spendableBalance = card.balance;
    const promotionalPurse = 150.0; // Sec. A.6
    const totalNetWorth = spendableBalance + promotionalPurse;

    const handleRevealCvv = () => {
        const randCvv = Math.floor(100 + Math.random() * 900).toString();
        setCvvCode(randCvv);
        setCvvSecondsLeft(60);
        toast.success("Dynamic CVV Generated", {
            description: `CVV ${randCvv} is valid for 60 seconds (anti-replay protection).`,
        });
    };

    const handleCopyAccount = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(card.cardUid);
        }
        toast.info("Smart Card UID Copied", {
            description: "Physical NFC identifier copied to clipboard.",
        });
    };

    const filteredTransactions = transactions.filter((tx) => {
        if (txFilter === "in") return tx.type === "in";
        if (txFilter === "spending") return tx.type === "spending";
        return true;
    });

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Top Navigation Sub-Bar (6 Segmented Consumer Surfaces) */}
            <div className="w-full bg-white rounded-2xl p-1.5 border border-[#D3DEDB] shadow-xs flex items-center gap-1 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeTab === "overview"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#F4F7F6]"
                    }`}
                >
                    <PaymentIcon name="account_balance_wallet" className="w-4 h-4 text-[#D97706]" />
                    <span>Overview &amp; Balance</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("cash-in-out")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeTab === "cash-in-out"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#F4F7F6]"
                    }`}
                >
                    <PaymentIcon name="add_circle" className="w-4 h-4 text-[#059669]" />
                    <span>Cash-In &amp; Out (Sec. A/E)</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("transfers")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeTab === "transfers"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#F4F7F6]"
                    }`}
                >
                    <PaymentIcon name="sync_alt" className="w-4 h-4 text-[#2563EB]" />
                    <span>Send &amp; P2P (Sec. B)</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("qr-tap")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeTab === "qr-tap"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#F4F7F6]"
                    }`}
                >
                    <PaymentIcon name="qr_code_scanner" className="w-4 h-4 text-[#D97706]" />
                    <span>QR &amp; Tap Pay (Sec. C/D)</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("bills")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeTab === "bills"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#F4F7F6]"
                    }`}
                >
                    <PaymentIcon name="receipt_long" className="w-4 h-4 text-[#7C3AED]" />
                    <span>Bills &amp; Services (Sec. F/G)</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("security-kyc")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeTab === "security-kyc"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#F4F7F6]"
                    }`}
                >
                    <PaymentIcon name="shield" className="w-4 h-4 text-[#DC2626]" />
                    <span>Security &amp; KYC (Sec. H)</span>
                </button>
            </div>

            {/* TAB 1: OVERVIEW & BALANCE */}
            {activeTab === "overview" && (
                <div className="flex flex-col gap-6">
                    {/* Hero Balance Banner */}
                    <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(13,35,34,0.04)] border border-[#D3DEDB] relative overflow-hidden">
                        <div className="absolute -right-16 -top-16 w-96 h-96 bg-gradient-to-br from-[#D97706]/10 to-[#E8F5F1]/30 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                                        Total Net Worth across Map-ePay
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setBalanceVisible(!balanceVisible)}
                                        className="p-1 rounded-md text-[#566C6A] hover:text-[#D97706] transition-colors cursor-pointer"
                                    >
                                        <PaymentIcon
                                            name={balanceVisible ? "visibility" : "visibility_off"}
                                            className="w-5 h-5"
                                        />
                                    </button>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl sm:text-2xl font-bold text-[#566C6A]">PHP</span>
                                    <span className="text-4xl sm:text-5xl font-extrabold text-[#0D2322] tracking-tight font-mono">
                                        {balanceVisible ? totalNetWorth.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "••••••••"}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-[#D97706]" />
                                        <span className="text-[#566C6A]">Spendable Balance:</span>
                                        <span className="font-bold text-[#0D2322]">
                                            {balanceVisible ? `₱${spendableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "₱••••••"}
                                        </span>
                                    </div>
                                    <div className="h-3.5 w-px bg-[#D3DEDB] hidden sm:block" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-[#047857]" />
                                        <span className="text-[#566C6A]">Promotional Purse (Sec. A.6):</span>
                                        <span className="font-bold text-[#047857]">
                                            {balanceVisible ? `₱${promotionalPurse.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "₱••••••"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 4 Quick Action Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("transfers")}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-[#D97706] to-[#E07A1F] text-white shadow-lg shadow-[#D97706]/25 hover:shadow-[#D97706]/40 hover:brightness-105 transition-all transform active:scale-95 group border border-[#FED7AA]/40 cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                                        <PaymentIcon name="send" className="w-[26px] h-[26px]" />
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm">Send P2P</span>
                                    <span className="text-[10px] text-amber-100 font-semibold">Sub-second</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("qr-tap")}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#EDF2F1] text-[#0D2322] border border-[#D3DEDB] hover:bg-[#FFF7ED] hover:border-[#D97706]/40 transition-all transform active:scale-95 group shadow-xs cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-1.5 shadow-sm text-[#D97706] border border-[#E2EBE9] group-hover:scale-110 transition-transform">
                                        <PaymentIcon name="qr_code_scanner" className="w-[26px] h-[26px]" />
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm">QR &amp; Tap</span>
                                    <span className="text-[10px] text-[#566C6A] font-medium">QR Ph / NFC</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("cash-in-out")}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#EDF2F1] text-[#0D2322] border border-[#D3DEDB] hover:bg-[#FFF7ED] hover:border-[#D97706]/40 transition-all transform active:scale-95 group shadow-xs cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-1.5 shadow-sm text-[#D97706] border border-[#E2EBE9] group-hover:scale-110 transition-transform">
                                        <PaymentIcon name="add_card" className="w-[26px] h-[26px]" />
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm">Cash-In</span>
                                    <span className="text-[10px] text-[#566C6A] font-medium">InstaPay / PESONet</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("bills")}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#EDF2F1] text-[#0D2322] border border-[#D3DEDB] hover:bg-[#FFF7ED] hover:border-[#D97706]/40 transition-all transform active:scale-95 group shadow-xs cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-1.5 shadow-sm text-[#D97706] border border-[#E2EBE9] group-hover:scale-110 transition-transform">
                                        <PaymentIcon name="receipt_long" className="w-[26px] h-[26px]" />
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm">Pay Bills</span>
                                    <span className="text-[10px] text-[#566C6A] font-medium">Utilities / Gov</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Dual-Interface Smart Pass Card & Quick P2P (Sec. G.2, D.5, H.5) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Physical Card Visualizer */}
                        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                                        Dual-Interface Smart Pass (Sec. G.2 / D.5)
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        Contactless EMV Active
                                    </span>
                                </div>

                                <div
                                    className="w-full h-52 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/10"
                                    style={{
                                        background: "linear-gradient(135deg, #0A1C1B 0%, #0D2322 55%, #1B3F3D 100%)",
                                    }}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold tracking-widest text-white text-base">Map-ePay</span>
                                            <span className="px-2 py-0.5 rounded bg-[#D97706]/40 text-[#E07A1F] text-[10px] font-mono font-bold border border-[#D97706]/50">
                                                Smart Pass
                                            </span>
                                        </div>
                                        <PaymentIcon name="contactless" className="text-white/80 w-6 h-6" />
                                    </div>

                                    <div className="relative z-10 my-auto">
                                        <div className="w-10 h-7 rounded bg-amber-400 opacity-90 mb-2 shadow-xs" />
                                        <div className="text-lg sm:text-xl font-mono tracking-widest text-white font-bold drop-shadow-sm">
                                            {balanceVisible ? "•••• •••• •••• 9082" : "•••• •••• •••• ••••"}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-mono relative z-10 text-gray-300">
                                        <div>
                                            <span className="text-[10px] text-gray-400 block">CARD UID</span>
                                            <span className="font-bold text-white">{card.cardUid}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 block">DYNAMIC CVV</span>
                                            <span className="font-bold text-[#E07A1F]">{cvvDisplay}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={handleRevealCvv}
                                    className="flex-1 py-2 px-3 rounded-xl bg-[#F4F7F6] hover:bg-[#EDF2F1] text-[#0D2322] text-xs font-bold transition-colors border border-[#D3DEDB] cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <PaymentIcon name="password" className="w-4 h-4 text-[#D97706]" />
                                    <span>{cvvSecondsLeft > 0 ? `CVV: ${cvvSecondsLeft}s` : "Generate Dynamic CVV (Sec. H.5)"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopyAccount}
                                    className="py-2 px-3 rounded-xl bg-[#F4F7F6] hover:bg-[#EDF2F1] text-[#0D2322] text-xs font-bold transition-colors border border-[#D3DEDB] cursor-pointer"
                                >
                                    Copy UID
                                </button>
                            </div>
                        </div>

                        {/* Recent Statement & Search (Sec. H.3) */}
                        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-[#D3DEDB]">
                                    <div>
                                        <h4 className="text-sm font-bold text-[#0D2322]">Recent Transaction Ledger</h4>
                                        <span className="text-[11px] text-[#566C6A]">Statement of settled debits &amp; credits (Sec. H.3)</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-[#F4F7F6] p-0.5 rounded-lg border border-[#D3DEDB]">
                                        <button
                                            type="button"
                                            onClick={() => setTxFilter("all")}
                                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                                txFilter === "all" ? "bg-[#0D2322] text-white" : "text-[#566C6A]"
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTxFilter("spending")}
                                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                                txFilter === "spending" ? "bg-[#0D2322] text-white" : "text-[#566C6A]"
                                            }`}
                                        >
                                            Out
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTxFilter("in")}
                                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                                txFilter === "in" ? "bg-[#0D2322] text-white" : "text-[#566C6A]"
                                            }`}
                                        >
                                            In
                                        </button>
                                    </div>
                                </div>

                                <div className="divide-y divide-[#EDF2F1] max-h-56 overflow-y-auto mt-1">
                                    {filteredTransactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            onClick={() => setSelectedTx(tx)}
                                            className="py-2.5 flex items-center justify-between hover:bg-[#F4F7F6] px-2 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-[#EDF2F1] flex items-center justify-center text-[#0D2322]">
                                                    <PaymentIcon name={tx.icon} className="w-4 h-4 text-[#D97706]" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-[#0D2322] block truncate max-w-[180px] sm:max-w-xs">
                                                        {tx.merchant}
                                                    </span>
                                                    <span className="text-[10px] text-[#566C6A] font-mono">
                                                        {tx.time} • {tx.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span
                                                    className={`text-xs font-mono font-extrabold ${
                                                        tx.amount < 0 ? "text-[#0D2322]" : "text-[#059669]"
                                                    }`}
                                                >
                                                    {tx.amount < 0 ? "-" : "+"}₱{Math.abs(tx.amount).toFixed(2)}
                                                </span>
                                                <span className="text-[10px] text-[#566C6A] block">
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveTab("security-kyc")}
                                className="mt-3 text-xs font-bold text-[#D97706] hover:text-[#E07A1F] text-center block pt-2 border-t border-[#EDF2F1]"
                            >
                                View Detailed Statement &amp; File Disputes →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CASH-IN & OUT (Sec. A.1-6, E.1-2, B.3) */}
            {activeTab === "cash-in-out" && (
                <CashInOutSection
                    balance={card.balance}
                    onTopUpSuccess={(amt, method) => {
                        const newTx: WalletTransactionItem = {
                            id: `TX-${Date.now().toString(36).toUpperCase()}`,
                            merchant: method,
                            amount: amt,
                            type: "in",
                            time: "Just now",
                            date: "Today",
                            referenceCode: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
                            cashback: "₱0.00",
                            category: "Cash-In Funding (Sec. A)",
                            paymentMethod: method,
                            status: "Settled",
                            icon: "add_card",
                        };
                        setTransactions([newTx, ...transactions]);
                    }}
                />
            )}

            {/* TAB 3: TRANSFERS & P2P (Sec. B.1-6) */}
            {activeTab === "transfers" && (
                <TransfersSection
                    balance={card.balance}
                    onSendSuccess={(amt, recipient) => {
                        const newTx: WalletTransactionItem = {
                            id: `TX-${Date.now().toString(36).toUpperCase()}`,
                            merchant: `Transfer to ${recipient}`,
                            amount: -amt,
                            type: "spending",
                            time: "Just now",
                            date: "Today",
                            referenceCode: `P2P-${Math.floor(10000 + Math.random() * 90000)}`,
                            cashback: "₱0.00",
                            category: "P2P Send Money (Sec. B.1)",
                            paymentMethod: "Internal Ledger",
                            status: "Settled",
                            icon: "send",
                        };
                        setTransactions([newTx, ...transactions]);
                    }}
                />
            )}

            {/* TAB 4: QR & TAP PAY (Sec. C.1-7, D.1-6) */}
            {activeTab === "qr-tap" && (
                <QRPaySection
                    balance={card.balance}
                    onPaymentComplete={(amt, merchant) => {
                        const newTx: WalletTransactionItem = {
                            id: `TX-${Date.now().toString(36).toUpperCase()}`,
                            merchant,
                            amount: -amt,
                            type: "spending",
                            time: "Just now",
                            date: "Today",
                            referenceCode: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
                            cashback: "₱5.00",
                            category: "Merchant POS / QR (Sec. C/D)",
                            paymentMethod: "Contactless / QR Ph",
                            status: "Settled",
                            icon: "point_of_sale",
                        };
                        setTransactions([newTx, ...transactions]);
                    }}
                />
            )}

            {/* TAB 5: BILLS & SERVICES (Sec. F.1-4, G.1, I.1-3) */}
            {activeTab === "bills" && (
                <BillsAndServicesSection
                    balance={card.balance}
                    onPaymentSuccess={(amt, biller) => {
                        const newTx: WalletTransactionItem = {
                            id: `TX-${Date.now().toString(36).toUpperCase()}`,
                            merchant: biller,
                            amount: -amt,
                            type: "spending",
                            time: "Just now",
                            date: "Today",
                            referenceCode: `BILL-${Math.floor(10000 + Math.random() * 90000)}`,
                            cashback: "₱0.00",
                            category: "Bills / Gov Payment (Sec. F)",
                            paymentMethod: "Map-ePay Direct",
                            status: "Settled",
                            icon: "receipt_long",
                        };
                        setTransactions([newTx, ...transactions]);
                    }}
                />
            )}

            {/* TAB 6: SECURITY & KYC (Sec. H.1-10, G.2) */}
            {activeTab === "security-kyc" && (
                <SecurityKYCSection cardUid={card.cardUid} />
            )}

            {/* Receipt Modal Drawer (Sec. F.4) */}
            <ReceiptDrawer
                isOpen={!!selectedTx}
                transaction={selectedTx}
                onClose={() => setSelectedTx(null)}
            />

            {/* Quick Send Modal */}
            <QuickSendModal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                initialPayee={modalPayee}
            />
        </div>
    );
}
