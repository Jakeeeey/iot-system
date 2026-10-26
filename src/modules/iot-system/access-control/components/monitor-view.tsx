"use client";

import React, { useState, useEffect } from "react";
import { useAccessControl, FlatDoor } from "../context/access-context";
import { AccessEventLog } from "../types/access.types";
import { parseRfidCard } from "../lib/card-format";
import {
    Activity,
    Radio,
    DoorClosed,
    DoorOpen,
    Unlock,
    Lock,
    Volume2,
    VolumeX,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Zap,
    UserPlus,
    Clock,
    Shield,
} from "lucide-react";

export function MonitorView() {
    const { doors, recentEvents, auth, pulseDoor, isGatewayOnline } = useAccessControl();

    const [selectedDoorFilter, setSelectedDoorFilter] = useState<string>("all");
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [pulsingDoorId, setPulsingDoorId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [streamEvents, setStreamEvents] = useState<AccessEventLog[]>([]);

    // Sync stream events
    useEffect(() => {
        setStreamEvents(recentEvents);
    }, [recentEvents]);

    const handlePulse = async (door: FlatDoor) => {
        if (!auth.canWrite) {
            alert("Operator login required to pulse doors.");
            return;
        }
        setPulsingDoorId(door.id);
        const ok = await pulseDoor(door.serialNumber, door.doorNumber);
        setPulsingDoorId(null);
        if (ok) {
            setFeedback(`Door "${door.name}" unlocked for ${door.delaySeconds || 5}s.`);
            setTimeout(() => setFeedback(null), 4000);
        }
    };

    const handleClearStream = () => {
        setStreamEvents([]);
    };

    const filteredStream = streamEvents.filter((ev) => {
        if (selectedDoorFilter === "all") return true;
        return `${ev.serialNumber}-${ev.doorNumber}` === selectedDoorFilter;
    });

    const totalSwipes = streamEvents.length;
    const grantedSwipes = streamEvents.filter((e) => e.granted).length;
    const deniedSwipes = streamEvents.filter((e) => !e.granted).length;
    const passRate = totalSwipes > 0 ? Math.round((grantedSwipes / totalSwipes) * 100) : 100;

    return (
        <div className="space-y-5">
            {/* Top Header Strip: Compact Stats & Global Stream Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                        </span>
                        <span className="text-xs font-bold text-foreground font-mono">
                            {isGatewayOnline ? "LIVE TELEMETRY STREAM (UDP 60000)" : "LOCAL STREAM STANDBY"}
                        </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono border-l pl-3">
                        <span>Swipes: <b className="text-foreground">{totalSwipes}</b></span>
                        <span>•</span>
                        <span>Pass: <b className="text-emerald-600 dark:text-emerald-400">{passRate}%</b></span>
                        <span>•</span>
                        <span>Denied: <b className="text-red-600 dark:text-red-400">{deniedSwipes}</b></span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            soundEnabled ? "bg-primary/10 text-primary border-primary/20" : "bg-card text-muted-foreground hover:bg-muted"
                        }`}
                        title="Toggle chime alerts on card swipe"
                    >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>Audio Chime</span>
                    </button>

                    <button
                        onClick={handleClearStream}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card hover:bg-muted text-xs font-medium text-muted-foreground transition-colors"
                        title="Clear local stream buffer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Feed</span>
                    </button>
                </div>
            </div>

            {/* Notification Alert */}
            {feedback && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{feedback}</span>
                </div>
            )}

            {/* Monitored Doors Filter Chips Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                    onClick={() => setSelectedDoorFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedDoorFilter === "all"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-card border text-muted-foreground hover:bg-muted"
                    }`}
                >
                    All Monitored Doors ({doors.length})
                </button>

                {doors.map((door) => {
                    const isSelected = selectedDoorFilter === door.id;
                    return (
                        <button
                            key={door.id}
                            onClick={() => setSelectedDoorFilter(door.id)}
                            onDoubleClick={() => handlePulse(door)}
                            title="Single click to filter stream, double-click to pulse unlock"
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap flex items-center gap-1.5 transition-all ${
                                isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-card text-foreground hover:bg-muted"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{door.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Split Layout: Left Door Grid & Right Live Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Live Door Status Grid (5 cols) */}
                <div className="lg:col-span-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                                <DoorClosed className="w-4 h-4 text-primary" />
                                <span>Entrance Relays & Sensors</span>
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Real-time status of electronic strike locks.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {doors.map((door) => {
                            const isPulsing = pulsingDoorId === door.id;
                            return (
                                <div
                                    key={door.id}
                                    className="p-4 rounded-2xl border bg-card shadow-xs space-y-3 hover:border-primary/40 transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-[10px] font-mono font-semibold text-primary block">
                                                {door.controllerName} • Door {door.doorNumber}
                                            </span>
                                            <h4 className="text-xs font-bold text-foreground mt-0.5 truncate max-w-[150px]">
                                                {door.name}
                                            </h4>
                                        </div>

                                        <span
                                            className={`p-2 rounded-xl ${
                                                isPulsing
                                                    ? "bg-amber-500/10 text-amber-500 animate-bounce"
                                                    : "bg-emerald-500/10 text-emerald-500"
                                            }`}
                                        >
                                            {isPulsing ? <DoorOpen className="w-4 h-4" /> : <DoorClosed className="w-4 h-4" />}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                                        <span>Mode: {door.mode.replace("_", " ")}</span>
                                        <span>Relay: {isPulsing ? "UNLOCKED" : "LOCKED"}</span>
                                    </div>

                                    <button
                                        onClick={() => handlePulse(door)}
                                        disabled={isPulsing}
                                        className="w-full py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                    >
                                        <Unlock className={`w-3.5 h-3.5 ${isPulsing ? "animate-pulse" : ""}`} />
                                        <span>{isPulsing ? "Relay Energized..." : "Pulse Unlock (5s)"}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Live Event Feed (7 cols) */}
                <div className="lg:col-span-7 space-y-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-500" />
                                <span>Real-Time Badge Verification Feed</span>
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Incoming card swipes, keypad PINs, and security decisions.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-3 shadow-xs space-y-2.5 max-h-[680px] overflow-y-auto">
                        {filteredStream.length === 0 ? (
                            <div className="p-12 text-center text-xs text-muted-foreground italic">
                                No event records captured for the selected entrance door.
                            </div>
                        ) : (
                            filteredStream.map((log) => {
                                const parsed = log.cardNumber ? parseRfidCard(log.cardNumber) : null;
                                const isGranted = log.granted;
                                const isPulse = log.type === "REMOTE_OPEN";
                                const isUnknown = log.unknownCard;

                                return (
                                    <div
                                        key={log.id}
                                        className={`p-3.5 rounded-xl border transition-all ${
                                            isPulse
                                                ? "bg-amber-500/5 border-amber-500/30"
                                                : isUnknown
                                                ? "bg-orange-500/5 border-orange-500/30"
                                                : isGranted
                                                ? "bg-background border-border hover:border-emerald-500/40"
                                                : "bg-red-500/5 border-red-500/30"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                                                        isPulse
                                                            ? "bg-amber-500/10 text-amber-500"
                                                            : isUnknown
                                                            ? "bg-orange-500/10 text-orange-500"
                                                            : isGranted
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                    }`}
                                                >
                                                    {isPulse ? (
                                                        <Zap className="w-5 h-5" />
                                                    ) : isUnknown ? (
                                                        <AlertTriangle className="w-5 h-5" />
                                                    ) : isGranted ? (
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5" />
                                                    )}
                                                </div>

                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <b className="text-xs font-bold text-foreground">
                                                            {log.cardHolderName || log.userName || (isPulse ? "Remote Pulse Command" : "Unknown Cardholder")}
                                                        </b>
                                                        {log.department && (
                                                            <span className="text-[10px] text-muted-foreground px-1.5 py-0.2 rounded bg-muted">
                                                                {log.department}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-foreground">
                                                            {log.doorName || `Door ${log.doorNumber}`}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{log.controllerName || `Panel ${log.serialNumber}`}</span>
                                                    </div>

                                                    {log.cardNumber && (
                                                        <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 pt-0.5">
                                                            Card: <b>{log.cardNumber}</b> (W26: {parsed?.wiegandStr || "---"})
                                                            {parsed?.raw10D && ` • 10D: ${parsed.raw10D}`}
                                                        </div>
                                                    )}

                                                    {log.message && (
                                                        <p className="text-[11px] text-muted-foreground font-mono pt-1">
                                                            {log.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        isPulse
                                                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                                            : isUnknown
                                                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                                                            : isGranted
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                                    }`}
                                                >
                                                    {isPulse ? "PULSE" : isUnknown ? "UNKNOWN" : isGranted ? "GRANTED" : "DENIED"}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground block font-mono mt-1">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
