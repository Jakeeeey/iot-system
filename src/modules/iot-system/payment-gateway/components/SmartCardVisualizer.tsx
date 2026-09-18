"use client";

import React from "react";
import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SmartCardInfo } from "../types";

interface SmartCardVisualizerProps {
    card: SmartCardInfo;
    amount: number;
    projectedBalance: number;
}

export function SmartCardVisualizer({ card, amount, projectedBalance }: SmartCardVisualizerProps) {
    return (
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
                        <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                            {card.cardType}
                        </span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono border-cyan-400/30 text-cyan-300 bg-cyan-950/40">
                        {card.status} NFC
                    </Badge>
                </div>

                <div>
                    <div className="text-[11px] font-mono text-cyan-200/60 uppercase tracking-widest">Card UID</div>
                    <div className="font-mono text-sm tracking-wider font-semibold text-slate-200 mt-0.5">
                        {card.cardUid}
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Current Balance</div>
                        <div className="text-3xl font-black tracking-tight text-white font-mono">
                            ₱{card.balance.toFixed(2)}
                        </div>
                    </div>
                    {amount > 0 && (
                        <div className="text-right">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Projected Balance</div>
                            <div className="text-xl font-black text-emerald-400 font-mono">
                                &rarr; ₱{projectedBalance.toFixed(2)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
