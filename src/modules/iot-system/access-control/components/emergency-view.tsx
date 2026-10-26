"use client";

import React, { useState } from "react";
import { useAccessControl } from "../context/access-context";
import {
    AlertTriangle,
    Lock,
    Unlock,
    ShieldCheck,
    CheckCircle2,
    ShieldAlert,
    KeyRound,
    Flame,
    Radio,
    Clock,
} from "lucide-react";

export function EmergencyView() {
    const { emergencyState, auth, triggerLockdown, triggerOpenAll, restoreNormal } = useAccessControl();

    // Modal state
    const [actionType, setActionType] = useState<"lockdown" | "open_all" | "restore" | null>(null);
    const [confirmKeyword, setConfirmKeyword] = useState("");
    const [reason, setReason] = useState("");
    const [superToken, setSuperToken] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const requiredKeyword =
        actionType === "lockdown" ? "LOCKDOWN" : actionType === "open_all" ? "UNLOCK" : "RESTORE";

    const handleOpenConfirm = (type: "lockdown" | "open_all" | "restore") => {
        setActionType(type);
        setConfirmKeyword("");
        setReason(
            type === "lockdown"
                ? "Facility Threat Lockdown"
                : type === "open_all"
                ? "Emergency Fire/Evacuation Order"
                : "Normal operation resumed"
        );
        setSuperToken("");
    };

    const handleExecuteEmergency = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmKeyword !== requiredKeyword) return;
        setIsExecuting(true);

        let ok = false;
        if (actionType === "lockdown") {
            ok = await triggerLockdown(reason, confirmKeyword);
        } else if (actionType === "open_all") {
            ok = await triggerOpenAll(reason, confirmKeyword);
        } else if (actionType === "restore") {
            ok = await restoreNormal(reason, confirmKeyword);
        }

        setIsExecuting(false);
        if (ok) {
            setMessage(`Emergency state updated to ${actionType?.toUpperCase().replace("_", " ")}.`);
            setActionType(null);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header info */}
            <div>
                <h2 className="text-lg font-bold tracking-tight text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Facility Emergency Overrides</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                    High-priority UDP emergency broadcasts dispatched to all connected hardware controllers.
                </p>
            </div>

            {/* Notification alert */}
            {message && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {/* Current State Banner */}
            <div
                className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-xs ${
                    emergencyState === "NORMAL"
                        ? "bg-card border-border"
                        : emergencyState === "LOCKDOWN"
                        ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                }`}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`p-3 rounded-xl font-bold ${
                            emergencyState === "NORMAL"
                                ? "bg-muted text-foreground"
                                : emergencyState === "LOCKDOWN"
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-emerald-500 text-white animate-pulse"
                        }`}
                    >
                        {emergencyState === "LOCKDOWN" ? (
                            <Lock className="w-6 h-6" />
                        ) : emergencyState === "OPEN_ALL" ? (
                            <Unlock className="w-6 h-6" />
                        ) : (
                            <ShieldCheck className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                Current Facility State:
                            </span>
                            <span className="font-bold text-sm uppercase">{emergencyState}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {emergencyState === "NORMAL"
                                ? "Normal scheduled card badge and keypad access is active."
                                : emergencyState === "LOCKDOWN"
                                ? "ALL DOORS LOCKED DOWN — Badge authorizations temporarily suspended."
                                : "ALL DOORS UNLOCKED — Strikes energized for free facility evacuation."}
                        </p>
                    </div>
                </div>

                {emergencyState !== "NORMAL" && (
                    <button
                        onClick={() => handleOpenConfirm("restore")}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
                    >
                        Restore Normal State
                    </button>
                )}
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Facility Lockdown */}
                <div className="p-5 rounded-2xl border bg-card hover:border-red-500/40 transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Facility Lockdown</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Immediately sets all doors to Normally Closed, suspending cardholder badge verification and locking electric strikes.
                        </p>
                    </div>

                    <button
                        onClick={() => handleOpenConfirm("lockdown")}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Trigger Lockdown</span>
                    </button>
                </div>

                {/* 2. Emergency Evacuate */}
                <div className="p-5 rounded-2xl border bg-card hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <Unlock className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Emergency Evacuation</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Releases all maglocks and electronic door strikes to Normally Open mode for emergency fire exit or evacuation.
                        </p>
                    </div>

                    <button
                        onClick={() => handleOpenConfirm("open_all")}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                        <Flame className="w-4 h-4" />
                        <span>Evacuate / Open All</span>
                    </button>
                </div>

                {/* 3. Restore Normal */}
                <div className="p-5 rounded-2xl border bg-card hover:border-primary/40 transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Restore Normal Mode</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Clears overrides and returns all connected panels to standard scheduled card badge and reader privileges.
                        </p>
                    </div>

                    <button
                        onClick={() => handleOpenConfirm("restore")}
                        className="w-full py-2.5 px-4 rounded-xl border hover:bg-muted text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Restore Normal</span>
                    </button>
                </div>
            </div>

            {/* Safety Confirmation Modal */}
            {actionType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2.5 rounded-xl ${
                                    actionType === "lockdown"
                                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                        : actionType === "open_all"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-primary/10 text-primary"
                                }`}
                            >
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold">
                                    Confirm Emergency {actionType.toUpperCase().replace("_", " ")}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    High-security authorization checkpoint.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleExecuteEmergency} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">
                                    Emergency Reason / Log Note
                                </label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter operator notes..."
                                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">
                                    Type <b className="text-destructive font-mono">{requiredKeyword}</b> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={confirmKeyword}
                                    onChange={(e) => setConfirmKeyword(e.target.value)}
                                    placeholder={`Type "${requiredKeyword}"`}
                                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background font-mono"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => setActionType(null)}
                                    className="px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={confirmKeyword !== requiredKeyword || isExecuting}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-xs disabled:opacity-40 ${
                                        actionType === "lockdown"
                                            ? "bg-red-600 text-white hover:bg-red-700"
                                            : actionType === "open_all"
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    }`}
                                >
                                    {isExecuting ? "Broadcasting UDP..." : `Confirm ${actionType.toUpperCase().replace("_", " ")}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}