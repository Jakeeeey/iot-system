"use client";

import React, { useState, useEffect } from "react";
import {
    Eye,
    EyeOff,
    Send,
    QrCode,
    Receipt,
    PlusCircle,
    Copy,
    Shield,
    CheckCircle2,
    Coffee,
    ArrowDownLeft,
    Zap,
    User,
    ShoppingBag,
    Download,
    Camera,
    Share2,
    Lock,
    Key,
    Smartphone,
    Globe,
    Gauge,
    Sliders,
    CreditCard,
    AlertTriangle,
    Coins,
} from "lucide-react";
import { toast } from "sonner";
import { WalletTransactionItem, QuickContact, ScheduledBill, SavingsGoal, CardSecuritySettings } from "../types";
import { QuickSendModal } from "./QuickSendModal";
import { ReceiptDrawer } from "./ReceiptDrawer";
import { SmartCardVisualizer } from "./SmartCardVisualizer";
import { AmountSelector } from "./AmountSelector";
import { PaymentChannelSelector } from "./PaymentChannelSelector";
import { TransactionSummaryCard } from "./TransactionSummaryCard";
import { usePaymentGatewayContext } from "../providers/PaymentGatewayProvider";

const INITIAL_TRANSACTIONS: WalletTransactionItem[] = [
    {
        id: "tx-1",
        merchant: "Starbucks Reserve BGC",
        amount: -385.00,
        type: "spending",
        time: "2:14 PM",
        date: "Today",
        referenceCode: "POS Terminal #8819",
        cashback: "+₱7.70 (2% Cashback)",
        category: "Food & Dining",
        paymentMethod: "Visa Contactless (Spruce Slate Debit)",
        status: "Settled",
        icon: "coffee",
    },
    {
        id: "tx-2",
        merchant: "Nexus Corp Payroll Direct",
        amount: 45000.00,
        type: "in",
        time: "8:00 AM",
        date: "Apr 15, 2025",
        referenceCode: "ACH REF #NX9901452",
        cashback: "₱0.00",
        category: "Payroll / Compensation",
        paymentMethod: "InstaPay Direct Deposit",
        status: "Settled",
        icon: "salary",
    },
    {
        id: "tx-3",
        merchant: "Meralco Utilities",
        amount: -4820.10,
        type: "spending",
        time: "9:30 AM",
        date: "Apr 14, 2025",
        referenceCode: "CAN #0991204881",
        cashback: "Waived Fee",
        category: "Utilities",
        paymentMethod: "ApexPay Wallet Direct",
        status: "Auto-Paid",
        icon: "bolt",
    },
    {
        id: "tx-4",
        merchant: "Marco Ramos (P2P)",
        amount: 1250.00,
        type: "in",
        time: "7:15 PM",
        date: "Apr 12, 2025",
        referenceCode: "ApexPay P2P #TX0932",
        cashback: "Free",
        category: "P2P Transfer",
        paymentMethod: "Wallet to Wallet",
        status: "Settled",
        icon: "user",
    },
    {
        id: "tx-5",
        merchant: "Uniqlo SM Aura",
        amount: -2490.00,
        type: "spending",
        time: "4:45 PM",
        date: "Apr 10, 2025",
        referenceCode: "Terminal #9940",
        cashback: "+₱49.80 (2% Cashback)",
        category: "Shopping",
        paymentMethod: "QR Ph Dynamic Scan",
        status: "Settled",
        icon: "shopping",
    },
];

const QUICK_CONTACTS: QuickContact[] = [
    { id: "c1", name: "Marco", phone: "0918-554-1029", initials: "MR", colorTheme: "amber" },
    { id: "c2", name: "Aria", phone: "0917-882-9901", initials: "AS", colorTheme: "sage" },
    { id: "c3", name: "Danilo", phone: "0999-312-4011", initials: "DC", colorTheme: "slate" },
    { id: "c4", name: "Sarah", phone: "0922-109-8873", initials: "SC", colorTheme: "amber" },
];

export function ConsumerWalletView() {
    // Context from Smart Card Top-up
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

    // Tab Navigation State
    const [activeTab, setActiveTab] = useState<"overview" | "send" | "bills" | "savings" | "cards">("overview");

    // Balance visibility toggle
    const [balanceVisible, setBalanceVisible] = useState(true);

    // Dynamic CVV Generation state (60s countdown)
    const [cvvDisplay, setCvvDisplay] = useState("•••");
    const [cvvSecondsLeft, setCvvSecondsLeft] = useState(0);

    // Card security toggles
    const [cardSettings, setCardSettings] = useState<CardSecuritySettings>({
        isFrozen: false,
        onlinePayments: true,
        overseasTransactions: true,
        dailyLimit: 100000,
    });

    // Transactions and receipt drawer
    const [transactions, setTransactions] = useState<WalletTransactionItem[]>(INITIAL_TRANSACTIONS);
    const [txFilter, setTxFilter] = useState<"all" | "in" | "spending">("all");
    const [selectedTx, setSelectedTx] = useState<WalletTransactionItem | null>(null);

    // Modals
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [modalPayee, setModalPayee] = useState("");

    // P2P Direct Send Form in Send tab
    const [p2pRecipient, setP2pRecipient] = useState("");
    const [p2pAmount, setP2pAmount] = useState("");

    // Split Bill State
    const [splitTotal, setSplitTotal] = useState("3450");
    const [splitPeople, setSplitPeople] = useState(4);

    // Savings Goals
    const [emergencyFund, setEmergencyFund] = useState(18500);
    const [tokyoTrip, setTokyoTrip] = useState(5920.50);
    const [autoRoundUpActive, setAutoRoundUpActive] = useState(true);

    // CVV Countdown timer
    useEffect(() => {
        if (cvvSecondsLeft <= 0) {
            setCvvDisplay("•••");
            return;
        }
        const timer = setInterval(() => {
            setCvvSecondsLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cvvSecondsLeft]);

    const handleRevealCvv = () => {
        const randCvv = Math.floor(100 + Math.random() * 900).toString();
        setCvvDisplay(randCvv);
        setCvvSecondsLeft(60);
        toast.success("Dynamic CVV Generated", {
            description: `CVV ${randCvv} is valid for 60 seconds.`,
        });
    };

    const handleCopyAccount = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText("09170044421");
        }
        toast.info("Account Number Copied", {
            description: "Account number 0917-•••-4421 copied to clipboard.",
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
        toast.success("P2P Transfer Sent!", {
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
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-2">
            {/* Top Consumer Greeting Ribbon */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0D2322] dark:text-foreground">
                            Good afternoon, Elena
                        </h1>
                        <span className="inline-flex items-center text-[#D97706]" title="Tier 3 Verified">
                            <CheckCircle2 className="w-5 h-5 fill-[#D97706] text-white" />
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#566C6A] dark:text-muted-foreground mt-0.5">
                        Welcome back to your everyday financial hub powered by ApexPay.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F1] text-[#059669] border border-[#BCE3D6] text-xs font-bold">
                        <Shield className="w-3.5 h-3.5" />
                        <span>PDIC Insured up to ₱500,000</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#B45309] border border-[#FED7AA] text-xs font-bold">
                        <span className="h-2 w-2 rounded-full bg-[#D97706]" />
                        <span>Tier 3 Verified Account</span>
                    </div>

                    <div className="flex items-center bg-white dark:bg-card px-3 py-1 rounded-full border border-[#D3DEDB] dark:border-border text-xs text-[#566C6A] dark:text-muted-foreground">
                        <span className="font-mono font-semibold mr-2">0917 •••• 4421</span>
                        <button
                            type="button"
                            onClick={handleCopyAccount}
                            className="hover:text-[#D97706] transition-colors cursor-pointer"
                            title="Copy Account Number"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-Page Tab Navigation */}
            <div className="w-full bg-white dark:bg-card rounded-2xl p-1.5 shadow-xs border border-[#D3DEDB] dark:border-border overflow-x-auto">
                <div className="flex items-center min-w-max gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "overview"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-sm font-extrabold"
                                : "text-[#566C6A] dark:text-muted-foreground hover:bg-[#F4F7F6] dark:hover:bg-muted"
                        }`}
                    >
                        <Coins className="w-4 h-4" />
                        <span>Overview & Balance</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("send")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "send"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-sm font-extrabold"
                                : "text-[#566C6A] dark:text-muted-foreground hover:bg-[#F4F7F6] dark:hover:bg-muted"
                        }`}
                    >
                        <Send className="w-4 h-4" />
                        <span>Send & Request (P2P / QR Ph)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("bills")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "bills"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-sm font-extrabold"
                                : "text-[#566C6A] dark:text-muted-foreground hover:bg-[#F4F7F6] dark:hover:bg-muted"
                        }`}
                    >
                        <Receipt className="w-4 h-4" />
                        <span>Bills & Utilities</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("savings")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "savings"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-sm font-extrabold"
                                : "text-[#566C6A] dark:text-muted-foreground hover:bg-[#F4F7F6] dark:hover:bg-muted"
                        }`}
                    >
                        <span>Savings Pockets</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#E8F5F1] text-[#059669] text-[10px] font-extrabold border border-[#BCE3D6]">
                            4.5% APY
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("cards")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeTab === "cards"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-sm font-extrabold"
                                : "text-[#566C6A] dark:text-muted-foreground hover:bg-[#F4F7F6] dark:hover:bg-muted"
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>Cards & Smart Passes</span>
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* TAB 1: OVERVIEW & BALANCE */}
            {/* ======================================================== */}
            {activeTab === "overview" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                    {/* Hero Balance Banner */}
                    <div className="w-full bg-white dark:bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-[#D3DEDB] dark:border-border relative overflow-hidden">
                        <div className="absolute -right-16 -top-16 w-96 h-96 bg-gradient-to-br from-[#D97706]/10 to-[#E8F5F1]/30 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A] dark:text-muted-foreground">
                                        Total Net Worth across ApexPay
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setBalanceVisible(!balanceVisible)}
                                        className="p-1 rounded-md text-[#566C6A] hover:text-[#D97706] transition-colors cursor-pointer"
                                    >
                                        {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl sm:text-2xl font-bold text-[#566C6A] dark:text-muted-foreground">PHP</span>
                                    <span className="text-3xl sm:text-5xl font-black tracking-tight text-[#0D2322] dark:text-foreground font-mono">
                                        {balanceVisible ? "148,920.50" : "••••••••"}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-[#D97706]" />
                                        <span className="text-[#566C6A] dark:text-muted-foreground">Available to Spend:</span>
                                        <span className="font-bold text-[#0D2322] dark:text-foreground">
                                            {balanceVisible ? "₱124,500.00" : "₱••••••"}
                                        </span>
                                    </div>
                                    <div className="h-3 w-px bg-[#D3DEDB] dark:bg-border hidden sm:block" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-[#059669]" />
                                        <span className="text-[#566C6A] dark:text-muted-foreground">Vault Pockets (Interest Earning):</span>
                                        <span className="font-bold text-[#059669] dark:text-emerald-400">
                                            {balanceVisible ? "₱24,420.50" : "₱••••••"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick 4 Main Actions */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalPayee("");
                                        setIsSendModalOpen(true);
                                    }}
                                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-[#D97706] to-[#E07A1F] text-white shadow-md shadow-[#D97706]/25 hover:brightness-105 active:scale-95 transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                                        <Send className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-bold">Send Money</span>
                                    <span className="text-[10px] text-amber-100 font-semibold">Free Instant</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("send")}
                                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#F4F7F6] dark:bg-muted text-[#0D2322] dark:text-foreground border border-[#D3DEDB] dark:border-border hover:bg-[#FFF7ED] hover:border-[#D97706]/40 active:scale-95 transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-card flex items-center justify-center mb-1.5 shadow-xs text-[#D97706] border border-[#D3DEDB]/60 group-hover:scale-110 transition-transform">
                                        <QrCode className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold">Scan / QR Ph</span>
                                    <span className="text-[10px] text-[#566C6A] dark:text-muted-foreground">National Rails</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("bills")}
                                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#F4F7F6] dark:bg-muted text-[#0D2322] dark:text-foreground border border-[#D3DEDB] dark:border-border hover:bg-[#FFF7ED] hover:border-[#D97706]/40 active:scale-95 transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-card flex items-center justify-center mb-1.5 shadow-xs text-[#D97706] border border-[#D3DEDB]/60 group-hover:scale-110 transition-transform">
                                        <Receipt className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold">Pay Bills</span>
                                    <span className="text-[10px] text-[#566C6A] dark:text-muted-foreground">600+ Billers</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => toast.info("Cash-In Gateways", { description: "Supported: BPI Direct, UnionBank, 7-Eleven CLiQQ Barcode, and OTC remittance centers." })}
                                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#F4F7F6] dark:bg-muted text-[#0D2322] dark:text-foreground border border-[#D3DEDB] dark:border-border hover:bg-[#FFF7ED] hover:border-[#D97706]/40 active:scale-95 transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-card flex items-center justify-center mb-1.5 shadow-xs text-[#D97706] border border-[#D3DEDB]/60 group-hover:scale-110 transition-transform">
                                        <PlusCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold">Cash In</span>
                                    <span className="text-[10px] text-[#566C6A] dark:text-muted-foreground">Instant Bank/OTC</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2-Column Section: Favorite Contacts & Recent Activity Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left (4 Cols): Send Again & High-Yield Banner */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Favorite Contacts */}
                            <div className="bg-white dark:bg-card rounded-2xl p-5 shadow-sm border border-[#D3DEDB] dark:border-border">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-sm text-[#0D2322] dark:text-foreground">Send Again</h3>
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
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    {QUICK_CONTACTS.map((contact) => (
                                        <button
                                            key={contact.id}
                                            type="button"
                                            onClick={() => handleQuickSendContact(contact)}
                                            className="flex flex-col items-center gap-1 group cursor-pointer"
                                        >
                                            <div className="w-11 h-11 rounded-full bg-[#FFF7ED] text-[#B45309] dark:bg-muted dark:text-foreground flex items-center justify-center font-bold text-xs group-hover:ring-2 ring-[#D97706] border border-[#FED7AA] transition-all">
                                                {contact.initials}
                                            </div>
                                            <span className="text-[11px] font-semibold text-[#0D2322] dark:text-foreground truncate w-full">
                                                {contact.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* High-Yield Savings Highlight */}
                            <div className="bg-gradient-to-br from-[#0A1C1B] via-[#0D2322] to-[#163331] text-white rounded-2xl p-6 shadow-md shadow-[#0D2322]/20 flex flex-col justify-between border border-[#163331]">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded-full bg-[#D97706]/20 text-[#E07A1F] text-[10px] font-extrabold border border-[#D97706]/30">
                                            High-Yield Pocket
                                        </span>
                                        <span className="text-[11px] text-gray-300">Credited Daily</span>
                                    </div>
                                    <h4 className="text-base font-bold text-white tracking-tight">
                                        Earn 4.5% p.a. on your savings
                                    </h4>
                                    <p className="text-xs text-gray-300 mt-1">
                                        Zero lock-in period. Withdraw anytime back to your primary balance without fees.
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center justify-between pt-2 border-t border-white/10">
                                    <div>
                                        <span className="text-[10px] text-gray-400 block font-medium">This Month's Interest</span>
                                        <span className="text-sm font-mono font-extrabold text-[#E07A1F]">+₱91.42</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("savings")}
                                        className="px-3 py-1.5 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-all shadow-xs cursor-pointer"
                                    >
                                        Boost Savings
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right (8 Cols): Recent Activity Feed & Ledger */}
                        <div className="lg:col-span-8 bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-[#0D2322] dark:text-foreground">
                                            Recent Activity
                                        </h2>
                                        <p className="text-xs text-[#566C6A] dark:text-muted-foreground">
                                            Real-time settlement timeline & digital receipts
                                        </p>
                                    </div>

                                    {/* Feed Filter Tabs */}
                                    <div className="flex items-center bg-[#F4F7F6] dark:bg-muted p-1 rounded-xl border border-[#D3DEDB] dark:border-border">
                                        <button
                                            type="button"
                                            onClick={() => setTxFilter("all")}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                txFilter === "all"
                                                    ? "bg-white dark:bg-card text-[#0D2322] dark:text-foreground shadow-xs"
                                                    : "text-[#566C6A] dark:text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTxFilter("in")}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                txFilter === "in"
                                                    ? "bg-white dark:bg-card text-[#0D2322] dark:text-foreground shadow-xs"
                                                    : "text-[#566C6A] dark:text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            Money In
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTxFilter("spending")}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                txFilter === "spending"
                                                    ? "bg-white dark:bg-card text-[#0D2322] dark:text-foreground shadow-xs"
                                                    : "text-[#566C6A] dark:text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            Spending
                                        </button>
                                    </div>
                                </div>

                                {/* Transaction List */}
                                <div className="flex flex-col gap-2">
                                    {filteredTransactions.map((tx) => {
                                        const isNegative = tx.amount < 0;
                                        return (
                                            <div
                                                key={tx.id}
                                                onClick={() => setSelectedTx(tx)}
                                                className="flex items-center justify-between p-3 hover:bg-[#F4F7F6] dark:hover:bg-muted/60 rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#D3DEDB]/60"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                                        isNegative
                                                            ? "bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]"
                                                            : "bg-[#E8F5F1] text-[#059669] border-[#BCE3D6]"
                                                    }`}>
                                                        {tx.icon === "coffee" && <Coffee className="w-5 h-5" />}
                                                        {tx.icon === "salary" && <ArrowDownLeft className="w-5 h-5" />}
                                                        {tx.icon === "bolt" && <Zap className="w-5 h-5" />}
                                                        {tx.icon === "user" && <User className="w-5 h-5" />}
                                                        {tx.icon === "shopping" && <ShoppingBag className="w-5 h-5" />}
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs sm:text-sm text-[#0D2322] dark:text-foreground">
                                                                {tx.merchant}
                                                            </span>
                                                            {tx.cashback !== "₱0.00" && tx.cashback !== "Free" && (
                                                                <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#059669] text-[10px] font-bold border border-[#BCE3D6]">
                                                                    {tx.cashback}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-[#566C6A] dark:text-muted-foreground">
                                                            {tx.date}, {tx.time} • {tx.paymentMethod}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`font-mono text-sm font-bold block ${
                                                        isNegative
                                                            ? "text-[#0D2322] dark:text-foreground"
                                                            : "text-[#059669] font-extrabold"
                                                    }`}>
                                                        {isNegative ? "-" : "+"}₱{Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-[11px] text-[#059669] font-semibold">
                                                        ✓ {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-[#D3DEDB] dark:border-border mt-3 text-xs">
                                <span className="text-[#566C6A] dark:text-muted-foreground">
                                    Showing {filteredTransactions.length} of 38 transactions this month
                                </span>
                                <button
                                    type="button"
                                    onClick={() => toast.success("PDF Statement Queued", { description: "Generating encrypted official monthly statement." })}
                                    className="font-bold text-[#0D2322] dark:text-foreground hover:text-[#D97706] transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Export PDF Statement</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: SEND & REQUEST (P2P / QR PH) */}
            {/* ======================================================== */}
            {activeTab === "send" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
                    {/* Left Form (7 Cols) */}
                    <div className="lg:col-span-7 bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-[#D3DEDB] dark:border-border flex flex-col gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-[#0D2322] dark:text-foreground">
                                Send Money Instantly
                            </h2>
                            <p className="text-xs text-[#566C6A] dark:text-muted-foreground">
                                Zero transaction fees via InstaPay and ApexPay internal clearing rails.
                            </p>
                        </div>

                        <form onSubmit={handleP2pSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-[#0D2322] dark:text-foreground block mb-1">
                                    Recipient Mobile Number or ApexPay ID
                                </label>
                                <input
                                    type="text"
                                    value={p2pRecipient}
                                    onChange={(e) => setP2pRecipient(e.target.value)}
                                    placeholder="0917-XXX-XXXX or @username"
                                    required
                                    className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] dark:bg-muted/50 text-sm border border-[#D3DEDB] dark:border-border focus:border-[#D97706] focus:bg-white dark:focus:bg-card focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold text-[#0D2322] dark:text-foreground">
                                        Amount to Transfer
                                    </label>
                                    <span className="text-xs text-[#566C6A] dark:text-muted-foreground">
                                        Avail: <strong>₱124,500.00</strong>
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-2 text-lg font-bold text-[#566C6A]">₱</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        max="124500"
                                        value={p2pAmount}
                                        onChange={(e) => setP2pAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="w-full h-12 pl-9 pr-24 rounded-xl bg-[#F4F7F6] dark:bg-muted/50 text-xl font-bold border border-[#D3DEDB] dark:border-border focus:border-[#D97706] focus:bg-white dark:focus:bg-card focus:outline-none transition-all font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setP2pAmount("1000")}
                                        className="absolute right-3 top-2.5 px-2.5 py-1 rounded-lg bg-[#FFF7ED] text-[#B45309] text-xs font-bold border border-[#FED7AA] hover:bg-[#FED7AA]/40 cursor-pointer"
                                    >
                                        ₱1,000
                                    </button>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-[#E8F5F1] text-[#059669] border border-[#BCE3D6] flex items-center justify-between text-xs">
                                <span className="font-semibold">Transfer Fee</span>
                                <span className="font-extrabold">FREE (Unlimited)</span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white font-bold text-sm hover:brightness-105 shadow-md shadow-[#D97706]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                <span>Confirm and Send Now</span>
                            </button>
                        </form>
                    </div>

                    {/* Right (5 Cols): QR Ph & Split Bill */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* QR Ph National Card */}
                        <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-[#D3DEDB] dark:border-border flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#D97706] flex items-center justify-center mb-2 border border-[#FED7AA]">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-base text-[#0D2322] dark:text-foreground">
                                National QR Ph Standard
                            </h3>
                            <p className="text-xs text-[#566C6A] dark:text-muted-foreground mt-1">
                                Interoperable scanning for all merchant terminals and consumer transfers.
                            </p>

                            {/* Simulated Crisp QR Code */}
                            <div className="w-44 h-44 bg-[#F4F7F6] dark:bg-muted/70 rounded-2xl flex items-center justify-center my-4 p-4 border border-[#D3DEDB] dark:border-border">
                                <svg className="w-full h-full text-[#0D2322] dark:text-foreground" fill="currentColor" viewBox="0 0 100 100">
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
                                    className="flex-1 py-2 rounded-xl bg-[#F4F7F6] dark:bg-muted text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-1.5 border border-[#D3DEDB] dark:border-border cursor-pointer"
                                >
                                    <Camera className="w-4 h-4 text-[#D97706]" />
                                    <span>Scan Camera</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toast.success("QR Saved", { description: "Personal QR Ph image saved to gallery." })}
                                    className="flex-1 py-2 rounded-xl bg-[#F4F7F6] dark:bg-muted text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-1.5 border border-[#D3DEDB] dark:border-border cursor-pointer"
                                >
                                    <Download className="w-4 h-4 text-[#D97706]" />
                                    <span>Save QR</span>
                                </button>
                            </div>
                        </div>

                        {/* Split the Bill Widget */}
                        <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-sm text-[#0D2322] dark:text-foreground">Split the Bill</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#B45309] text-[10px] font-bold border border-[#FED7AA]">
                                        P2P Group
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <span className="text-[11px] text-[#566C6A] dark:text-muted-foreground font-semibold block mb-1">Total Bill</span>
                                        <input
                                            type="number"
                                            value={splitTotal}
                                            onChange={(e) => setSplitTotal(e.target.value)}
                                            className="w-full h-10 px-3 rounded-xl bg-[#F4F7F6] dark:bg-muted font-mono font-bold text-sm border border-[#D3DEDB] dark:border-border"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-[#566C6A] dark:text-muted-foreground font-semibold block mb-1">Persons</span>
                                        <div className="flex items-center h-10 px-3 rounded-xl bg-[#F4F7F6] dark:bg-muted justify-between border border-[#D3DEDB] dark:border-border text-xs font-bold">
                                            <span>{splitPeople} people</span>
                                            <span className="text-[#D97706]">₱{splitAmountEach.toFixed(2)} ea</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => toast.success("Split Request Dispatched", { description: `Payment links sent to ${splitPeople - 1} contacts for ₱${splitAmountEach.toFixed(2)} each.` })}
                                className="mt-4 w-full py-2 rounded-xl bg-[#FFF7ED] text-[#B45309] text-xs font-bold hover:bg-[#D97706] hover:text-white transition-all border border-[#FED7AA] cursor-pointer"
                            >
                                Request ₱{splitAmountEach.toFixed(2)} from Friends
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: BILLS & UTILITIES */}
            {/* ======================================================== */}
            {activeTab === "bills" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-[#0D2322] dark:text-foreground">Pay Bills & Utilities</h2>
                            <p className="text-xs text-[#566C6A] dark:text-muted-foreground">
                                Scheduled auto-debits, official e-receipts, and verified Philippine billers.
                            </p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search 600+ billers..."
                            className="w-full md:w-80 h-10 px-4 rounded-xl bg-white dark:bg-card text-xs border border-[#D3DEDB] dark:border-border focus:outline-none focus:border-[#D97706]"
                        />
                    </div>

                    {/* Scheduled Auto-Pays */}
                    <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-[#D3DEDB] dark:border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm text-[#0D2322] dark:text-foreground">Upcoming Scheduled Bills</h3>
                            <span className="text-xs text-[#059669] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Auto-Coverage Active
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#B45309] text-[10px] font-bold">Electricity</span>
                                        <span className="text-[10px] text-[#566C6A] font-bold">Due in 6 days</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-[#0D2322] dark:text-foreground">Meralco Manila</h4>
                                    <span className="text-xs text-[#566C6A] block">Acct: 0991-2048-81</span>
                                </div>
                                <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#D3DEDB] dark:border-border">
                                    <span className="font-mono font-bold text-sm">Est. ₱4,800.00</span>
                                    <button
                                        type="button"
                                        onClick={() => toast.info("Auto-Pay Updated", { description: "Meralco bill preferences saved." })}
                                        className="text-xs text-[#D97706] font-bold hover:underline cursor-pointer"
                                    >
                                        Edit Auto-Pay
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#B45309] text-[10px] font-bold">Fiber Internet</span>
                                        <span className="text-[10px] text-[#566C6A] font-bold">Due in 11 days</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-[#0D2322] dark:text-foreground">PLDT Home Fibr</h4>
                                    <span className="text-xs text-[#566C6A] block">Acct: 8812-4091-22</span>
                                </div>
                                <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#D3DEDB] dark:border-border">
                                    <span className="font-mono font-bold text-sm">₱2,399.00</span>
                                    <button
                                        type="button"
                                        onClick={() => toast.info("Auto-Pay Updated", { description: "PLDT bill preferences saved." })}
                                        className="text-xs text-[#D97706] font-bold hover:underline cursor-pointer"
                                    >
                                        Edit Auto-Pay
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#B45309] text-[10px] font-bold">Water Supply</span>
                                        <span className="text-[10px] text-[#566C6A] font-bold">Due in 18 days</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-[#0D2322] dark:text-foreground">Manila Water Co.</h4>
                                    <span className="text-xs text-[#566C6A] block">Acct: MW-441-098</span>
                                </div>
                                <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#D3DEDB] dark:border-border">
                                    <span className="font-mono font-bold text-sm">Est. ₱640.00</span>
                                    <button
                                        type="button"
                                        onClick={() => toast.info("Auto-Pay Updated", { description: "Manila Water preferences saved." })}
                                        className="text-xs text-[#D97706] font-bold hover:underline cursor-pointer"
                                    >
                                        Edit Auto-Pay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Selector Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button
                            type="button"
                            onClick={() => toast.info("Electricity Category", { description: "42 providers: Meralco, Visayan Electric, Davao Light, etc." })}
                            className="p-5 rounded-2xl bg-white dark:bg-card border border-[#D3DEDB] dark:border-border hover:border-[#D97706]/50 transition-all text-left flex flex-col gap-2 group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#D97706] flex items-center justify-center border border-[#FED7AA]">
                                <Zap className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm text-[#0D2322] dark:text-foreground">Electricity</span>
                            <span className="text-xs text-[#566C6A]">42 Billers Available</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toast.info("Water Utilities", { description: "38 providers: Manila Water, Maynilad, Primewater, etc." })}
                            className="p-5 rounded-2xl bg-white dark:bg-card border border-[#D3DEDB] dark:border-border hover:border-[#D97706]/50 transition-all text-left flex flex-col gap-2 group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#D97706] flex items-center justify-center border border-[#FED7AA]">
                                <Coins className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm text-[#0D2322] dark:text-foreground">Water Utilities</span>
                            <span className="text-xs text-[#566C6A]">38 Billers Available</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toast.info("Telecom & Fiber", { description: "25 providers: Globe, Smart, PLDT, Converge, DITO, etc." })}
                            className="p-5 rounded-2xl bg-white dark:bg-card border border-[#D3DEDB] dark:border-border hover:border-[#D97706]/50 transition-all text-left flex flex-col gap-2 group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#D97706] flex items-center justify-center border border-[#FED7AA]">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm text-[#0D2322] dark:text-foreground">Telecom & Fiber</span>
                            <span className="text-xs text-[#566C6A]">25 Billers Available</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toast.info("Government Services", { description: "Official API sync: SSS, Pag-IBIG Fund, PhilHealth, BIR, DFA." })}
                            className="p-5 rounded-2xl bg-white dark:bg-card border border-[#D3DEDB] dark:border-border hover:border-[#D97706]/50 transition-all text-left flex flex-col gap-2 group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] text-[#059669] flex items-center justify-center border border-[#BCE3D6]">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm text-[#0D2322] dark:text-foreground">Government</span>
                            <span className="text-xs text-[#566C6A]">SSS, Pag-IBIG, BIR</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: SAVINGS POCKETS (4.5% APY) */}
            {/* ======================================================== */}
            {activeTab === "savings" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-[#0D2322] dark:text-foreground">
                                    High-Yield Savings Pockets
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#059669] text-xs font-extrabold border border-[#BCE3D6]">
                                    4.5% APY
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A] dark:text-muted-foreground mt-0.5">
                                Save towards dedicated personal milestones with daily compounding interest.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => toast.success("New Pocket Created", { description: "Added new high-yield savings pocket." })}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white text-xs font-bold hover:brightness-105 shadow-sm shadow-[#D97706]/30 cursor-pointer self-start md:self-auto"
                        >
                            + Create Goal Pocket
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Goal 1: Emergency Fund */}
                        <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl">🛡️</span>
                                    <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#059669] text-[10px] font-bold border border-[#BCE3D6]">
                                        +₱54.20 this mo
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-[#0D2322] dark:text-foreground">Emergency Fund</h3>
                                <p className="text-xs text-[#566C6A]">6 months runway buffer</p>

                                <div className="my-4">
                                    <div className="flex items-baseline justify-between mb-1 text-xs">
                                        <span className="font-mono font-bold text-[#0D2322] dark:text-foreground text-sm">
                                            ₱{emergencyFund.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[#566C6A]">Goal: ₱50,000</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-[#F4F7F6] dark:bg-muted overflow-hidden">
                                        <div className="h-full bg-[#059669] rounded-full" style={{ width: `${Math.min(100, (emergencyFund / 50000) * 100)}%` }} />
                                    </div>
                                    <span className="text-[10px] text-[#566C6A] block text-right mt-1 font-bold">
                                        {Math.round((emergencyFund / 50000) * 100)}% completed
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setEmergencyFund((prev) => prev + 1000);
                                    toast.success("Deposit Successful", { description: "Transferred ₱1,000 to Emergency Fund." });
                                }}
                                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white text-xs font-bold hover:brightness-105 transition-all shadow-xs cursor-pointer"
                            >
                                Deposit ₱1,000
                            </button>
                        </div>

                        {/* Goal 2: Tokyo Trip */}
                        <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl">✈️</span>
                                    <span className="px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#B45309] text-[10px] font-bold border border-[#FED7AA]">
                                        Auto-save ₱2.5k/mo
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-[#0D2322] dark:text-foreground">Tokyo Autumn 2025</h3>
                                <p className="text-xs text-[#566C6A]">Flights & Accommodation</p>

                                <div className="my-4">
                                    <div className="flex items-baseline justify-between mb-1 text-xs">
                                        <span className="font-mono font-bold text-[#0D2322] dark:text-foreground text-sm">
                                            ₱{tokyoTrip.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[#566C6A]">Goal: ₱60,000</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-[#F4F7F6] dark:bg-muted overflow-hidden">
                                        <div className="h-full bg-[#D97706] rounded-full" style={{ width: `${Math.min(100, (tokyoTrip / 60000) * 100)}%` }} />
                                    </div>
                                    <span className="text-[10px] text-[#566C6A] block text-right mt-1 font-bold">
                                        {Math.round((tokyoTrip / 60000) * 100)}% completed
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setTokyoTrip((prev) => prev + 1000);
                                    toast.success("Deposit Successful", { description: "Transferred ₱1,000 to Tokyo Trip." });
                                }}
                                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white text-xs font-bold hover:brightness-105 transition-all shadow-xs cursor-pointer"
                            >
                                Deposit ₱1,000
                            </button>
                        </div>

                        {/* Spare Change Round-up */}
                        <div className="bg-gradient-to-br from-[#FFF7ED] to-[#F4F7F6] dark:from-card dark:to-muted rounded-2xl p-6 shadow-sm border border-[#FED7AA] flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-[#0D2322] dark:text-foreground flex items-center gap-1.5">
                                    <Coins className="w-4 h-4 text-[#D97706]" />
                                    <span>Spare Change Round-Up</span>
                                </h3>
                                <p className="text-xs text-[#566C6A] mt-1">
                                    Round up your daily payments to the nearest ₱50 and deposit the difference into your vault.
                                </p>

                                <div className="mt-4 p-3 bg-white dark:bg-card rounded-xl flex items-center justify-between border border-[#D3DEDB]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#0D2322] dark:text-foreground">Auto Round-Up</span>
                                        <span className="text-[10px] text-[#059669] font-extrabold">Active (₱50)</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={autoRoundUpActive}
                                        onChange={(e) => {
                                            setAutoRoundUpActive(e.target.checked);
                                            toast.info("Round-up preference updated");
                                        }}
                                        className="accent-[#D97706] h-4 w-4 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <span className="text-xs text-[#566C6A] block mt-4 font-medium">
                                Saved <strong className="text-[#0D2322] dark:text-foreground">₱1,420.00</strong> this month via round-ups.
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: CARDS & SECURITY & SMART PASS RECHARGE */}
            {/* ======================================================== */}
            {activeTab === "cards" && (
                <div className="flex flex-col gap-8 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Card Visualizer (6 Cols) */}
                        <div className="lg:col-span-6 flex flex-col gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#0D2322] dark:text-foreground">
                                    Pine Slate Visa Platinum Debit
                                </h2>
                                <p className="text-xs text-[#566C6A] dark:text-muted-foreground">
                                    Backed by real-time balance and zero foreign transaction markup.
                                </p>
                            </div>

                            {/* Bespoke Physical/Virtual Card UI */}
                            <div
                                className="w-full h-56 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/10"
                                style={{
                                    background: "linear-gradient(135deg, #0A1C1B 0%, #0D2322 55%, #1B3F3D 100%)",
                                }}
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-extrabold tracking-widest text-white text-base">ApexPay</span>
                                        <span className="px-2 py-0.5 rounded-md bg-[#D97706]/30 text-[#E07A1F] text-[10px] font-mono tracking-wider uppercase font-bold border border-[#D97706]/40">
                                            Platinum
                                        </span>
                                    </div>
                                    <span className="text-xs text-white/80 font-mono">NFC Contactless</span>
                                </div>

                                <div className="relative z-10 my-auto">
                                    {/* EMV Chip */}
                                    <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-200 to-amber-500 opacity-90 mb-3 shadow-inner flex items-center justify-center">
                                        <div className="w-8 h-5 border border-amber-700/50 rounded-xs" />
                                    </div>
                                    <span className="font-mono text-xl tracking-widest text-white font-bold">
                                        •••• •••• •••• 9928
                                    </span>
                                </div>

                                <div className="relative z-10 flex items-center justify-between font-mono text-xs text-gray-300">
                                    <div>
                                        <span className="block text-[8px] uppercase tracking-wider text-gray-400">Cardholder</span>
                                        <span className="font-bold text-white">ELENA VANCE</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] uppercase tracking-wider text-gray-400">Expires</span>
                                        <span className="font-bold text-white">08/29</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] uppercase tracking-wider text-gray-400">CVV</span>
                                        <span className="font-bold text-[#E07A1F] font-mono text-sm">{cvvDisplay}</span>
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
                                    className="flex-1 py-2.5 rounded-xl bg-[#F4F7F6] dark:bg-muted text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-1.5 border border-[#D3DEDB] dark:border-border cursor-pointer"
                                >
                                    <Key className="w-4 h-4 text-[#D97706]" />
                                    <span>
                                        {cvvSecondsLeft > 0 ? `CVV Active (${cvvSecondsLeft}s)` : "Reveal Dynamic CVV (60s)"}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toast.success("Wallet Token Generated", { description: "Digital pass linked to Apple Wallet / Google Wallet." })}
                                    className="flex-1 py-2.5 rounded-xl bg-[#F4F7F6] dark:bg-muted text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-1.5 border border-[#D3DEDB] dark:border-border cursor-pointer"
                                >
                                    <Smartphone className="w-4 h-4 text-[#D97706]" />
                                    <span>Add to Wallet</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Security Toggles (6 Cols) */}
                        <div className="lg:col-span-6 bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-[#D3DEDB] dark:border-border flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-bold text-[#0D2322] dark:text-foreground mb-1">
                                    Card Security Controls
                                </h3>
                                <p className="text-xs text-[#566C6A] dark:text-muted-foreground mb-4">
                                    Instant freeze and selective payment channel restrictions.
                                </p>

                                <div className="flex flex-col gap-3">
                                    {/* Freeze Toggle */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs sm:text-sm text-[#0D2322] dark:text-foreground block">
                                                    Freeze Card
                                                </span>
                                                <span className="text-[11px] text-[#566C6A]">
                                                    Instantly block all new transactions
                                                </span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={cardSettings.isFrozen}
                                            onChange={(e) => {
                                                const frozen = e.target.checked;
                                                setCardSettings({ ...cardSettings, isFrozen: frozen });
                                                if (frozen) {
                                                    toast.error("Card Frozen", { description: "Visa Debit card blocked from processing new transactions." });
                                                } else {
                                                    toast.success("Card Active", { description: "Visa Debit card unblocked and ready for use." });
                                                }
                                            }}
                                            className="accent-[#DC2626] h-5 w-5 cursor-pointer"
                                        />
                                    </div>

                                    {/* Online Payments */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#D97706] flex items-center justify-center">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs sm:text-sm text-[#0D2322] dark:text-foreground block">
                                                    Online E-Commerce
                                                </span>
                                                <span className="text-[11px] text-[#566C6A]">
                                                    Allow web and in-app checkout
                                                </span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={cardSettings.onlinePayments}
                                            onChange={(e) => {
                                                setCardSettings({ ...cardSettings, onlinePayments: e.target.checked });
                                                toast.info("Online checkout settings updated");
                                            }}
                                            className="accent-[#D97706] h-5 w-5 cursor-pointer"
                                        />
                                    </div>

                                    {/* International Usage */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7F6] dark:bg-muted border border-[#D3DEDB] dark:border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#E8F5F1] text-[#059669] flex items-center justify-center">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs sm:text-sm text-[#0D2322] dark:text-foreground block">
                                                    Overseas POS / FX
                                                </span>
                                                <span className="text-[11px] text-[#566C6A]">
                                                    Foreign currency in-store & ATM
                                                </span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={cardSettings.overseasTransactions}
                                            onChange={(e) => {
                                                setCardSettings({ ...cardSettings, overseasTransactions: e.target.checked });
                                                toast.info("Overseas usage settings updated");
                                            }}
                                            className="accent-[#D97706] h-5 w-5 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-2 border-t border-[#D3DEDB] dark:border-border flex items-center justify-between">
                                <span className="text-xs text-[#566C6A]">Daily Spend Limit: ₱100,000</span>
                                <button
                                    type="button"
                                    onClick={() => toast.info("Daily limit adjustment prompt loaded")}
                                    className="text-xs text-[#D97706] font-bold hover:underline cursor-pointer"
                                >
                                    Change Limit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Integrated DESFire EV3 Smart Card Top-up Engine */}
                    <div className="pt-6 border-t border-[#D3DEDB] dark:border-border flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-[#0D2322] dark:text-foreground">
                                    NFC Transit & Campus Pass Direct Top-up
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#059669] text-[10px] font-mono font-bold border border-[#BCE3D6]">
                                    NFC DESFire EV3
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A] dark:text-muted-foreground mt-0.5">
                                Instantly reload contactless physical smart cards and transit balances directly from your ApexPay account.
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
