"use client";

import React from "react";
import { PaymentPortalType, EnvironmentMode } from "../types";
import { PaymentIcon } from "./PaymentIcon";

export interface MapEPayHeaderProps {
    activePortal: PaymentPortalType;
    onSelectPortal: (portal: PaymentPortalType) => void;
    mode: EnvironmentMode;
    onToggleMode: (mode: EnvironmentMode) => void;
}

export function MapEPayHeader({
    activePortal,
    onSelectPortal,
    mode,
    onToggleMode,
}: MapEPayHeaderProps) {
    const isConsumer = activePortal === "consumer-wallet";
    const userName = isConsumer ? "IoT Account Holder" : "System Operator";
    const userRole = isConsumer ? "Active Gateway Session" : "IoT Gateway Operations";

    return (
        <header className="sticky top-0 z-30 w-full h-16 bg-white/95 backdrop-blur-md border-b border-[#D3DEDB] shadow-[0_2px_12px_rgba(13,35,34,0.04)]">
            <div className="w-full h-full px-4 sm:px-6 flex items-center justify-between gap-4">
                {/* Brand & 99.99% Operational Rails Status */}
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-[#0D2322] flex items-center justify-center text-[#D97706] shadow-[0_4px_12px_rgba(13,35,34,0.2)] border border-[#163331]">
                            <PaymentIcon name="payments" className="w-5 h-5 text-[#D97706]" />
                        </div>
                        <span className="text-xl sm:text-2xl text-[#0D2322] font-extrabold tracking-tight">
                            Map-<span className="text-[#E07A1F]">ePay</span>
                        </span>
                    </div>

                    <div className="h-5 w-px bg-[#D3DEDB] hidden lg:block" />

                    <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F1] border border-[#BCE3D6] shrink-0">
                        <span className="h-2 w-2 rounded-full bg-[#059669] inline-block animate-pulse" />
                        <span className="text-xs font-bold text-[#0F5B46]">
                            99.99% Core Rails Operational
                        </span>
                    </div>
                </div>

                {/* Portal Switcher Nav Tabs */}
                <nav className="flex items-center gap-1 p-1 bg-[#EDF2F1] rounded-xl border border-[#D3DEDB] overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => onSelectPortal("consumer-wallet")}
                        className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            activePortal === "consumer-wallet"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-[0_2px_8px_rgba(217,119,6,0.28)]"
                                : "text-[#566C6A] hover:text-[#0D2322] hover:bg-white/60"
                        }`}
                    >
                        Consumer Wallet
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectPortal("merchant-portal")}
                        className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            activePortal === "merchant-portal"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-[0_2px_8px_rgba(217,119,6,0.28)]"
                                : "text-[#566C6A] hover:text-[#0D2322] hover:bg-white/60"
                        }`}
                    >
                        Merchant Portal
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectPortal("ops-console")}
                        className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            activePortal === "ops-console"
                                ? "bg-gradient-to-r from-[#D97706] to-[#E07A1F] text-white shadow-[0_2px_8px_rgba(217,119,6,0.28)]"
                                : "text-[#566C6A] hover:text-[#0D2322] hover:bg-white/60"
                        }`}
                    >
                        Ops & Admin Console
                    </button>
                </nav>

                {/* Right controls: LIVE/SANDBOX, notifications, user badge */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center bg-[#EDF2F1] rounded-lg p-0.5 border border-[#D3DEDB]">
                        <button
                            type="button"
                            onClick={() => onToggleMode("LIVE")}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                mode === "LIVE"
                                    ? "bg-[#0D2322] text-white shadow-xs"
                                    : "text-[#566C6A] hover:text-[#0D2322]"
                            }`}
                        >
                            LIVE
                        </button>
                        <button
                            type="button"
                            onClick={() => onToggleMode("SANDBOX")}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                mode === "SANDBOX"
                                    ? "bg-[#D97706] text-white shadow-xs"
                                    : "text-[#566C6A] hover:text-[#0D2322]"
                            }`}
                        >
                            SANDBOX
                        </button>
                    </div>

                    <button
                        type="button"
                        className="h-9 w-9 rounded-xl flex items-center justify-center text-[#566C6A] hover:bg-[#EDF2F1] hover:text-[#0D2322] transition-colors relative border border-[#D3DEDB] bg-white cursor-pointer"
                        title="Notifications"
                    >
                        <PaymentIcon name="notifications_active" className="w-4 h-4 text-[#566C6A]" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
                    </button>

                    <div className="flex items-center gap-2.5 pl-3 border-l border-[#D3DEDB]">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs font-bold text-[#0D2322]">{userName}</span>
                            <span className="text-[11px] text-[#566C6A]">{userRole}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0D2322] to-[#163331] border border-[#3B4F4E]/30 flex items-center justify-center text-[#E07A1F] font-bold shadow-xs">
                            <PaymentIcon name="person" className="w-4 h-4 text-[#E07A1F]" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

// Backward-compatible aliases
export const ApexPayHeader = MapEPayHeader;
export type ApexPayHeaderProps = MapEPayHeaderProps;
