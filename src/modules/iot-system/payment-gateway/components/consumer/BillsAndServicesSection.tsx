"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PaymentIcon } from "../PaymentIcon";
import { PaymentGatewayService } from "../../services/payment-gateway.service";

interface BillsAndServicesSectionProps {
    balance: number;
    onPaymentSuccess?: (amount: number, biller: string) => void;
}

export function BillsAndServicesSection({ balance, onPaymentSuccess }: BillsAndServicesSectionProps) {
    const [subTab, setSubTab] = useState<"bills" | "load" | "gov-prn" | "micro-loan" | "insights">("bills");

    // Utilities State (Sec. F.1)
    const [selectedBiller, setSelectedBiller] = useState("Meralco Electricity");
    const [accountNumber, setAccountNumber] = useState("");
    const [billAmount, setBillAmount] = useState("");

    // Load State (Sec. F.2)
    const [telcoProvider, setTelcoProvider] = useState("Globe Telecom");
    const [mobileNumber, setMobileNumber] = useState("");
    const [loadAmount, setLoadAmount] = useState("100");

    // Gov PRN State (Sec. F.3)
    const [govAgency, setGovAgency] = useState("SSS (Social Security System)");
    const [prnNumber, setPrnNumber] = useState("");
    const [govAmount, setGovAmount] = useState("");

    // Micro-Loan State (Sec. G.1)
    const [loanRequested, setLoanRequested] = useState(false);
    const [loanDrawdown, setLoanDrawdown] = useState("5000");

    // Promo code (Sec. I.1)
    const [promoCode, setPromoCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);

    // E-Receipt state (Sec. F.4)
    const [lastReceipt, setLastReceipt] = useState<{
        receiptId: string;
        txId: string;
        merchant: string;
        amount: number;
        timestamp: string;
        signature: string;
    } | null>(null);

    const handleApplyPromo = (e: React.FormEvent) => {
        e.preventDefault();
        if (promoCode.trim().toUpperCase() === "MAPEPAY50") {
            setAppliedDiscount(50);
            toast.success("Voucher Applied!", { description: "₱50.00 discount applied to current checkout." });
        } else {
            toast.error("Invalid Promo Code", { description: "Code expired or not recognized. Try 'MAPEPAY50'." });
        }
    };

    const handlePayBill = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(billAmount);
        const finalAmt = Math.max(0, amt - appliedDiscount);
        if (isNaN(amt) || finalAmt <= 0 || finalAmt > balance) {
            toast.error("Invalid Amount", { description: "Insufficient balance for bill settlement." });
            return;
        }

        const receipt = PaymentGatewayService.generateCryptographicReceipt(
            `BILL-${Date.now().toString(36).toUpperCase()}`,
            finalAmt,
            selectedBiller
        );
        setLastReceipt(receipt);

        if (onPaymentSuccess) onPaymentSuccess(finalAmt, selectedBiller);
        toast.success("Bill Payment Posted", {
            description: `Settled ₱${finalAmt.toFixed(2)} to ${selectedBiller}. Tamper-evident receipt signed.`,
        });

        setBillAmount("");
        setAccountNumber("");
        setAppliedDiscount(0);
        setPromoCode("");
    };

    const handleBuyLoad = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(loadAmount);
        if (amt > balance) {
            toast.error("Insufficient Balance", { description: "Please top up to purchase load." });
            return;
        }
        if (onPaymentSuccess) onPaymentSuccess(amt, `eLoad: ${telcoProvider}`);
        toast.success("eLoad Top-Up Dispatched", {
            description: `Credited ₱${amt} to ${mobileNumber} via ${telcoProvider} wholesale rail.`,
        });
        setMobileNumber("");
    };

    const handlePayGov = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(govAmount);
        if (isNaN(amt) || amt <= 0 || amt > balance) {
            toast.error("Invalid Amount", { description: "Please enter a valid amount." });
            return;
        }
        if (onPaymentSuccess) onPaymentSuccess(amt, govAgency);
        toast.success("Government Payment Verified", {
            description: `PRN #${prnNumber} posted to ${govAgency} treasury switch.`,
        });
        setPrnNumber("");
        setGovAmount("");
    };

    const handleDrawdownLoan = () => {
        const amt = parseFloat(loanDrawdown);
        setLoanRequested(true);
        if (onPaymentSuccess) onPaymentSuccess(-amt, "Micro-Loan Drawdown Credit");
        toast.success("Micro-Loan Disbursed Instantly", {
            description: `₱${amt.toLocaleString()} credited to your wallet balance based on your 94/100 velocity score.`,
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Sub-Nav Pill Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() => setSubTab("bills")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        subTab === "bills"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="receipt_long" className="w-4 h-4 text-[#D97706]" />
                        Utility Bills (Sec. F.1)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab("load")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        subTab === "load"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="smartphone" className="w-4 h-4 text-[#059669]" />
                        Buy Load / eLoad (Sec. F.2)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab("gov-prn")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        subTab === "gov-prn"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="assured_workload" className="w-4 h-4 text-[#2563EB]" />
                        Government PRN (Sec. F.3)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab("micro-loan")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        subTab === "micro-loan"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="credit_score" className="w-4 h-4 text-[#7C3AED]" />
                        Micro-Loan Credit (Sec. G.1)
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab("insights")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        subTab === "insights"
                            ? "bg-[#0D2322] text-white shadow-xs"
                            : "bg-white text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <PaymentIcon name="insights" className="w-4 h-4 text-[#C2410C]" />
                        Spending Insights (Sec. I.2)
                    </span>
                </button>
            </div>

            {/* TAB 1: UTILITIES BILLS (Sec. F.1, F.4, I.1, I.3) */}
            {subTab === "bills" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-[#0D2322]">Pay Utility Bills</h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#0F5B46] text-[10px] font-mono font-bold border border-[#BCE3D6]">
                                    Sec. F.1 / F.4
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A] mt-0.5">
                                Real-time settlement with cryptographically signed statutory e-receipts.
                            </p>
                        </div>

                        <form onSubmit={handlePayBill} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Select Biller
                                </label>
                                <select
                                    value={selectedBiller}
                                    onChange={(e) => setSelectedBiller(e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-xl bg-[#F4F7F6] text-sm text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                                >
                                    <option value="Meralco Electricity">Meralco (Electricity)</option>
                                    <option value="Maynilad Water Services">Maynilad Water Services</option>
                                    <option value="Manila Water">Manila Water Company</option>
                                    <option value="Converge ICT Solutions">Converge ICT Fiber</option>
                                    <option value="PLDT Home & Enterprise">PLDT Home Enterprise</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    10 or 16-Digit Account Number
                                </label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="e.g. 0192837482"
                                    required
                                    className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-sm font-mono font-bold text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                    Amount to Pay (PHP)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-lg font-bold text-[#566C6A]">₱</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={billAmount}
                                        onChange={(e) => setBillAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="w-full h-11 pl-9 pr-4 rounded-xl bg-[#F4F7F6] text-lg font-bold font-mono text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Promo Code Input (Sec. I.1) */}
                            <div className="p-3 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col gap-2">
                                <label className="text-xs font-bold text-[#0D2322] flex items-center justify-between">
                                    <span>Voucher / Promo Code (Sec. I.1)</span>
                                    <span className="text-[10px] text-[#D97706] font-semibold">Try: MAPEPAY50</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Enter voucher code"
                                        className="flex-1 h-9 px-3 rounded-lg bg-white border border-[#D3DEDB] text-xs font-bold text-[#0D2322] uppercase focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyPromo}
                                        className="px-3 h-9 rounded-lg bg-[#0D2322] text-white text-xs font-bold hover:bg-[#163331] cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {appliedDiscount > 0 && (
                                    <span className="text-xs text-[#059669] font-bold">
                                        ✓ Promo active: -₱{appliedDiscount.toFixed(2)} applied
                                    </span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white font-bold text-sm hover:brightness-105 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <PaymentIcon name="check" className="w-4 h-4" />
                                <span>Post Bill Payment</span>
                            </button>
                        </form>
                    </div>

                    {/* Saved Billers & E-Receipt Details (Sec. I.3, F.4) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        {/* Saved Billers (Sec. I.3) */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB]">
                            <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                                Saved Billers &amp; Favorites (Sec. I.3)
                            </span>
                            <div className="mt-3 flex flex-col gap-2">
                                {[
                                    { name: "Home Electricity", biller: "Meralco", acc: "0192-8841-11", amount: "₱3,420.50" },
                                    { name: "Condo Water", biller: "Maynilad", acc: "8829-1002-34", amount: "₱840.00" },
                                    { name: "Fiber Internet", biller: "Converge", acc: "5501-9921-99", amount: "₱1,500.00" },
                                ].map((fav) => (
                                    <button
                                        key={fav.acc}
                                        type="button"
                                        onClick={() => {
                                            setSelectedBiller(fav.biller);
                                            setAccountNumber(fav.acc);
                                        }}
                                        className="p-3 rounded-xl bg-[#F4F7F6] hover:bg-[#EDF4F2] border border-[#D3DEDB] text-left transition-colors flex items-center justify-between cursor-pointer"
                                    >
                                        <div>
                                            <span className="text-xs font-bold text-[#0D2322] block">{fav.name}</span>
                                            <span className="text-[11px] text-[#566C6A] font-mono">{fav.biller} • {fav.acc}</span>
                                        </div>
                                        <span className="text-xs font-bold font-mono text-[#D97706]">{fav.amount}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* E-Receipt Preview (Sec. F.4) */}
                        {lastReceipt && (
                            <div className="p-4 rounded-xl bg-[#0D2322] text-white flex flex-col gap-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#D97706] font-bold uppercase tracking-wider font-mono text-[10px]">
                                        Signed E-Receipt (Sec. F.4)
                                    </span>
                                    <span className="text-emerald-400 font-bold">Tamper-Evident</span>
                                </div>
                                <span className="font-extrabold text-sm">{lastReceipt.merchant}</span>
                                <div className="flex items-center justify-between text-gray-300 font-mono text-[11px]">
                                    <span>{lastReceipt.receiptId}</span>
                                    <span>₱{lastReceipt.amount.toFixed(2)}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono break-all mt-1">
                                    Sig: {lastReceipt.signature}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: BUY LOAD (Sec. F.2) */}
            {subTab === "load" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] max-w-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#0D2322]">Buy Load &amp; Data Bundles</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#0F5B46] text-[10px] font-mono font-bold border border-[#BCE3D6]">
                            Sec. F.2
                        </span>
                    </div>
                    <p className="text-xs text-[#566C6A] mb-4">
                        Direct telco wholesale reload with 5% instant cashback for prepaid lines.
                    </p>

                    <form onSubmit={handleBuyLoad} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                Network Provider
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {["Globe Telecom", "Smart Communications", "DITO Telecommunity"].map((prov) => (
                                    <button
                                        key={prov}
                                        type="button"
                                        onClick={() => setTelcoProvider(prov)}
                                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                            telcoProvider === prov
                                                ? "bg-[#0D2322] text-white border-[#0D2322]"
                                                : "bg-[#F4F7F6] text-[#0D2322] border-[#D3DEDB]"
                                        }`}
                                    >
                                        {prov.split(" ")[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                Prepaid Mobile Number
                            </label>
                            <input
                                type="text"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                placeholder="09XX-XXX-XXXX"
                                required
                                className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-sm font-medium text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1.5">
                                Select Denomination
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {["50", "100", "300", "500"].map((denom) => (
                                    <button
                                        key={denom}
                                        type="button"
                                        onClick={() => setLoadAmount(denom)}
                                        className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                                            loadAmount === denom
                                                ? "bg-[#D97706] text-white"
                                                : "bg-[#F4F7F6] text-[#0D2322] border border-[#D3DEDB]"
                                        }`}
                                    >
                                        ₱{denom}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="py-3 rounded-xl bg-[#0D2322] text-white font-bold text-sm hover:bg-[#163331] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <PaymentIcon name="bolt" className="w-4 h-4 text-[#D97706]" />
                            <span>Confirm &amp; Reload Instantly</span>
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 3: GOVERNMENT PRN PAYMENTS (Sec. F.3) */}
            {subTab === "gov-prn" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] max-w-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#0D2322]">Government Payment Reference Number (PRN)</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF] text-[10px] font-mono font-bold border border-[#BFDBFE]">
                            Sec. F.3
                        </span>
                    </div>
                    <p className="text-xs text-[#566C6A] mb-4">
                        Pay statutory national contributions, taxes, and permits directly to state treasuries.
                    </p>

                    <form onSubmit={handlePayGov} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                State Agency
                            </label>
                            <select
                                value={govAgency}
                                onChange={(e) => setGovAgency(e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl bg-[#F4F7F6] text-sm text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                            >
                                <option value="SSS (Social Security System)">SSS (Social Security System Contributions)</option>
                                <option value="PhilHealth National Health">PhilHealth (Health Insurance Premium)</option>
                                <option value="Pag-IBIG Fund HDMF">Pag-IBIG Fund / HDMF Housing Loan</option>
                                <option value="BIR Bureau of Internal Revenue">BIR (Income &amp; Withholding Taxes)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                Standard Payment Reference Number (PRN)
                            </label>
                            <input
                                type="text"
                                value={prnNumber}
                                onChange={(e) => setPrnNumber(e.target.value)}
                                placeholder="e.g. SSS-PRN-01928399"
                                required
                                className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-sm font-mono font-bold text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A] block mb-1">
                                PRN Assessment Amount (PHP)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={govAmount}
                                onChange={(e) => setGovAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                className="w-full h-11 px-4 rounded-xl bg-[#F4F7F6] text-lg font-bold font-mono text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="py-3 rounded-xl bg-[#1E3A8A] text-white font-bold text-sm hover:bg-[#1E40AF] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <PaymentIcon name="verified" className="w-4 h-4 text-emerald-300" />
                            <span>Validate PRN &amp; Settle Treasury Leg</span>
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 4: MICRO-LOAN / REVOLVING CREDIT LINE (Sec. G.1) */}
            {subTab === "micro-loan" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-[#0D2322]">Micro-Loan Credit Line</h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#FAF5FF] text-[#6B21A8] text-[10px] font-mono font-bold border border-[#E9D5FF]">
                                    Sec. G.1
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A]">
                                Short-term consumer revolving credit line scored directly by your wallet transaction velocity.
                            </p>

                            <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] my-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#566C6A]">Pre-Approved Credit Limit:</span>
                                    <span className="font-extrabold text-[#0D2322] font-mono text-sm">₱25,000.00</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#566C6A]">Historical Velocity Score:</span>
                                    <span className="font-extrabold text-[#059669] font-mono">94 / 100 (Prime)</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#566C6A]">Monthly Interest:</span>
                                    <span className="font-bold text-[#D97706]">1.49% Flat</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#566C6A]">
                                    Drawdown Amount (PHP)
                                </label>
                                <select
                                    value={loanDrawdown}
                                    onChange={(e) => setLoanDrawdown(e.target.value)}
                                    className="w-full h-11 px-3.5 rounded-xl bg-[#F4F7F6] text-sm font-bold font-mono text-[#0D2322] border border-[#D3DEDB]"
                                >
                                    <option value="2500">₱2,500.00 (1 Month)</option>
                                    <option value="5000">₱5,000.00 (3 Months)</option>
                                    <option value="10000">₱10,000.00 (6 Months)</option>
                                    <option value="25000">₱25,000.00 (Full Limit)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleDrawdownLoan}
                            className="mt-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white font-bold text-sm hover:brightness-105 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <PaymentIcon name="account_balance_wallet" className="w-4 h-4" />
                            <span>Drawdown Instantly to Wallet Balance</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3DEDB] flex flex-col justify-between">
                        <div>
                            <span className="text-xs uppercase tracking-wider font-bold text-[#566C6A]">
                                Repayment Terms &amp; Compliance
                            </span>
                            <h4 className="text-sm font-bold text-[#0D2322] mt-1">
                                Zero Pre-termination Penalty
                            </h4>
                            <p className="text-xs text-[#566C6A] mt-1 leading-relaxed">
                                Automated auto-deduct occurs on the 15th and 30th cutoff dates. Interest is charged on actual daily balances.
                            </p>

                            <div className="p-3.5 rounded-xl bg-[#E8F5F1] border border-[#BCE3D6] my-4 text-xs text-[#0F5B46] space-y-1">
                                <span className="font-bold block">BSP Circular 1133 Certified</span>
                                <p className="text-[11px] leading-relaxed">
                                    No hidden compounding fees. Repayment is scored to boost future transaction limits.
                                </p>
                            </div>
                        </div>

                        <span className="text-[11px] text-[#566C6A]">
                            Status: {loanRequested ? "Disbursed to balance" : "Available on demand"}
                        </span>
                    </div>
                </div>
            )}

            {/* TAB 5: SPENDING INSIGHTS (Sec. I.2) */}
            {subTab === "insights" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-[#D3DEDB] shadow-sm">
                        <span className="text-xs font-bold text-[#566C6A] uppercase tracking-wider">Utilities &amp; Telecom</span>
                        <div className="text-2xl font-extrabold font-mono text-[#0D2322] mt-1">₱5,760.00</div>
                        <div className="w-full h-2 rounded-full bg-[#EDF2F1] mt-3 overflow-hidden">
                            <div className="h-full bg-[#D97706] rounded-full w-[45%]" />
                        </div>
                        <span className="text-[11px] text-[#566C6A] mt-1 block">45% of monthly spend</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#D3DEDB] shadow-sm">
                        <span className="text-xs font-bold text-[#566C6A] uppercase tracking-wider">Transit &amp; Contactless NFC</span>
                        <div className="text-2xl font-extrabold font-mono text-[#0D2322] mt-1">₱1,840.00</div>
                        <div className="w-full h-2 rounded-full bg-[#EDF2F1] mt-3 overflow-hidden">
                            <div className="h-full bg-[#059669] rounded-full w-[25%]" />
                        </div>
                        <span className="text-[11px] text-[#566C6A] mt-1 block">25% of monthly spend</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#D3DEDB] shadow-sm">
                        <span className="text-xs font-bold text-[#566C6A] uppercase tracking-wider">Merchant QR Purchases</span>
                        <div className="text-2xl font-extrabold font-mono text-[#0D2322] mt-1">₱3,200.00</div>
                        <div className="w-full h-2 rounded-full bg-[#EDF2F1] mt-3 overflow-hidden">
                            <div className="h-full bg-[#2563EB] rounded-full w-[30%]" />
                        </div>
                        <span className="text-[11px] text-[#566C6A] mt-1 block">30% of monthly spend</span>
                    </div>
                </div>
            )}
        </div>
    );
}
