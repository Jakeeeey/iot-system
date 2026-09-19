"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { WalletTransactionItem, QuickContact, CardSecuritySettings } from "../types";
import { QuickSendModal } from "./QuickSendModal";
import { ReceiptDrawer } from "./ReceiptDrawer";
import { SmartCardVisualizer } from "./SmartCardVisualizer";
import { AmountSelector } from "./AmountSelector";
import { PaymentChannelSelector } from "./PaymentChannelSelector";
import { TransactionSummaryCard } from "./TransactionSummaryCard";
import { usePaymentGatewayContext } from "../providers/PaymentGatewayProvider";
import { PaymentIcon } from "./PaymentIcon";

const INITIAL_TRANSACTIONS: WalletTransactionItem[] = [];

const QUICK_CONTACTS: QuickContact[] = [];

export function ConsumerWalletView() {
    const {
        card,
        presetAmounts,
        selectedAmount,
        customAmount,
        paymentMethod,
        isProcessing,
        amount,
        fee,
        total,
        vat,
        projectedBalance,
        handleSelectPreset,
        handleCustomChange,
        setPaymentMethod,
        handleProcessTopUp,
    } = usePaymentGatewayContext();

    const [activeTab, setActiveTab] = useState<"overview" | "send" | "bills" | "savings" | "cards">("overview");
    const [balanceVisible, setBalanceVisible] = useState(true);

    const [cvvCode, setCvvCode] = useState("•••");
    const [cvvSecondsLeft, setCvvSecondsLeft] = useState(0);
    const cvvDisplay = cvvSecondsLeft > 0 ? cvvCode : "•••";

    const [cardSettings, setCardSettings] = useState<CardSecuritySettings>({
        isFrozen: false,
        onlinePayments: true,
        overseasTransactions: true,
        dailyLimit: 100000,
    });

    const [transactions] = useState<WalletTransactionItem[]>(INITIAL_TRANSACTIONS);
    const [txFilter, setTxFilter] = useState<"all" | "in" | "spending">("all");
    const [selectedTx, setSelectedTx] = useState<WalletTransactionItem | null>(null);

    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [modalPayee, setModalPayee] = useState("");

    const [p2pRecipient, setP2pRecipient] = useState("");
    const [p2pAmount, setP2pAmount] = useState("");

    const [splitTotal, setSplitTotal] = useState("0");
    const [splitPeople] = useState(4);

    const spendableBalance = card.balance;
    const vaultBalance = 0;
    const totalNetWorth = spendableBalance + vaultBalance;

    useEffect(() => {
        if (cvvSecondsLeft <= 0) return;
        const timer = setInterval(() => {
            setCvvSecondsLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cvvSecondsLeft]);

    const handleRevealCvv = () => {
        const randCvv = Math.floor(100 + Math.random() * 900).toString();
        setCvvCode(randCvv);
        setCvvSecondsLeft(60);
        toast.success("Dynamic CVV Generated", {
            description: `CVV ${randCvv} is valid for 60 seconds.`,
        });
    };

    const handleCopyAccount = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(card.cardUid);
        }
        toast.info("Card UID Copied", {
            description: `Card UID ${card.cardUid} copied to clipboard.`,
        });
    };

    const handleQuickSendContact = (contact: QuickContact) => {
        setModalPayee(`${contact.name} (${contact.phone})`);
        setIsSendModalOpen(true);
    };

    const handleP2pSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(p2pAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Invalid Amount", { description: "Please enter an amount greater than ₱0.00." });
            return;
        }
        toast.success("Transfer Completed!", {
            description: `Transferred ₱${amt.toFixed(2)} to ${p2pRecipient} successfully via InstaPay.`,
        });
        setP2pRecipient("");
        setP2pAmount("");
    };

    const filteredTransactions = transactions.filter((tx) => {
        if (txFilter === "all") return true;
        return tx.type === txFilter;
    });

    const splitAmountEach = (parseFloat(splitTotal) || 0) / (splitPeople || 1);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6">
            {/* Top Consumer Greeting Ribbon */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D2322]">
                            Welcome, Account Holder
                        </span>
                        <PaymentIcon name="verified" className="text-[#D97706] w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#566C6A] mt-0.5">
                        Everyday financial and smart card top-up portal.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F1] text-[#047857] border border-[#A7F3D0] shadow-xs text-xs font-bold">
                        <PaymentIcon name="shield" className="w-4 h-4 text-[#047857]" />
                        <span>PDIC Insured up to ₱500,000</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#B45309] border border-[#FED7AA] shadow-xs text-xs font-bold">
                        <span className="h-2 w-2 rounded-full bg-[#D97706] inline-block" />
                        <span>Verified Gateway User</span>
                    </div>

                    <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-xs border border-[#D3DEDB] text-xs text-[#566C6A]">
                        <span className="font-mono font-semibold mr-2">{card.cardUid}</span>
                        <button
                            type="button"
                            onClick={handleCopyAccount}
                            className="hover:text-[#D97706] transition-colors cursor-pointer"
                            title="Copy Account Number"
                        >
                            <PaymentIcon name="content_copy" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-Page Tab Navigation */}
            <div className="w-full bg-white rounded-2xl p-1.5 shadow-[0_2px_10px_rgba(13,35,34,0.03)] border border-[#D3DEDB] overflow-x-auto">
                <div className="flex items-center min-w-max gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "overview"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-md shadow-[#D97706]/25"
                                : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#EDF2F1] font-semibold"
                        }`}
                    >
                        <PaymentIcon name="account_balance_wallet" className="w-5 h-5" />
                        <span>Overview & Balance</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("send")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "send"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-md shadow-[#D97706]/25"
                                : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#EDF2F1] font-semibold"
                        }`}
                    >
                        <PaymentIcon name="send_money" className="w-5 h-5" />
                        <span>Send & Request (P2P / QR Ph)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("bills")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "bills"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-md shadow-[#D97706]/25"
                                : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#EDF2F1] font-semibold"
                        }`}
                    >
                        <PaymentIcon name="receipt" className="w-5 h-5" />
                        <span>Bills & Utilities</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("savings")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "savings"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-md shadow-[#D97706]/25"
                                : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#EDF2F1] font-semibold"
                        }`}
                    >
                        <PaymentIcon name="savings" className="w-5 h-5" />
                        <span>Savings Pockets</span>
                        <span className="ml-1 px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#047857] text-[10px] font-bold border border-[#A7F3D0]">
                            4.5% APY
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("cards")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "cards"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-md shadow-[#D97706]/25"
                                : "text-[#566C6A] hover:text-[#0D2322] hover:bg-[#EDF2F1] font-semibold"
                        }`}
                    >
                        <PaymentIcon name="credit_card" className="w-5 h-5" />
                        <span>Cards & Security</span>
                    </button>
                </div>
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
                                        <span className="text-[#566C6A]">Available to Spend:</span>
                                        <span className="font-bold text-[#0D2322]">
                                            {balanceVisible ? `₱${spendableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "₱••••••"}
                                        </span>
                                    </div>
                                    <div className="h-3.5 w-px bg-[#D3DEDB] hidden sm:block" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-[#047857]" />
                                        <span className="text-[#566C6A]">Vault Pockets (Interest Earning):</span>
                                        <span className="font-bold text-[#047857]">
                                            {balanceVisible ? `₱${vaultBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "₱••••••"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick 4 Action Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalPayee("");
                                        setIsSendModalOpen(true);
                                    }}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-[#D97706] to-[#E07A1F] text-white shadow-lg shadow-[#D97706]/25 hover:shadow-[#D97706]/40 hover:brightness-105 transition-all transform active:scale-95 group border border-[#FED7AA]/40 cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                                        <PaymentIcon name="send" className="w-[26px] h-[26px]" />
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm">Send Money</span>
                                    <span className="text-[10px] text-amber-100 font-semibold">Free Instantly</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("send")}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#EDF2F1] text-[#0D2322] border border-[#D3DEDB] hover:bg-[#FFF7ED] hover:border-[#D97706]/40 transition-all transform active:scale-95 group shadow-xs cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-1.5 shadow-sm text-[#D97706] border border-[#E2EBE9] group-hover:scale-110 transition-transform">
                                        <PaymentIcon name="qr_code_scanner" className="w-[26px] h-[26px]" />
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm">Scan / QR Ph</span>
                                    <span className="text-[10px] text-[#566C6A] font-medium">National Rails</span>
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
                                    <span className="text-[10px] text-[#566C6A] font-medium">600+ Billers</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => toast.info("Cash-In Gateways", { description: "BPI Direct, UnionBank, 7-Eleven CLiQQ Barcode, and OTC remittance." })}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#EDF2F1] text-[#0D2322] border border-[#D3DEDB] hover:bg-[#FFF7ED] hover:border-[#D97706]/40 transition-all transform active:scale-95 group shadow-xs cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-1.5 shadow-sm text-[#D97706] border border-[#E2EBE9] group-hover:scale-110 transition-transform">
                                        <PaymentIcon name="add_circle" className="w-[26px] h-[26px]" />
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm">Cash In</span>
                                    <span className="text-[10px] text-[#566C6A] font-medium">Instant OTC / Bank</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2-Column Section: Favorite Contacts & Recent Activity Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left (4 Cols) */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Favorite Contacts */}
                            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-base font-bold text-[#0D2322]">Send Again</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalPayee("");
                                            setIsSendModalOpen(true);
                                        }}
                                        className="text-xs font-bold text-[#D97706] hover:underline cursor-pointer"
                                    >
                                        New Payee
                                    </button>
                                </div>
                                {QUICK_CONTACTS.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        {QUICK_CONTACTS.map((contact) => (
                                            <button
                                                key={contact.id}
                                                type="button"
                                                onClick={() => handleQuickSendContact(contact)}
                                                className="flex flex-col items-center gap-1 group cursor-pointer"
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm group-hover:ring-2 ring-[#D97706] transition-all ${
                                                    contact.colorTheme === "amber"
                                                        ? "bg-[#FFF7ED] text-[#B45309] border border-[#FED7AA]"
                                                        : contact.colorTheme === "sage"
                                                        ? "bg-[#E8F5F1] text-[#047857] border border-[#A7F3D0]"
                                                        : "bg-[#EDF2F1] text-[#0D2322] border border-[#D3DEDB]"
                                                }`}>
                                                    {contact.initials}
                                                </div>
                                                <span className="text-xs font-semibold text-[#0D2322] truncate w-full">
                                                    {contact.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 px-4 text-center rounded-xl bg-[#F4F7F6] border border-[#D3DEDB]">
                                        <PaymentIcon name="contacts" className="w-[26px] h-[26px] text-[#8B9F9D] mx-auto block mb-1" />
                                        <p className="text-xs font-bold text-[#0D2322]">No Recent Contacts</p>
                                        <p className="text-[11px] text-[#566C6A] mt-0.5">Frequent payees will appear here.</p>
                                    </div>
                                )}
                            </div>

                            {/* High-Yield Highlight Banner */}
                            <div className="bg-gradient-to-br from-[#0A1C1B] via-[#0D2322] to-[#163331] text-white rounded-2xl p-6 shadow-lg shadow-[#0D2322]/20 flex flex-col justify-between border border-[#163331]">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded-full bg-[#D97706]/20 text-[#E07A1F] text-[11px] font-extrabold border border-[#D97706]/30">
                                            High-Yield Pocket
                                        </span>
                                        <span className="text-xs text-gray-300">Credited Daily</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">
                                        Earn 4.5% p.a. on your savings
                                    </h3>
                                    <p className="text-xs text-gray-300 mt-1">
                                        No lock-in period. Withdraw anytime back to your primary balance without penalty.
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center justify-between pt-2 border-t border-white/10">
                                    <div>
                                        <span className="text-xs text-gray-300 block font-medium">This Month&apos;s Interest</span>
                                        <span className="text-base font-mono font-extrabold text-[#E07A1F]">+₱0.00</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("savings")}
                                        className="px-4 py-2 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#E07A1F] transition-all shadow-md cursor-pointer"
                                    >
                                        Boost Savings
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right (8 Cols): Recent Activity Feed & Ledger */}
                        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB] flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-[#0D2322]">Recent Activity</h2>
                                        <p className="text-xs text-[#566C6A]">Real-time settlement timeline & digital receipts</p>
                                    </div>

                                    {/* Feed Filter Tabs */}
                                    <div className="flex items-center bg-[#EDF2F1] p-1 rounded-xl border border-[#D3DEDB]">
                                        <button
                                            type="button"
                                            onClick={() => setTxFilter("all")}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                txFilter === "all"
                                                    ? "bg-white text-[#0D2322] shadow-xs"
                                                    : "text-[#566C6A] hover:text-[#0D2322]"
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTxFilter("in")}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                txFilter === "in"
                                                    ? "bg-white text-[#0D2322] shadow-xs"
                                                    : "text-[#566C6A] hover:text-[#0D2322]"
                                            }`}
                                        >
                                            Money In
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTxFilter("spending")}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                txFilter === "spending"
                                                    ? "bg-white text-[#0D2322] shadow-xs"
                                                    : "text-[#566C6A] hover:text-[#0D2322]"
                                            }`}
                                        >
                                            Spending
                                        </button>
                                    </div>
                                </div>

                                {/* Transaction List */}
                                {filteredTransactions.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {filteredTransactions.map((tx) => {
                                            const isNegative = tx.amount < 0;
                                            return (
                                                <div
                                                    key={tx.id}
                                                    onClick={() => setSelectedTx(tx)}
                                                    className="flex items-center justify-between p-3 hover:bg-[#EDF2F1] rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#E2EBE9]"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                                                            isNegative
                                                                ? "bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]"
                                                                : "bg-[#E8F5F1] text-[#047857] border-[#A7F3D0]"
                                                        }`}>
                                                            <PaymentIcon name={tx.icon} className="w-[22px] h-[22px]" />
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-[#0D2322]">
                                                                    {tx.merchant}
                                                                </span>
                                                                {tx.cashback !== "₱0.00" && tx.cashback !== "Free" && (
                                                                    <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#047857] text-[10px] font-bold border border-[#A7F3D0]">
                                                                        {tx.cashback}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-[#566C6A]">
                                                                {tx.date}, {tx.time} • {tx.paymentMethod}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className={`font-mono text-sm font-bold block ${
                                                            isNegative ? "text-[#0D2322]" : "text-[#047857] font-extrabold"
                                                        }`}>
                                                            {isNegative ? "-" : "+"}₱{Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                        </span>
                                                        <span className="text-[11px] text-[#047857] font-semibold flex items-center justify-end gap-1">
                                                            <PaymentIcon name="check" className="w-3.5 h-3.5" /> {tx.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-12 px-4 text-center rounded-2xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-[#D3DEDB] flex items-center justify-center text-[#566C6A] mb-3 shadow-xs">
                                            <PaymentIcon name="receipt_long" className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-sm font-bold text-[#0D2322]">No Transactions Found</h4>
                                        <p className="text-xs text-[#566C6A] mt-1 max-w-sm">
                                            {txFilter === "all"
                                                ? "Your wallet settlement history is currently clean. Transactions, smart card taps, and top-ups will appear here."
                                                : `No ${txFilter === "in" ? "incoming credits" : "spending transactions"} recorded yet.`}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-[#D3DEDB] mt-3 text-xs">
                                <span className="text-[#566C6A]">
                                    Showing {filteredTransactions.length} of {transactions.length} transactions
                                </span>
                                <button
                                    type="button"
                                    onClick={() => toast.success("PDF Statement Queued", { description: "Official account statement generated." })}
                                    className="font-bold text-[#0D2322] hover:text-[#D97706] transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <PaymentIcon name="download" className="w-[18px] h-[18px]" />
                                    <span>Export PDF Statement</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: SEND & REQUEST */}
            {activeTab === "send" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB] flex flex-col gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-[#0D2322]">Send Money Instantly</h2>
                            <p className="text-xs text-[#566C6A]">Zero transaction fees via InstaPay and Map-ePay P2P rails.</p>
                        </div>

                        <form onSubmit={handleP2pSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-[#0D2322] block mb-1">
                                    Recipient Mobile Number or Map-ePay ID
                                </label>
                                <div className="relative">
                                    <PaymentIcon name="account_circle" className="absolute left-3.5 top-2.5 text-[#566C6A] w-5 h-5" />
                                    <input
                                        type="text"
                                        value={p2pRecipient}
                                        onChange={(e) => setP2pRecipient(e.target.value)}
                                        placeholder="0917-XXX-XXXX or @username"
                                        required
                                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#EDF2F1] text-[#0D2322] text-sm border border-[#D3DEDB] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold text-[#0D2322]">Amount to Transfer</label>
                                    <span className="text-xs text-[#566C6A]">Avail: <strong className="text-[#0D2322]">₱{card.balance.toFixed(2)}</strong></span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-2 text-lg font-bold text-[#566C6A]">₱</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        max={card.balance || 100000}
                                        value={p2pAmount}
                                        onChange={(e) => setP2pAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="w-full h-12 pl-9 pr-24 rounded-xl bg-[#EDF2F1] text-[#0D2322] text-xl font-bold border border-[#D3DEDB] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setP2pAmount("100")}
                                        className="absolute right-3 top-2.5 px-2.5 py-1 rounded-lg bg-[#FFF7ED] text-[#B45309] text-xs font-bold border border-[#FED7AA] hover:bg-[#FED7AA]/40 cursor-pointer"
                                    >
                                        ₱100
                                    </button>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-[#E8F5F1] text-[#047857] border border-[#A7F3D0] flex items-center justify-between text-xs">
                                <span className="font-semibold">Transfer Fee</span>
                                <span className="font-extrabold">FREE (Unlimited)</span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white font-bold text-sm hover:brightness-105 shadow-md shadow-[#D97706]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <PaymentIcon name="send" className="w-5 h-5" />
                                <span>Confirm and Send Now</span>
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* QR Ph Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB] flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] text-[#D97706] flex items-center justify-center mb-2 border border-[#FED7AA]">
                                <PaymentIcon name="qr_code_2" className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-base text-[#0D2322]">National QR Ph Standard</h3>
                            <p className="text-xs text-[#566C6A] mt-1">Interoperable scanning for all merchant terminals and consumer transfers.</p>

                            <div className="w-44 h-44 bg-[#EDF2F1] rounded-2xl flex items-center justify-center my-4 p-4 border border-[#D3DEDB]">
                                <svg className="w-full h-full text-[#0D2322]" fill="currentColor" viewBox="0 0 100 100">
                                    <rect x="10" y="10" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                                    <rect x="16" y="16" width="12" height="12" />
                                    <rect x="66" y="10" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                                    <rect x="72" y="16" width="12" height="12" />
                                    <rect x="10" y="66" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                                    <rect x="16" y="72" width="12" height="12" />
                                    <rect x="42" y="14" width="6" height="14" />
                                    <rect x="52" y="22" width="6" height="6" />
                                    <rect x="42" y="34" width="16" height="6" />
                                    <rect x="14" y="42" width="6" height="16" />
                                    <rect x="24" y="52" width="6" height="6" />
                                    <rect x="42" y="46" width="16" height="16" fill="#D97706" />
                                    <rect x="66" y="42" width="6" height="10" />
                                    <rect x="76" y="50" width="14" height="6" />
                                    <rect x="42" y="70" width="6" height="14" />
                                    <rect x="54" y="76" width="14" height="6" />
                                    <rect x="74" y="70" width="16" height="16" />
                                </svg>
                            </div>

                            <div className="flex items-center gap-3 w-full">
                                <button
                                    type="button"
                                    onClick={() => toast.info("Camera Initialized", { description: "Point device camera at any QR Ph merchant display." })}
                                    className="flex-1 py-2 rounded-xl bg-[#EDF2F1] text-[#0D2322] text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-1.5 border border-[#D3DEDB] cursor-pointer"
                                >
                                    <PaymentIcon name="photo_camera" className="w-[18px] h-[18px] text-[#D97706]" />
                                    <span>Scan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toast.success("QR Saved", { description: "Personal QR Ph code saved to gallery." })}
                                    className="flex-1 py-2 rounded-xl bg-[#EDF2F1] text-[#0D2322] text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-1.5 border border-[#D3DEDB] cursor-pointer"
                                >
                                    <PaymentIcon name="download" className="w-[18px] h-[18px] text-[#D97706]" />
                                    <span>Save QR</span>
                                </button>
                            </div>
                        </div>

                        {/* Split the Bill Widget */}
                        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <PaymentIcon name="call_split" className="text-[#D97706] w-[22px] h-[22px]" />
                                        <span className="font-bold text-sm text-[#0D2322]">Split the Bill</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#B45309] text-[10px] font-bold border border-[#FED7AA]">
                                        P2P Group
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <span className="text-[11px] text-[#566C6A] font-semibold block mb-1">Total Bill</span>
                                        <input
                                            type="number"
                                            value={splitTotal}
                                            onChange={(e) => setSplitTotal(e.target.value)}
                                            className="w-full h-10 px-3 rounded-xl bg-[#EDF2F1] font-mono font-bold text-sm border border-[#D3DEDB]"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-[#566C6A] font-semibold block mb-1">People Split</span>
                                        <div className="flex items-center h-10 px-3 rounded-xl bg-[#EDF2F1] justify-between border border-[#D3DEDB] text-xs font-bold">
                                            <span>{splitPeople} people</span>
                                            <span className="text-[#D97706]">₱{splitAmountEach.toFixed(2)} ea</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => toast.success("Split Request Dispatched", { description: `Payment links sent to ${splitPeople - 1} contacts for ₱${splitAmountEach.toFixed(2)} each.` })}
                                className="mt-4 w-full py-2.5 rounded-xl bg-[#FFF7ED] text-[#B45309] text-xs font-bold hover:bg-[#D97706] hover:text-white transition-all border border-[#FED7AA] cursor-pointer"
                            >
                                Request ₱{splitAmountEach.toFixed(2)} from 3 Friends
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: BILLS & UTILITIES */}
            {activeTab === "bills" && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-[#0D2322]">Pay Bills & Utilities</h2>
                            <p className="text-xs text-[#566C6A]">Scheduled auto-debits, official e-receipts, and verified Philippine billers.</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search 600+ billers..."
                            className="w-full md:w-80 h-10 px-4 rounded-xl bg-white text-xs border border-[#D3DEDB] focus:outline-none focus:border-[#D97706]"
                        />
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm text-[#0D2322]">Upcoming Scheduled Bills</h3>
                            <span className="text-xs text-[#566C6A] font-bold flex items-center gap-1">
                                <PaymentIcon name="schedule" className="w-4 h-4" /> Automated Biller Queue
                            </span>
                        </div>
                        <div className="py-10 px-4 text-center rounded-2xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-xl bg-white border border-[#D3DEDB] flex items-center justify-center text-[#566C6A] mb-2 shadow-xs">
                                <PaymentIcon name="receipt_long" className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-[#0D2322]">No Upcoming Scheduled Bills</h4>
                            <p className="text-xs text-[#566C6A] mt-1 max-w-sm">
                                You do not have any pending bills or auto-debits scheduled. Search from 600+ verified billers below to enroll an account.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button
                            type="button"
                            onClick={() => toast.info("Electricity Category", { description: "42 billers available." })}
                            className="p-5 rounded-2xl bg-white shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB] hover:border-[#D97706]/40 transition-all text-left flex flex-col gap-2 group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#D97706] flex items-center justify-center border border-[#FED7AA]">
                                <PaymentIcon name="electric_bolt" className="w-7 h-7" />
                            </div>
                            <span className="font-bold text-sm text-[#0D2322]">Electricity</span>
                            <span className="text-xs text-[#566C6A]">42 Billers Available</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toast.info("Water Utilities", { description: "38 billers available." })}
                            className="p-5 rounded-2xl bg-white shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB] hover:border-[#D97706]/40 transition-all text-left flex flex-col gap-2 group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#B45309] flex items-center justify-center border border-[#FED7AA]">
                                <PaymentIcon name="water_drop" className="w-7 h-7" />
                            </div>
                            <span className="font-bold text-sm text-[#0D2322]">Water Utilities</span>
                            <span className="text-xs text-[#566C6A]">38 Billers Available</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toast.info("Telecom & Fiber", { description: "25 billers available." })}
                            className="p-5 rounded-2xl bg-white shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB] hover:border-[#D97706]/40 transition-all text-left flex flex-col gap-2 group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#D97706] flex items-center justify-center border border-[#FED7AA]">
                                <PaymentIcon name="wifi" className="w-7 h-7" />
                            </div>
                            <span className="font-bold text-sm text-[#0D2322]">Telecom & Fiber</span>
                            <span className="text-xs text-[#566C6A]">25 Billers Available</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toast.info("Government Services", { description: "SSS, Pag-IBIG, PhilHealth, BIR." })}
                            className="p-5 rounded-2xl bg-white shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB] hover:border-[#D97706]/40 transition-all text-left flex flex-col gap-2 group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#E8F5F1] text-[#047857] flex items-center justify-center border border-[#A7F3D0]">
                                <PaymentIcon name="account_balance" className="w-7 h-7" />
                            </div>
                            <span className="font-bold text-sm text-[#0D2322]">Government</span>
                            <span className="text-xs text-[#566C6A]">SSS, Pag-IBIG, BIR</span>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 4: SAVINGS POCKETS */}
            {activeTab === "savings" && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-[#0D2322]">High-Yield Savings Pockets</h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5F1] text-[#047857] text-xs font-extrabold border border-[#A7F3D0]">
                                    4.5% APY
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A] mt-0.5">Save towards dedicated personal milestones with daily interest accrual.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => toast.success("Goal Pocket Created", { description: "Created new savings pocket." })}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white text-xs font-bold hover:brightness-105 shadow-md shadow-[#D97706]/25 cursor-pointer self-start md:self-auto"
                        >
                            + Create Goal Pocket
                        </button>
                    </div>

                    <div className="py-12 px-4 text-center rounded-2xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-xl bg-white border border-[#D3DEDB] flex items-center justify-center text-[#D97706] mb-3 shadow-xs">
                            <PaymentIcon name="savings" className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-[#0D2322]">No Active Savings Goals</h4>
                        <p className="text-xs text-[#566C6A] mt-1 max-w-sm">
                            You currently have no savings pockets open. Click &quot;+ Create Goal Pocket&quot; to start setting aside funds with high-yield interest.
                        </p>
                    </div>
                </div>
            )}

            {/* TAB 5: CARDS & SECURITY */}
            {activeTab === "cards" && (
                <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Card Visualizer (6 Cols) */}
                        <div className="lg:col-span-6 flex flex-col gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#0D2322]">Contactless Smart Card & Debit</h2>
                                <p className="text-xs text-[#566C6A]">Backed by real-time balance and zero foreign transaction markup.</p>
                            </div>

                            {/* Bespoke Spruce & Amber Debit Card */}
                            <div
                                className="w-full h-56 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10"
                                style={{
                                    background: "linear-gradient(135deg, #0A1C1B 0%, #0D2322 55%, #1B3F3D 100%)",
                                }}
                            >
                                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border border-[#D97706]/20 pointer-events-none" />
                                <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full border border-white/5 pointer-events-none" />

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-extrabold tracking-widest text-white text-base">Map-ePay</span>
                                        <span className="px-2 py-0.5 rounded-md bg-[#D97706]/30 text-[#E07A1F] text-[10px] font-mono tracking-wider uppercase font-bold border border-[#D97706]/40">
                                            Smart Pass
                                        </span>
                                    </div>
                                    <PaymentIcon name="contactless" className="text-white/80 w-6 h-6" />
                                </div>

                                <div className="relative z-10 my-auto">
                                    <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-200 to-amber-500 opacity-90 mb-3 shadow-inner flex items-center justify-center">
                                        <div className="w-8 h-5 border border-amber-700/50 rounded-xs" />
                                    </div>
                                    <span className="font-mono text-xl tracking-widest text-white font-bold">
                                        •••• •••• •••• {card.cardUid.slice(-4)}
                                    </span>
                                </div>

                                <div className="relative z-10 flex items-center justify-between font-mono text-xs text-gray-300">
                                    <div>
                                        <span className="block text-[9px] uppercase tracking-wider text-gray-400">Cardholder</span>
                                        <span className="font-bold text-white">CARDHOLDER</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] uppercase tracking-wider text-gray-400">Expires</span>
                                        <span className="font-bold text-white">08/29</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] uppercase tracking-wider text-gray-400">CVV</span>
                                        <span className="font-bold text-white font-mono text-sm">{cvvDisplay}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black italic tracking-tighter text-[#E07A1F] text-lg">VISA</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleRevealCvv}
                                    className="flex-1 py-2.5 rounded-xl bg-[#EDF2F1] text-[#0D2322] text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-1.5 border border-[#D3DEDB] cursor-pointer"
                                >
                                    <PaymentIcon name="key" className="w-[18px] h-[18px] text-[#D97706]" />
                                    <span>
                                        {cvvSecondsLeft > 0 ? `CVV Active (${cvvSecondsLeft}s)` : "Reveal Dynamic CVV (60s)"}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toast.success("Digital card linked to Apple/Google Wallet")}
                                    className="flex-1 py-2.5 rounded-xl bg-[#EDF2F1] text-[#0D2322] text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-1.5 border border-[#D3DEDB] cursor-pointer"
                                >
                                    <PaymentIcon name="wallet" className="w-[18px] h-[18px] text-[#D97706]" />
                                    <span>Add to Wallet</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Security Toggles (6 Cols) */}
                        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(13,35,34,0.03)] border border-[#D3DEDB] flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-bold text-[#0D2322] mb-1">Card Security Toggles</h3>
                                <p className="text-xs text-[#566C6A] mb-4">Instant freeze and selective channel restrictions.</p>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#EDF2F1] border border-[#D3DEDB]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
                                                <PaymentIcon name="lock" className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs sm:text-sm text-[#0D2322] block">Freeze Card</span>
                                                <span className="text-[11px] text-[#566C6A]">Instantly block all new transactions</span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={cardSettings.isFrozen}
                                            onChange={(e) => {
                                                const frozen = e.target.checked;
                                                setCardSettings({ ...cardSettings, isFrozen: frozen });
                                                if (frozen) {
                                                    toast.error("Card Frozen", { description: "Pine Slate Visa card is FROZEN." });
                                                } else {
                                                    toast.success("Card Active", { description: "Pine Slate Visa card unfrozen." });
                                                }
                                            }}
                                            className="accent-[#DC2626] h-5 w-5 cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#EDF2F1] border border-[#D3DEDB]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#D97706] flex items-center justify-center">
                                                <PaymentIcon name="shopping_cart" className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs sm:text-sm text-[#0D2322] block">Online Payments</span>
                                                <span className="text-[11px] text-[#566C6A]">Permit online web checkout</span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={cardSettings.onlinePayments}
                                            onChange={(e) => {
                                                setCardSettings({ ...cardSettings, onlinePayments: e.target.checked });
                                                toast.info("Online payments updated");
                                            }}
                                            className="accent-[#D97706] h-5 w-5 cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#EDF2F1] border border-[#D3DEDB]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] text-[#047857] flex items-center justify-center">
                                                <PaymentIcon name="public" className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs sm:text-sm text-[#0D2322] block">Overseas Transactions</span>
                                                <span className="text-[11px] text-[#566C6A]">Foreign currency in-store & POS</span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={cardSettings.overseasTransactions}
                                            onChange={(e) => {
                                                setCardSettings({ ...cardSettings, overseasTransactions: e.target.checked });
                                                toast.info("Overseas transaction settings saved");
                                            }}
                                            className="accent-[#D97706] h-5 w-5 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-2 border-t border-[#D3DEDB] flex items-center justify-between">
                                <span className="text-xs text-[#566C6A]">Daily Limit: Currently ₱100,000 / day</span>
                                <button
                                    type="button"
                                    onClick={() => toast.info("Daily limit configuration loaded")}
                                    className="text-xs text-[#D97706] font-bold hover:underline cursor-pointer"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Integrated DESFire EV3 Smart Card Top-up Engine */}
                    <div className="pt-6 border-t border-[#D3DEDB] flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-[#0D2322]">
                                    IoT Transit & Campus Pass Direct Top-up
                                </h3>
                                <span className="px-2 py-0.5 rounded-md bg-[#EDF2F1] text-[#0D2322] text-[10px] font-mono font-bold border border-[#D3DEDB]">
                                    NFC DESFire EV3
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A] mt-0.5">
                                Direct cloud clearing payment gateway for transit cards, campus IDs & contactless tap balances.
                            </p>
                        </div>

                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
                            <div className="lg:col-span-7 flex flex-col gap-6">
                                <SmartCardVisualizer
                                    card={card}
                                    amount={amount}
                                    projectedBalance={projectedBalance}
                                />
                                <AmountSelector
                                    presetAmounts={presetAmounts}
                                    selectedAmount={selectedAmount}
                                    customAmount={customAmount}
                                    onSelectPreset={handleSelectPreset}
                                    onCustomChange={handleCustomChange}
                                />
                                <PaymentChannelSelector
                                    paymentMethod={paymentMethod}
                                    onSelectMethod={setPaymentMethod}
                                />
                            </div>

                            <div className="lg:col-span-5 flex flex-col gap-6">
                                <TransactionSummaryCard
                                    card={card}
                                    amount={amount}
                                    fee={fee}
                                    vat={vat}
                                    total={total}
                                    isProcessing={isProcessing}
                                    onConfirmTopUp={handleProcessTopUp}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Send Modal Dialog */}
            <QuickSendModal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                initialPayee={modalPayee}
            />

            {/* Slide-over Receipt Drawer */}
            <ReceiptDrawer
                isOpen={!!selectedTx}
                onClose={() => setSelectedTx(null)}
                transaction={selectedTx}
            />
        </div>
    );
}
