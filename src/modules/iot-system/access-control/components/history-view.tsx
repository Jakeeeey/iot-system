"use client";

import React, { useState } from "react";
import { useAccessControl } from "../context/access-context";
import { CheckCircle2, XCircle, Search } from "lucide-react";

export function HistoryView() {
    const { recentEvents } = useAccessControl();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "granted" | "denied">("all");

    const filtered = recentEvents.filter((ev) => {
        const matchesSearch =
            !searchTerm ||
            String(ev.cardNumber || "").includes(searchTerm) ||
            String(ev.cardHolderName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(ev.serialNumber || "").includes(searchTerm);

        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "granted" && ev.granted) ||
            (filterStatus === "denied" && !ev.granted);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold tracking-tight">Event Logs & Audit History</h2>
                    <p className="text-xs text-muted-foreground">
                        Live swipe feed, access granted/denied audit records from hardware controllers.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter card or name..."
                            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border bg-background w-48 sm:w-60"
                        />
                    </div>

                    <div className="flex items-center rounded-lg border p-0.5 bg-muted/40 text-xs">
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                                filterStatus === "all" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus("granted")}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                                filterStatus === "granted" ? "bg-background shadow-xs font-semibold text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                            }`}
                        >
                            Granted
                        </button>
                        <button
                            onClick={() => setFilterStatus("denied")}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                                filterStatus === "denied" ? "bg-background shadow-xs font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground"
                            }`}
                        >
                            Denied
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                            <tr>
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">Access Status</th>
                                <th className="px-4 py-3">Card Number</th>
                                <th className="px-4 py-3">Cardholder</th>
                                <th className="px-4 py-3">Location / Door</th>
                                <th className="px-4 py-3">Controller SN</th>
                                <th className="px-4 py-3 text-right">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border font-mono text-[11px]">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-muted-foreground font-sans text-xs">
                                        No swipe events match the current filter.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((ev, idx) => (
                                    <tr key={`${ev.id || idx}-${ev.timestamp}`} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(ev.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 font-sans">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                    ev.granted
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                                }`}
                                            >
                                                {ev.granted ? (
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 text-red-500" />
                                                )}
                                                <span>{ev.granted ? "GRANTED" : "DENIED"}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-foreground">
                                            {ev.cardNumber || "—"}
                                        </td>
                                        <td className="px-4 py-3 font-sans font-medium text-foreground">
                                            {ev.cardHolderName || "Unregistered Visitor"}
                                        </td>
                                        <td className="px-4 py-3 font-sans">
                                            Door {ev.doorNumber || 1}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            SN:{ev.serialNumber}
                                        </td>
                                        <td className="px-4 py-3 text-right font-sans text-muted-foreground">
                                            {ev.reason || (ev.granted ? "Normal Badge" : "Unauthorized")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
