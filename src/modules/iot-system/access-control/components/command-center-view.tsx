"use client";

import React, { useState } from "react";
import { useAccessControl } from "../context/access-context";
import {
    Activity,
    ShieldCheck,
    ShieldAlert,
    DoorClosed,
    Users,
    Zap,
    Lock,
    Unlock,
    Flame,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    BarChart3,
    ArrowUpRight,
    Search,
    Shield,
} from "lucide-react";

export function CommandCenterView() {
    const {
        controllers,
        doors,
        recentEvents,
        emergencyState,
        auth,
        analyticsKPIs,
        hourlyVelocity,
        topDoorsRank,
        topUsersRank,
        pulseDoor,
        triggerLockdown,
        triggerOpenAll,
        restoreNormal,
    } = useAccessControl();

    const [decisionFilter, setDecisionFilter] = useState<"all" | "granted" | "denied" | "alarm">("all");
    const [selectedDoorId, setSelectedDoorId] = useState<string>(doors[0]?.id || "");
    const [isPulsing, setIsPulsing] = useState(false);
    const [pulseFeedback, setPulseFeedback] = useState<string | null>(null);

    // Selected door for quick pulse deck
    const currentDoor = doors.find((d) => d.id === selectedDoorId) || doors[0];

    const handleQuickPulse = async () => {
        if (!currentDoor) return;
        if (!auth.canWrite) {
            alert("Operator login required to pulse doors.");
            return;
        }
        setIsPulsing(true);
        const ok = await pulseDoor(currentDoor.serialNumber, currentDoor.doorNumber);
        setIsPulsing(false);
        if (ok) {
            setPulseFeedback(`Door "${currentDoor.name}" unlocked for ${currentDoor.delaySeconds || 5}s.`);
            setTimeout(() => setPulseFeedback(null), 4000);
        }
    };

    // Filtered recent events for the ribbon
    const filteredEvents = recentEvents.filter((ev) => {
        if (decisionFilter === "granted") return ev.granted;
        if (decisionFilter === "denied") return !ev.granted;
        if (decisionFilter === "alarm") return ev.type === "SECURITY" || ev.unknownCard;
        return true;
    });

    const maxHourlyTotal = Math.max(...hourlyVelocity.map((h) => h.total), 1);

    return (
        <div className="space-y-6">
            {/* Top Toolbar & Filter Deck */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">Filter Decision:</span>
                    <button
                        onClick={() => setDecisionFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            decisionFilter === "all"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        All Events
                    </button>
                    <button
                        onClick={() => setDecisionFilter("granted")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            decisionFilter === "granted"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        Granted ({analyticsKPIs.grantedCount})
                    </button>
                    <button
                        onClick={() => setDecisionFilter("denied")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            decisionFilter === "denied"
                                ? "bg-red-600 text-white shadow-xs"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        Denied ({analyticsKPIs.deniedCount})
                    </button>
                    <button
                        onClick={() => setDecisionFilter("alarm")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            decisionFilter === "alarm"
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        Threat / Unknowns ({analyticsKPIs.alertCount})
                    </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Activity className="w-4 h-4 text-primary animate-pulse" />
                    <span>Real-Time Flow Telemetry Active</span>
                </div>
            </div>

            {/* Executive KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-xl border bg-card shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                        <span className="font-medium">Total Access Events</span>
                        <BarChart3 className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                        {analyticsKPIs.totalEvents}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="text-emerald-500 font-semibold">Active buffer</span>
                        <span>• 24h cycle</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                        <span className="font-medium">Access Granted Rate</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                        {analyticsKPIs.passRate}%
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        {analyticsKPIs.grantedCount} verified authorizations
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                        <span className="font-medium">Access Denials</span>
                        <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                        {analyticsKPIs.deniedCount}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        Unregistered cards & privileges
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                        <span className="font-medium">Security Anomaly Alerts</span>
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                        {analyticsKPIs.alertCount}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        Unknown badges / Force alerts
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                        <span className="font-medium">Flow Velocity Rate</span>
                        <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-primary">
                        ~{analyticsKPIs.flowVelocityPerHour} <span className="text-xs font-normal text-muted-foreground">swipes/hr</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        Facility transit velocity
                    </div>
                </div>
            </div>

            {/* 24-Hour Velocity Curve & Decision Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 24-Hour Velocity Bar Chart */}
                <div className="lg:col-span-2 p-5 rounded-2xl border bg-card shadow-xs space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                <span>24-Hour Access Flow Velocity Curve</span>
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Hourly badge transit density (Granted vs Denied distribution).
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                                <span>Granted</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-xs bg-red-500" />
                                <span>Denied</span>
                            </span>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-48 flex items-end gap-1.5 pt-6 pb-2 border-b border-border/70 overflow-x-auto scrollbar-none">
                        {hourlyVelocity.map((bucket) => {
                            const totalHeightPercent = Math.max(8, Math.round((bucket.total / maxHourlyTotal) * 100));
                            const grantedHeightPercent = bucket.total > 0 ? (bucket.granted / bucket.total) * 100 : 100;
                            return (
                                <div
                                    key={bucket.hour}
                                    className="flex-1 min-w-[20px] flex flex-col items-center h-full justify-end group relative cursor-pointer"
                                    title={`${bucket.label} - Total: ${bucket.total} (Granted: ${bucket.granted}, Denied: ${bucket.denied})`}
                                >
                                    {/* Hover Tooltip */}
                                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] py-1 px-2 rounded-md shadow-md border whitespace-nowrap pointer-events-none z-10">
                                        <b>{bucket.label}</b>: {bucket.granted} ok / {bucket.denied} denied
                                    </div>

                                    {/* Bar stack */}
                                    <div
                                        className="w-full rounded-t-xs flex flex-col justify-end overflow-hidden transition-all group-hover:brightness-110"
                                        style={{ height: `${totalHeightPercent}%` }}
                                    >
                                        <div
                                            className="w-full bg-red-500"
                                            style={{ height: `${100 - grantedHeightPercent}%` }}
                                        />
                                        <div
                                            className="w-full bg-emerald-500"
                                            style={{ height: `${grantedHeightPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-muted-foreground font-mono mt-1">
                                        {bucket.hour % 3 === 0 ? bucket.hour : ""}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Decision Breakdown & Security Posture */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4">
                    <div>
                        <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                            <Shield className="w-4 h-4 text-cyan-500" />
                            <span>Security Decision Matrix</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Classification of all hardware access evaluations.
                        </p>
                    </div>

                    <div className="space-y-3.5 pt-2">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Valid Badge Granted</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {analyticsKPIs.grantedCount} ({analyticsKPIs.passRate}%)
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${analyticsKPIs.passRate}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Access Denials</span>
                                <span className="font-semibold text-red-600 dark:text-red-400">
                                    {analyticsKPIs.deniedCount} ({100 - analyticsKPIs.passRate}%)
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${Math.min(100, 100 - analyticsKPIs.passRate)}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Threat Anomaly Ratio</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                    {analyticsKPIs.alertCount} events
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 rounded-full"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            Math.round((analyticsKPIs.alertCount / Math.max(1, analyticsKPIs.totalEvents)) * 100)
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t text-xs">
                        <div className="p-3 rounded-xl bg-muted/50 border flex items-center justify-between">
                            <span className="text-muted-foreground">Current Facility Posture:</span>
                            <span
                                className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] ${
                                    emergencyState === "NORMAL"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                        : emergencyState === "LOCKDOWN"
                                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                }`}
                            >
                                {emergencyState}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Door Throughput + Quick Control Deck + Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Door Throughput Rankings */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                                <DoorClosed className="w-4 h-4 text-primary" />
                                <span>Door Transit Rankings</span>
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                High-traffic entrance throughput and pass rates.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {topDoorsRank.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No door transit records logged yet.</p>
                        ) : (
                            topDoorsRank.map((door, idx) => (
                                <div key={door.doorId} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-foreground truncate max-w-[180px]">
                                            {idx + 1}. {door.doorName}
                                        </span>
                                        <span className="text-muted-foreground font-mono text-[11px]">
                                            {door.totalSwipes} swipes ({door.grantedPercent}% ok)
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${Math.min(100, Math.max(10, (door.totalSwipes / Math.max(1, topDoorsRank[0]?.totalSwipes || 1)) * 100))}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Facility Quick Control Deck */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4">
                    <div>
                        <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span>Facility Door Control Deck</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Targeted pulse unlock and master overrides.
                        </p>
                    </div>

                    {pulseFeedback && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{pulseFeedback}</span>
                        </div>
                    )}

                    <div className="space-y-3 pt-1">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">
                                Select Entrance Door
                            </label>
                            <select
                                value={currentDoor?.id || ""}
                                onChange={(e) => setSelectedDoorId(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-lg border bg-background"
                            >
                                {doors.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} ({d.controllerName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleQuickPulse}
                            disabled={isPulsing || !currentDoor}
                            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
                        >
                            <Unlock className={`w-4 h-4 ${isPulsing ? "animate-pulse" : ""}`} />
                            <span>{isPulsing ? "Pulsing Relay..." : `Pulse Unlock (5s) — ${currentDoor?.name || "Door"}`}</span>
                        </button>

                        <div className="pt-2 border-t border-border flex items-center gap-2">
                            <button
                                onClick={() => triggerLockdown("Command center quick lockdown")}
                                className="flex-1 py-2 px-3 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Lockdown</span>
                            </button>
                            <button
                                onClick={() => triggerOpenAll("Command center quick evacuate")}
                                className="flex-1 py-2 px-3 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Evacuate</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Active Cardholders */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                                <Users className="w-4 h-4 text-cyan-500" />
                                <span>Top Active Cardholders</span>
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Most frequent entrance verifications today.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {topUsersRank.map((u, idx) => (
                            <div
                                key={u.cardNumber}
                                className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/30 text-xs"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <b className="font-semibold text-foreground block">{u.name}</b>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            Card: {u.cardNumber}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-primary font-mono">{u.swipes}</span>
                                    <span className="text-[10px] text-muted-foreground block">swipes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Live Access Event Stream Ribbon */}
            <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <span>Recent Access Activity Stream</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Live telemetry feed of verified badges and security decisions.
                        </p>
                    </div>
                </div>

                <div className="divide-y divide-border rounded-xl border overflow-hidden bg-background">
                    {filteredEvents.length === 0 ? (
                        <div className="p-6 text-center text-xs text-muted-foreground italic">
                            No events matching active filter.
                        </div>
                    ) : (
                        filteredEvents.slice(0, 6).map((ev) => (
                            <div
                                key={ev.id}
                                className="p-3 sm:px-4 flex items-center justify-between gap-3 text-xs hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`p-1.5 rounded-lg shrink-0 ${
                                            ev.granted
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                                        }`}
                                    >
                                        {ev.granted ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <XCircle className="w-4 h-4" />
                                        )}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <b className="font-semibold text-foreground">
                                                {ev.cardHolderName || ev.userName || (ev.type === "REMOTE_OPEN" ? "Operator Remote Pulse" : "Unknown Cardholder")}
                                            </b>
                                            {ev.wiegandStr && (
                                                <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                                                    W26: {ev.wiegandStr}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground">
                                            {ev.doorName || `Door ${ev.doorNumber}`} • {ev.controllerName || `Panel ${ev.serialNumber}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            ev.granted
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                        }`}
                                    >
                                        {ev.granted ? "Granted" : "Denied"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">
                                        {new Date(ev.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
