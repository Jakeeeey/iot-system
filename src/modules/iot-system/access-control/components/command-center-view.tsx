"use client";

import React, { useMemo } from "react";
import { useAccessControl } from "../context/access-context";
import {
    Activity,
    TrendingUp,
    Users,
    DoorClosed,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Cpu,
    Unlock,
} from "lucide-react";
import Link from "next/link";

export function CommandCenterView() {
    const { controllers, doors, users, recentEvents, emergencyState, auth, pulseDoor } = useAccessControl();

    const stats = useMemo(() => {
        const totalEvents = recentEvents.length;
        const grantedCount = recentEvents.filter((e) => e.granted).length;
        const deniedCount = recentEvents.filter((e) => !e.granted).length;
        const passRate = totalEvents > 0 ? Math.round((grantedCount / totalEvents) * 100) : 100;
        const onlineBoards = controllers.filter((c) => c.online).length;

        return {
            totalEvents,
            grantedCount,
            deniedCount,
            passRate,
            onlineBoards,
        };
    }, [recentEvents, controllers]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold tracking-tight">Command Center & Operational Telemetry</h2>
                    <p className="text-xs text-muted-foreground">
                        Real-time overview of access velocity, door security posture, and facility operations.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            emergencyState === "NORMAL"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse"
                        }`}
                    >
                        Security State: {emergencyState}
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-card shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Access Pass Rate</span>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{stats.passRate}%</span>
                        <span className="text-xs text-muted-foreground">valid attempts</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${stats.passRate}%` }}
                        />
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Recent Swipes</span>
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Activity className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{stats.totalEvents}</span>
                        <span className="text-xs text-muted-foreground">in session log</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.grantedCount} granted</span>
                        <span>•</span>
                        <span className="text-red-600 dark:text-red-400 font-semibold">{stats.deniedCount} denied</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Hardware Panels</span>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Cpu className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{stats.onlineBoards}/{controllers.length}</span>
                        <span className="text-xs text-muted-foreground">online</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        Port 60000 UDP Hardware Gateway
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Cardholders</span>
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{users.length}</span>
                        <span className="text-xs text-muted-foreground">enrolled</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        Across {doors.length} total managed doors
                    </div>
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Door Control Bar */}
                <div className="lg:col-span-2 rounded-xl border bg-card p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DoorClosed className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-bold">Quick Door Commands</h3>
                        </div>
                        <Link
                            href="/iot-system/access-control/doors"
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            View All Doors &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {doors.slice(0, 6).map((door) => (
                            <div
                                key={door.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                            >
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-semibold truncate max-w-[150px]">{door.name}</h4>
                                    <p className="text-[10px] text-muted-foreground">
                                        {door.controllerName} • {door.mode.replace("_", " ")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => pulseDoor(door.serialNumber, door.doorNumber)}
                                    disabled={!door.online || !auth.canWrite}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
                                >
                                    <Unlock className="w-3 h-3" />
                                    <span>Pulse</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Threat & Swipe Stream */}
                <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold">Live Swipe Stream</h3>
                            </div>
                            <Link
                                href="/iot-system/access-control/history"
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                History &rarr;
                            </Link>
                        </div>

                        <div className="space-y-2.5">
                            {recentEvents.slice(0, 5).map((ev, idx) => (
                                <div
                                    key={`${ev.id || idx}-${ev.timestamp}`}
                                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30 border"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {ev.granted ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        ) : (
                                            <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                        )}
                                        <div className="truncate">
                                            <div className="font-semibold truncate">
                                                {ev.cardHolderName || `Card ${ev.cardNumber || "Unknown"}`}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Door {ev.doorNumber || 1} • {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                                            ev.granted
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                                        }`}
                                    >
                                        {ev.granted ? "OK" : "DENIED"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t">
                        <Link
                            href="/iot-system/access-control/emergency"
                            className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Facility Safety Overrides</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}