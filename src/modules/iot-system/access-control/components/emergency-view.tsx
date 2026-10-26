"use client";

import React, { useState } from "react";
import { useAccessControl } from "../context/access-context";
import { AlertTriangle, Lock, Unlock, ShieldCheck, CheckCircle2, AlertOctagon } from "lucide-react";

export function EmergencyView() {
    const { emergencyState, auth, triggerLockdown, triggerOpenAll, restoreNormal } = useAccessControl();
    const [actionPending, setActionPending] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAction = async (action: "lockdown" | "open_all" | "restore") => {
        if (!auth.canWrite) {
            alert("Elevated operator authentication required for emergency overrides.");
            return;
        }

        const confirmMsg =
            action === "lockdown"
                ? "CONFIRM FULL FACILITY LOCKDOWN:\nAll doors will be immediately locked and normal badges suspended."
                : action === "open_all"
                ? "CONFIRM EMERGENCY OPEN ALL:\nAll doors will immediately unlock for evacuation."
                : "Restore all doors to normal scheduled access control operation?";

        if (!confirm(confirmMsg)) return;

        setActionPending(action);
        let ok = false;
        if (action === "lockdown") ok = await triggerLockdown("Facility emergency override");
        else if (action === "open_all") ok = await triggerOpenAll("Emergency evacuation order");
        else ok = await restoreNormal("Restored by operator");

        setActionPending(null);
        if (ok) {
            setMessage(`Emergency state updated to ${action.toUpperCase().replace("_", " ")}`);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-lg font-bold tracking-tight text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Facility Emergency Overrides</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                    High-level emergency controls broadcast immediately to all connected hardware controllers.
                </p>
            </div>

            {message && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            <div className="p-4 rounded-xl border bg-card flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Current Operating Status</span>
                    <div className="flex items-center gap-2">
                        <span
                            className={`w-3 h-3 rounded-full ${
                                emergencyState === "LOCKDOWN"
                                    ? "bg-red-500 animate-ping"
                                    : emergencyState === "OPEN_ALL"
                                    ? "bg-emerald-500 animate-ping"
                                    : "bg-blue-500"
                            }`}
                        />
                        <h3 className="text-base font-bold tracking-tight">
                            {emergencyState === "LOCKDOWN"
                                ? "🔴 ACTIVE LOCKDOWN"
                                : emergencyState === "OPEN_ALL"
                                ? "🟢 ACTIVE EVACUATION (OPEN ALL)"
                                : "⚪ NORMAL OPERATION"}
                        </h3>
                    </div>
                </div>

                <button
                    onClick={() => handleAction("restore")}
                    disabled={emergencyState === "NORMAL" || Boolean(actionPending) || !auth.canWrite}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-muted disabled:opacity-50 transition-colors"
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Restore Normal Operation</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-red-500/30 p-5 bg-red-500/5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Lock className="w-5 h-5" />
                            <h4 className="text-sm font-bold">Full Facility Lockdown</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Immediately locks all controller-managed doors shut. Normal cardholder badges and keypad entries are strictly suspended until restored.
                        </p>
                    </div>

                    <button
                        onClick={() => handleAction("lockdown")}
                        disabled={emergencyState === "LOCKDOWN" || Boolean(actionPending) || !auth.canWrite}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        <AlertOctagon className="w-4 h-4" />
                        <span>{actionPending === "lockdown" ? "Executing Lockdown..." : "INITIATE LOCKDOWN"}</span>
                    </button>
                </div>

                <div className="rounded-xl border border-emerald-500/30 p-5 bg-emerald-500/5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Unlock className="w-5 h-5" />
                            <h4 className="text-sm font-bold">Emergency Evacuation (Open All)</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Immediately unlocks all doors and holds them open continuously to facilitate fast building evacuation in fire or safety emergencies.
                        </p>
                    </div>

                    <button
                        onClick={() => handleAction("open_all")}
                        disabled={emergencyState === "OPEN_ALL" || Boolean(actionPending) || !auth.canWrite}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        <Unlock className="w-4 h-4" />
                        <span>{actionPending === "open_all" ? "Opening Doors..." : "OPEN ALL DOORS"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}