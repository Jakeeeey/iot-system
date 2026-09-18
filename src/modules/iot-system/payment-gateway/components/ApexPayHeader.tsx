"use client";

import React from "react";
import {
    Wallet,
    Building2,
    ShieldCheck,
    Bell,
    CheckCircle2,
    User,
    Layers,
} from "lucide-react";
import { PaymentPortalType, EnvironmentMode } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ApexPayHeaderProps {
    activePortal: PaymentPortalType;
    onSelectPortal: (portal: PaymentPortalType) => void;
    mode: EnvironmentMode;
    onToggleMode: (mode: EnvironmentMode) => void;
}

export function ApexPayHeader({
    activePortal,
    onSelectPortal,
    mode,
    onToggleMode,
}: ApexPayHeaderProps) {
    const isConsumer = activePortal === "consumer-wallet";
    const userName = isConsumer ? "Elena Vance" : "Julian Vance";
    const userRole = isConsumer ? "Premier Verified User" : "VP of Treasury Operations";

    return (
        <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-[#D3DEDB] dark:border-border shadow-xs transition-colors">
            <div className="w-full px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
                {/* Brand & System Status */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-[#0D2322] flex items-center justify-center text-[#D97706] shadow-md border border-[#163331]">
                            <Layers className="w-5 h-5 text-[#D97706]" />
                        </div>
                        <div className="flex items-baseline font-black tracking-tight text-xl sm:text-2xl text-[#0D2322] dark:text-foreground">
                            <span>Apex</span>
                            <span className="text-[#D97706]">Pay</span>
                        </div>
                    </div>

                    <div className="h-5 w-px bg-[#D3DEDB] dark:bg-border hidden md:block" />

                    <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F1] dark:bg-emerald-950/40 border border-[#BCE3D6] dark:border-emerald-800/40 shrink-0">
                        <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse" />
                        <span className="text-[11px] font-bold text-[#059669] dark:text-emerald-400">
                            99.99% Core Rails Operational
                        </span>
                    </div>
                </div>

                {/* Portal Switcher Navigation Tabs */}
                <nav className="flex items-center p-1 bg-[#EDF4F2] dark:bg-muted rounded-xl border border-[#D3DEDB] dark:border-border order-3 xl:order-2 w-full xl:w-auto overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => onSelectPortal("consumer-wallet")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            activePortal === "consumer-wallet"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-sm font-extrabold"
                                : "text-[#566C6A] dark:text-muted-foreground hover:text-[#0D2322] dark:hover:text-foreground"
                        }`}
                    >
                        <Wallet className="w-4 h-4" />
                        <span>Consumer Wallet</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectPortal("merchant-portal")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            activePortal === "merchant-portal"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-sm font-extrabold"
                                : "text-[#566C6A] dark:text-muted-foreground hover:text-[#0D2322] dark:hover:text-foreground"
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Merchant Portal</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectPortal("ops-console")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            activePortal === "ops-console"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-sm font-extrabold"
                                : "text-[#566C6A] dark:text-muted-foreground hover:text-[#0D2322] dark:hover:text-foreground"
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Ops & Admin Console</span>
                    </button>
                </nav>

                {/* Environment Mode, Notifications & Profile */}
                <div className="flex items-center gap-3 order-2 xl:order-3 ml-auto xl:ml-0">
                    {/* Live / Sandbox Switch */}
                    <div className="flex items-center bg-[#EDF4F2] dark:bg-muted border border-[#D3DEDB] dark:border-border rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={() => onToggleMode("LIVE")}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                                mode === "LIVE"
                                    ? "bg-[#0D2322] text-white shadow-xs"
                                    : "text-[#566C6A] dark:text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            LIVE
                        </button>
                        <button
                            type="button"
                            onClick={() => onToggleMode("SANDBOX")}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                                mode === "SANDBOX"
                                    ? "bg-[#D97706] text-white shadow-xs"
                                    : "text-[#566C6A] dark:text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            SANDBOX
                        </button>
                    </div>

                    {/* Notification Bell */}
                    <button
                        type="button"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-[#566C6A] hover:bg-[#E7F0EF] dark:hover:bg-muted transition-colors relative border border-[#D3DEDB] dark:border-border"
                        title="System Notifications"
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white dark:ring-card" />
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-2 pl-2 border-l border-[#D3DEDB] dark:border-border">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs font-bold text-[#0D2322] dark:text-foreground">
                                {userName}
                            </span>
                            <span className="text-[10px] text-[#566C6A] dark:text-muted-foreground">
                                {userRole}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0D2322] to-[#163331] text-[#D97706] flex items-center justify-center font-bold text-xs shadow-xs border border-[#163331]">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
