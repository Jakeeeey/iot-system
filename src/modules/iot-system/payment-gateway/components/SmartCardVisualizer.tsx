"use client";

import React from "react";
import { SmartCardInfo } from "../types";

interface SmartCardVisualizerProps {
    card: SmartCardInfo;
    amount: number;
    projectedBalance: number;
}

export function SmartCardVisualizer({ card, amount, projectedBalance }: SmartCardVisualizerProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-[#163331] bg-gradient-to-br from-[#0A1C1B] via-[#0D2322] to-[#163331] text-white shadow-xl shadow-[#0A1C1B]/30">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 p-6 opacity-20">
                <span className="material-symbols-outlined text-[72px] text-white">contactless</span>
            </div>

            <div className="relative z-10 flex flex-col justify-between h-48">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-9 rounded-md bg-[#F59E0B] border border-[#FDE68A] shadow-xs flex items-center justify-center">
                            <div className="w-5 h-4 border border-[#B45309]/60 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                                <div className="bg-[#B45309]/40 rounded-xs" />
                                <div className="bg-[#B45309]/40 rounded-xs" />
                            </div>
                        </div>
                        <span className="text-xs font-black tracking-widest text-[#FED7AA] uppercase">
                            {card.cardType}
                        </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#059669]/40 text-[#6EE7B7] bg-[#059669]/20 font-bold">
                        {card.status} NFC
                    </span>
                </div>

                <div>
                    <div className="text-[11px] font-mono text-gray-300 uppercase tracking-widest">Card UID</div>
                    <div className="font-mono text-sm tracking-wider font-semibold text-white mt-0.5">
                        {card.cardUid}
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Current Balance</div>
                        <div className="text-3xl font-black tracking-tight text-white font-mono">
                            ₱{card.balance.toFixed(2)}
                        </div>
                    </div>
                    {amount > 0 && (
                        <div className="text-right">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-[#6EE7B7]">Projected Balance</div>
                            <div className="text-xl font-black text-[#6EE7B7] font-mono">
                                &rarr; ₱{projectedBalance.toFixed(2)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
