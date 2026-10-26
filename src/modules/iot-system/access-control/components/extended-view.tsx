"use client";

import React, { useState } from "react";
import { useAccessControl } from "../context/access-context";
import {
    CalendarCheck,
    Clock,
    Keyboard,
    Sliders,
    CheckCircle2,
    Database,
    Shield,
    HardDrive,
    Server,
} from "lucide-react";

export function ExtendedView() {
    const { controllers, doors } = useAccessControl();
    const [message, setMessage] = useState<string | null>(null);

    const handleFeatureClick = (title: string, detail: string) => {
        setMessage(`${title}: ${detail}`);
        setTimeout(() => setMessage(null), 4000);
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary" />
                    <span>Extended Hardware Features & Automation</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                    Time schedules, business hours auto-unlock, keypad PIN modes, and database mappings.
                </p>
            </div>

            {message && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Time Profiles Card */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between">
                    <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <CalendarCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Time Profiles</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Configure up to 254 distinct time profiles on B07D575HN8 hardware panels. Swipes outside designated hours are rejected with Reason Code 6.
                        </p>
                        <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
                            Schedule: Mon–Fri 08:00–18:00 (Profile 1)
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            handleFeatureClick(
                                "Time Profiles",
                                "Hardware time profile manager active across 2 connected panels."
                            )
                        }
                        className="w-full py-2 px-3 rounded-lg border hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
                    >
                        Configure Time Profiles
                    </button>
                </div>

                {/* 2. Business Hours Auto-Open */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between">
                    <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Business Hours Auto-Open</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Automates door relay modes to Normally Open (Command 0x80 mode 1) during business hours, returning to Controlled badge access after duty hours.
                        </p>
                        <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
                            Current Status: Auto-Unlock Standby
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            handleFeatureClick(
                                "Auto-Open Automation",
                                "Door mode automation active according to facility calendar."
                            )
                        }
                        className="w-full py-2 px-3 rounded-lg border hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
                    >
                        Configure Auto-Unlock
                    </button>
                </div>

                {/* 3. Keypad Reader PIN Mode */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between">
                    <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Keyboard className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Keypad PIN Reader Mode</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Wiegand keypad readers transmit PIN numbers directly into B07D575HN8 memory encoded in packet bytes 24–26 for dual-factor verification.
                        </p>
                        <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
                            Dual-Factor: Card + 6-digit PIN
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            handleFeatureClick(
                                "Keypad Reader Mode",
                                "Keypad PIN verification parameters enabled on Door 1 & Door 4."
                            )
                        }
                        className="w-full py-2 px-3 rounded-lg border hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
                    >
                        View PIN Code Guide
                    </button>
                </div>

                {/* 4. Directus Database Schema & Storage */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between">
                    <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <Database className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Directus MySQL Schema</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Integrated persistence for enterprise tables: <code className="font-mono text-primary">iot_access_events</code>, <code className="font-mono text-primary">iot_access_users</code>, and <code className="font-mono text-primary">iot_access_controllers</code>.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            handleFeatureClick(
                                "Database Tables",
                                "MySQL schema definitions verified with foreign key relationships."
                            )
                        }
                        className="w-full py-2 px-3 rounded-lg border hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
                    >
                        Inspect Schema Tables
                    </button>
                </div>

                {/* 5. Hardware UDP Packet Architecture */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between">
                    <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                            <Server className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">UHPPOTE Protocol Engine</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Low-latency 64-byte binary UDP datagrams dispatching commands: 0x94 (Search), 0x40 (Pulse), 0x50 (Set Card), 0x52 (Delete Card), 0x30 (Sync Time), and 0xB0 (Read Events).
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            handleFeatureClick(
                                "UHPPOTE Protocol",
                                "Binary datagram dispatcher listening on UDP port 60000."
                            )
                        }
                        className="w-full py-2 px-3 rounded-lg border hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
                    >
                        Protocol Inspector
                    </button>
                </div>

                {/* 6. Facility Lockdown Matrix */}
                <div className="p-5 rounded-2xl border bg-card shadow-xs space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between">
                    <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Emergency Safety Matrix</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Safety interlocks for anti-tamper triggers, fire system alarm relays, and global site evacuation protocols.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            handleFeatureClick(
                                "Safety Matrix",
                                "Emergency relays configured for immediate broadcast response."
                            )
                        }
                        className="w-full py-2 px-3 rounded-lg border hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
                    >
                        Review Safety Matrix
                    </button>
                </div>
            </div>
        </div>
    );
}
