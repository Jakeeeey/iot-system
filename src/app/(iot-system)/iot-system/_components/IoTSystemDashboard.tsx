"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Radio,
    CreditCard,
    Activity,
    Cpu,
    Receipt,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Shield,
    Wifi,
    Zap,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TapEvent {
    id: string;
    cardUid: string;
    terminalName: string;
    type: "Transit Tap" | "Top-up" | "POS Purchase";
    amount: number;
    status: "AUTHORIZED" | "SETTLEMENT_QUEUED" | "DECLINED";
    timestamp: string;
}

const INITIAL_TAPS: TapEvent[] = [
    {
        id: "TAP-9082",
        cardUid: "04:B2:77:A1:9F",
        terminalName: "North Gate Turnstile #03",
        type: "Transit Tap",
        amount: 25.00,
        status: "AUTHORIZED",
        timestamp: "Just now"
    },
    {
        id: "TAP-9081",
        cardUid: "04:C8:12:F4:3B",
        terminalName: "POS Counter Node #02",
        type: "Top-up",
        amount: 500.00,
        status: "SETTLEMENT_QUEUED",
        timestamp: "14s ago"
    },
    {
        id: "TAP-9080",
        cardUid: "04:99:3A:E7:22",
        terminalName: "Bus Rapid Validator #07",
        type: "Transit Tap",
        amount: 35.00,
        status: "AUTHORIZED",
        timestamp: "32s ago"
    },
    {
        id: "TAP-9079",
        cardUid: "04:18:99:8D:6C",
        terminalName: "South Entrance Reader #01",
        type: "Transit Tap",
        amount: 15.00,
        status: "DECLINED",
        timestamp: "1m ago"
    },
    {
        id: "TAP-9078",
        cardUid: "04:AA:51:30:19",
        terminalName: "Express Terminal Node #05",
        type: "POS Purchase",
        amount: 120.50,
        status: "AUTHORIZED",
        timestamp: "2m ago"
    }
];

export default function IoTSystemDashboard() {
    const [taps, setTaps] = useState<TapEvent[]>(INITIAL_TAPS);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshFeed = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            const newTap: TapEvent = {
                id: `TAP-${Math.floor(1000 + Math.random() * 9000)}`,
                cardUid: `04:${Math.floor(10 + Math.random() * 89).toString(16).toUpperCase()}:${Math.floor(10 + Math.random() * 89).toString(16).toUpperCase()}:A${Math.floor(1 + Math.random() * 9)}:9F`,
                terminalName: "Central Station Turnstile #01",
                type: "Transit Tap",
                amount: 25.00,
                status: "AUTHORIZED",
                timestamp: "Just now"
            };
            setTaps((prev) => [newTap, ...prev.slice(0, 4)]);
            setIsRefreshing(false);
        }, 600);
    };

    return (
        <div className="flex flex-col gap-6 p-1 sm:p-2">
            {/* Top Control Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                            IoT Operations & Gateway Hub
                        </h1>
                        <Badge variant="outline" className="h-5 px-2 text-[10px] font-black uppercase tracking-widest border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                            Telemetry Active
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        High-frequency smart card tap processing, distributed NFC edge validator nodes & merchant clearing.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={refreshFeed} 
                        disabled={isRefreshing}
                        className="gap-2 h-9 text-xs font-semibold"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
                        Sync Telemetry
                    </Button>
                    <Button size="sm" asChild className="gap-1.5 h-9 text-xs font-semibold bg-primary text-primary-foreground">
                        <Link href="/iot-system/checkout">
                            <CreditCard className="h-3.5 w-3.5" />
                            Card Checkout
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Telemetry Overview */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Active Edge Nodes
                        </CardTitle>
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Cpu className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black tracking-tight">148 <span className="text-xs text-muted-foreground font-normal">/ 150</span></div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-500 font-medium">
                            <Wifi className="h-3 w-3" />
                            <span>98.7% Fleet Online (2 in sync)</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            24h Tap Velocity
                        </CardTitle>
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                            <Activity className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black tracking-tight">18,429</div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-cyan-500 font-medium">
                            <TrendingUp className="h-3 w-3" />
                            <span>Peak: 248 taps / minute</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Today&apos;s Gross Volume
                        </CardTitle>
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            <CreditCard className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black tracking-tight">₱1,420,890</div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-indigo-500 font-medium">
                            <Zap className="h-3 w-3" />
                            <span>+14.2% vs yesterday</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Edge Gateway Latency
                        </CardTitle>
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-500/10 text-violet-500 border border-violet-500/20">
                            <Radio className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black tracking-tight">28 <span className="text-xs text-muted-foreground font-normal">ms</span></div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-500 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>MAC Validation Nominal</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Feature Launchpad (The 4 Gateway Modules) */}
            <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                    Subsystem Portals & Management Consoles
                </h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {/* Module 1: Checkout */}
                    <Link href="/iot-system/checkout" className="group">
                        <Card className="h-full border border-border/60 bg-card hover:border-cyan-500/50 hover:bg-card/80 transition-all duration-200 shadow-xs">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                                <CardTitle className="text-base font-bold mt-2">Card Top-up Checkout</CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    Smart card top-ups via Maya, GCash, Debit/Credit Card with live balance refresh.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <span className="text-[11px] font-semibold text-cyan-500">Open Terminal Checkout &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Module 2: Live Telemetry */}
                    <Link href="/iot-system/telemetry" className="group">
                        <Card className="h-full border border-border/60 bg-card hover:border-emerald-500/50 hover:bg-card/80 transition-all duration-200 shadow-xs">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                                <CardTitle className="text-base font-bold mt-2">Smart Card Telemetry</CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    Real-time passenger taps, encrypted NFC token checks & velocity analytics.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <span className="text-[11px] font-semibold text-emerald-500">View Live Tap Stream &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Module 3: Terminals */}
                    <Link href="/iot-system/terminals" className="group">
                        <Card className="h-full border border-border/60 bg-card hover:border-amber-500/50 hover:bg-card/80 transition-all duration-200 shadow-xs">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                        <Cpu className="h-5 w-5" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                                <CardTitle className="text-base font-bold mt-2">NFC Gateway Nodes</CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    Fleet management for turnstiles, bus validators, POS readers & remote heartbeat.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <span className="text-[11px] font-semibold text-amber-500">Manage Validator Fleet &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Module 4: Settlements */}
                    <Link href="/iot-system/settlements" className="group">
                        <Card className="h-full border border-border/60 bg-card hover:border-indigo-500/50 hover:bg-card/80 transition-all duration-200 shadow-xs">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                                <CardTitle className="text-base font-bold mt-2">Merchant Settlements</CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    Consolidated clearing batches, MDR merchant processing fees & automated payouts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <span className="text-[11px] font-semibold text-indigo-500">Open Settlements Console &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Live Tap Stream & Terminal Status Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Real-time Taps Feed */}
                <Card className="lg:col-span-2 border border-border/50 bg-card/60 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base font-bold">Recent Telemetry Taps</CardTitle>
                            <CardDescription className="text-xs">Live high-frequency tap events arriving at edge ingress</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs text-primary gap-1">
                            <Link href="/iot-system/telemetry">
                                All Taps
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-border/40 text-muted-foreground text-left">
                                        <th className="pb-2 font-semibold">Event ID</th>
                                        <th className="pb-2 font-semibold">Card UID</th>
                                        <th className="pb-2 font-semibold">Terminal Location</th>
                                        <th className="pb-2 font-semibold text-right">Amount</th>
                                        <th className="pb-2 font-semibold text-center">Status</th>
                                        <th className="pb-2 font-semibold text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20 font-mono">
                                    {taps.map((t) => (
                                        <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-2.5 font-bold text-foreground">{t.id}</td>
                                            <td className="py-2.5 text-muted-foreground">{t.cardUid}</td>
                                            <td className="py-2.5 font-sans font-medium text-foreground">{t.terminalName}</td>
                                            <td className="py-2.5 text-right font-bold text-foreground">₱{t.amount.toFixed(2)}</td>
                                            <td className="py-2.5 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider ${
                                                        t.status === "AUTHORIZED"
                                                            ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                                                            : t.status === "SETTLEMENT_QUEUED"
                                                            ? "border-indigo-500/30 text-indigo-500 bg-indigo-500/10"
                                                            : "border-rose-500/30 text-rose-500 bg-rose-500/10"
                                                    }`}
                                                >
                                                    {t.status.replace("_", " ")}
                                                </Badge>
                                            </td>
                                            <td className="py-2.5 text-right font-sans text-muted-foreground text-[11px]">{t.timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* System Nodes Health Box */}
                <Card className="border border-border/50 bg-card/60 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold">Node Fleet Health</CardTitle>
                            <CardDescription className="text-xs">Physical validator cluster status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Turnstiles (North & South)</span>
                                    <span className="font-bold text-emerald-500">64 / 64 Online</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Bus Rapid Transit Nodes</span>
                                    <span className="font-bold text-emerald-500">48 / 48 Online</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Merchant POS Readers</span>
                                    <span className="font-bold text-amber-500">36 / 38 Online</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full w-[94%]" />
                                </div>
                            </div>

                            <div className="p-3 rounded-lg border border-border/40 bg-muted/20 mt-4 text-xs space-y-1">
                                <div className="flex items-center gap-2 text-foreground font-semibold">
                                    <Shield className="h-3.5 w-3.5 text-primary" />
                                    <span>VOS Security Integrity</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    AES-256 session keys active. Mutual TLS v1.3 negotiated with all 148 online nodes.
                                </p>
                            </div>
                        </CardContent>
                    </div>

                    <div className="p-4 pt-0">
                        <Button variant="outline" size="sm" asChild className="w-full text-xs font-semibold">
                            <Link href="/iot-system/terminals">
                                View Detailed Fleet Diagnostics
                            </Link>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
