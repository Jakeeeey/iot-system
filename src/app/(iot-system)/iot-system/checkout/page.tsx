"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    CreditCard,
    Zap,
    ShieldCheck,
    CheckCircle2,
    Lock,
    ArrowRight,
    QrCode,
    RefreshCw,
    Wallet,
    Building2,
    Sparkles,
    Radio
} from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "@/components/shared/app-sidebar/nav-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PRESET_AMOUNTS = [100, 300, 500, 1000];

type PaymentMethod = "maya" | "gcash" | "card" | "bank";

export default function CheckoutPage() {
    const [balance, setBalance] = useState<number>(420.50);
    const [selectedAmount, setSelectedAmount] = useState<number>(500);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("maya");
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardUid] = useState("04:88:29:A3:NFC:VOS");

    const amount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
    const fee = paymentMethod === "card" ? 15.00 : 0.00;
    const total = amount + fee;
    const projectedBalance = balance + amount;

    const handleSelectPreset = (val: number) => {
        setSelectedAmount(val);
        setCustomAmount("");
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomAmount(e.target.value);
    };

    const handleSimulateTopup = () => {
        if (amount <= 0) {
            toast.error("Invalid Amount", { description: "Please select or enter a top-up amount." });
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            setBalance(projectedBalance);
            setIsProcessing(false);
            toast.success("Card Top-up Successful!", {
                description: `Added ₱${amount.toFixed(2)} via ${paymentMethod.toUpperCase()}. New Balance: ₱${projectedBalance.toFixed(2)}`
            });
        }, 1200);
    };

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {/* Topbar */}
            <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b shadow-xs bg-background sm:h-16 overflow-hidden">
                <div className="flex h-full min-w-0 items-center gap-2 px-3 sm:px-4 overflow-hidden">
                    <SidebarTrigger className="-ml-1 shrink-0" />
                    <Separator orientation="vertical" className="hidden sm:block mr-2 data-[orientation=vertical]:h-4 shrink-0" />
                    <div className="min-w-0 overflow-hidden">
                        <Breadcrumb>
                            <BreadcrumbList className="min-w-0 overflow-hidden">
                                <BreadcrumbItem className="hidden md:block shrink-0">
                                    <BreadcrumbLink href="/iot-system">IoT System</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block shrink-0" />
                                <BreadcrumbItem className="min-w-0 overflow-hidden">
                                    <BreadcrumbPage className="truncate max-w-[56vw] sm:max-w-[60vw] md:max-w-none font-bold">
                                        Card Top-up & Checkout
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>

                <div className="flex h-full items-center px-2 sm:px-4 shrink-0 max-w-[48vw] sm:max-w-none overflow-hidden">
                    <NavUser user={{ name: "IoT Engineer", email: "dev@iot.local", avatar: "/avatars/shadcn.jpg" }} />
                </div>
            </header>

            {/* Main Content */}
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto flex flex-col gap-8">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                                Smart Card Top-up & Checkout
                            </h1>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono">
                                NFC DESFire EV3
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Direct cloud clearing payment gateway for transit cards, campus IDs & contactless tap balances.
                        </p>
                    </div>

                    <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
                        {/* Left Column: Card Visualizer & Amount Selector (7 cols) */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            {/* Holographic NFC Smart Card */}
                            <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-[#0d121f] to-slate-950 text-white shadow-xl shadow-cyan-950/20">
                                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute top-0 right-0 p-6 opacity-30">
                                    <Radio className="h-16 w-16 text-cyan-400" />
                                </div>

                                <div className="relative z-10 flex flex-col justify-between h-48">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-9 rounded-md bg-amber-400/90 border border-amber-300 shadow-xs flex items-center justify-center">
                                                <div className="w-5 h-4 border border-amber-600/60 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                                                    <div className="bg-amber-600/40 rounded-xs" />
                                                    <div className="bg-amber-600/40 rounded-xs" />
                                                </div>
                                            </div>
                                            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">VOS SMART PASS</span>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-mono border-cyan-400/30 text-cyan-300 bg-cyan-950/40">
                                            ACTIVE NFC
                                        </Badge>
                                    </div>

                                    <div>
                                        <div className="text-[11px] font-mono text-cyan-200/60 uppercase tracking-widest">Card UID</div>
                                        <div className="font-mono text-sm tracking-wider font-semibold text-slate-200 mt-0.5">
                                            {cardUid}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Current Balance</div>
                                            <div className="text-3xl font-black tracking-tight text-white font-mono">
                                                ₱{balance.toFixed(2)}
                                            </div>
                                        </div>
                                        {amount > 0 && (
                                            <div className="text-right">
                                                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Projected Value</div>
                                                <div className="text-xl font-black text-emerald-400 font-mono">
                                                    &rarr; ₱{projectedBalance.toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Amount Selector Card */}
                            <Card className="border border-border/60 bg-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold">Select Recharge Amount</CardTitle>
                                    <CardDescription className="text-xs">
                                        Choose a quick amount or enter a custom transit top-up value.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {PRESET_AMOUNTS.map((val) => (
                                            <Button
                                                key={val}
                                                type="button"
                                                variant={selectedAmount === val && !customAmount ? "default" : "outline"}
                                                className={`h-12 font-mono font-bold text-sm ${
                                                    selectedAmount === val && !customAmount
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "hover:border-primary/50"
                                                }`}
                                                onClick={() => handleSelectPreset(val)}
                                            >
                                                ₱{val}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="space-y-1.5 pt-1">
                                        <label className="text-xs font-semibold text-muted-foreground">Or Enter Custom Amount (₱)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-muted-foreground text-sm">₱</span>
                                            <Input
                                                type="number"
                                                min="20"
                                                max="10000"
                                                placeholder="Custom value (e.g. 750)"
                                                value={customAmount}
                                                onChange={handleCustomChange}
                                                className="pl-8 font-mono font-semibold"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Channel Selection */}
                            <Card className="border border-border/60 bg-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold">Payment Gateway Channel</CardTitle>
                                    <CardDescription className="text-xs">
                                        Select the merchant rail to settle this transaction.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Maya */}
                                    <div
                                        onClick={() => setPaymentMethod("maya")}
                                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                            paymentMethod === "maya"
                                                ? "border-emerald-500/80 bg-emerald-500/10"
                                                : "border-border hover:border-border/80 hover:bg-muted/40"
                                        }`}
                                    >
                                        <div className="h-9 w-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 font-black text-xs">
                                            M
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-foreground">Maya E-Wallet</div>
                                            <div className="text-[11px] text-muted-foreground">Instant 0% convenience fee</div>
                                        </div>
                                    </div>

                                    {/* GCash */}
                                    <div
                                        onClick={() => setPaymentMethod("gcash")}
                                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                            paymentMethod === "gcash"
                                                ? "border-cyan-500/80 bg-cyan-500/10"
                                                : "border-border hover:border-border/80 hover:bg-muted/40"
                                        }`}
                                    >
                                        <div className="h-9 w-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0 font-black text-xs">
                                            G
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-foreground">GCash QR / Web</div>
                                            <div className="text-[11px] text-muted-foreground">Direct app push verification</div>
                                        </div>
                                    </div>

                                    {/* Credit/Debit Card */}
                                    <div
                                        onClick={() => setPaymentMethod("card")}
                                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                            paymentMethod === "card"
                                                ? "border-indigo-500/80 bg-indigo-500/10"
                                                : "border-border hover:border-border/80 hover:bg-muted/40"
                                        }`}
                                    >
                                        <div className="h-9 w-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shrink-0">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-foreground">Visa / Mastercard</div>
                                            <div className="text-[11px] text-muted-foreground">₱15.00 gateway MDR fee</div>
                                        </div>
                                    </div>

                                    {/* Bank Transfer */}
                                    <div
                                        onClick={() => setPaymentMethod("bank")}
                                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                            paymentMethod === "bank"
                                                ? "border-amber-500/80 bg-amber-500/10"
                                                : "border-border hover:border-border/80 hover:bg-muted/40"
                                        }`}
                                    >
                                        <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-foreground">Direct Bank Transfer</div>
                                            <div className="text-[11px] text-muted-foreground">InstaPay / PESONet</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Order Summary & Action (5 cols) */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <Card className="border border-border/70 bg-card shadow-sm sticky top-20">
                                <CardHeader className="pb-4 border-b border-border/40">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-bold">Transaction Summary</CardTitle>
                                        <Badge variant="outline" className="text-[10px] font-mono uppercase">
                                            NODE #TX-8910
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Review card balance adjustments before confirming.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="py-4 space-y-3 font-mono text-xs">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Target Card:</span>
                                        <span className="text-foreground font-semibold">04:88:29...VOS</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Recharge Principal:</span>
                                        <span className="text-foreground font-bold">₱{amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Channel Gateway Fee:</span>
                                        <span className="text-foreground">₱{fee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>VAT (12% inclusive):</span>
                                        <span className="text-foreground">₱{(amount * 0.12).toFixed(2)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-sm font-sans font-black text-foreground pt-1">
                                        <span>Total Amount Due:</span>
                                        <span className="text-primary font-mono text-lg">₱{total.toFixed(2)}</span>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col gap-3 pt-2">
                                    <Button
                                        onClick={handleSimulateTopup}
                                        disabled={isProcessing || amount <= 0}
                                        className="w-full h-11 text-sm font-bold bg-primary text-primary-foreground shadow-md gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Processing Tap & Clearing...
                                            </>
                                        ) : (
                                            <>
                                                Confirm Top-up (₱{total.toFixed(2)})
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-[11px] space-y-2 text-muted-foreground">
                                        <div className="flex items-center gap-2 font-semibold text-foreground">
                                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                            <span>PCI-DSS Level 1 & VOS Guard</span>
                                        </div>
                                        <p className="text-[10px] leading-relaxed">
                                            Card transactions are tokenized with end-to-end ECDSA signatures. Physical card balance updates via NFC edge antenna within 250ms.
                                        </p>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
