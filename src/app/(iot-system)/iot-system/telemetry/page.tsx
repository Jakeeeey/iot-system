"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Activity,
    Radio,
    Search,
    Filter,
    Play,
    Pause,
    RefreshCw,
    Shield,
    CheckCircle2,
    Clock,
    AlertCircle,
    Cpu,
    ArrowUpRight,
    TrendingUp,
    Download
} from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "@/components/shared/app-sidebar/nav-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface TapTelemetryRecord {
    id: string;
    cardUid: string;
    terminalId: string;
    location: string;
    type: "Turnstile Entry" | "Turnstile Exit" | "Bus Validator" | "POS Top-up";
    fare: number;
    status: "AUTHORIZED" | "SETTLEMENT_QUEUED" | "DECLINED";
    macSig: string;
    timestamp: string;
}

const INITIAL_LOGS: TapTelemetryRecord[] = [
    {
        id: "EV-99214",
        cardUid: "04:88:29:A3:9F",
        terminalId: "NODE-TRN-03",
        location: "North Gate Turnstile #03",
        type: "Turnstile Entry",
        fare: 25.00,
        status: "AUTHORIZED",
        macSig: "0x8F92...B41A",
        timestamp: "2s ago"
    },
    {
        id: "EV-99213",
        cardUid: "04:12:F4:7B:6C",
        terminalId: "NODE-POS-01",
        location: "Kiosk Counter #01",
        type: "POS Top-up",
        fare: 500.00,
        status: "SETTLEMENT_QUEUED",
        macSig: "0x91CA...4102",
        timestamp: "8s ago"
    },
    {
        id: "EV-99212",
        cardUid: "04:C4:91:02:4A",
        terminalId: "NODE-BRT-14",
        location: "Bus Rapid Reader #14",
        type: "Bus Validator",
        fare: 35.00,
        status: "AUTHORIZED",
        macSig: "0x11AB...76EA",
        timestamp: "19s ago"
    },
    {
        id: "EV-99211",
        cardUid: "04:55:7E:88:2B",
        terminalId: "NODE-TRN-07",
        location: "South Concourse Exit #07",
        type: "Turnstile Exit",
        fare: 15.00,
        status: "DECLINED",
        macSig: "0xFE22...8831",
        timestamp: "38s ago"
    },
    {
        id: "EV-99210",
        cardUid: "04:AA:32:09:88",
        terminalId: "NODE-TRN-01",
        location: "North Gate Turnstile #01",
        type: "Turnstile Entry",
        fare: 25.00,
        status: "AUTHORIZED",
        macSig: "0x33DD...1109",
        timestamp: "52s ago"
    },
    {
        id: "EV-99209",
        cardUid: "04:47:19:9C:20",
        terminalId: "NODE-POS-04",
        location: "Terminal POS Node #04",
        type: "POS Top-up",
        fare: 300.00,
        status: "SETTLEMENT_QUEUED",
        macSig: "0x77EE...AA39",
        timestamp: "1m ago"
    }
];

export default function TelemetryPage() {
    const [logs, setLogs] = useState<TapTelemetryRecord[]>(INITIAL_LOGS);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [isLiveStreaming, setIsLiveStreaming] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<TapTelemetryRecord | null>(null);

    // Live Streaming Simulator
    useEffect(() => {
        if (!isLiveStreaming) return;

        const interval = setInterval(() => {
            const randomType: ("Turnstile Entry" | "Turnstile Exit" | "Bus Validator" | "POS Top-up")[] = [
                "Turnstile Entry",
                "Turnstile Exit",
                "Bus Validator"
            ];
            const chosenType = randomType[Math.floor(Math.random() * randomType.length)];
            const fare = chosenType === "Turnstile Entry" ? 25.00 : chosenType === "Turnstile Exit" ? 15.00 : 35.00;

            const newEvent: TapTelemetryRecord = {
                id: `EV-${Math.floor(99000 + Math.random() * 999)}`,
                cardUid: `04:${Math.floor(10 + Math.random() * 89).toString(16).toUpperCase()}:${Math.floor(10 + Math.random() * 89).toString(16).toUpperCase()}:${Math.floor(10 + Math.random() * 89).toString(16).toUpperCase()}:9F`,
                terminalId: `NODE-TRN-0${Math.floor(1 + Math.random() * 8)}`,
                location: `Platform Gate #0${Math.floor(1 + Math.random() * 6)}`,
                type: chosenType,
                fare: fare,
                status: Math.random() > 0.1 ? "AUTHORIZED" : "DECLINED",
                macSig: `0x${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}...${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`,
                timestamp: "Just now"
            };

            setLogs((prev) => [newEvent, ...prev.slice(0, 19)]);
        }, 4000);

        return () => clearInterval(interval);
    }, [isLiveStreaming]);

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.cardUid.toLowerCase().includes(search.toLowerCase()) ||
            log.id.toLowerCase().includes(search.toLowerCase()) ||
            log.terminalId.toLowerCase().includes(search.toLowerCase()) ||
            log.location.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {/* Topbar */}
            <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b shadow-xs bg-background sm:h-16 overflow-hidden">
                <div className="flex h-full min-w-0 items-center gap-2 px-3 sm:px-4 overflow-hidden">
                    <SidebarTrigger className="-ml-1 shrink-0" />
                    <Separator orientation="vertical" className="hidden sm:block mr-2 data-[orientation=vertical]:h-4 shrink-0" />
                    <div className="min-w-0 overflow-hidden">
                        <Breadcrumb>
                            <BreadcrumbList className="min-w-0 overflow-hidden">
                                <BreadcrumbItem className="hidden md:block shrink-0">
                                    <BreadcrumbLink href="/iot-system">IoT System</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block shrink-0" />
                                <BreadcrumbItem className="min-w-0 overflow-hidden">
                                    <BreadcrumbPage className="truncate max-w-[56vw] sm:max-w-[60vw] md:max-w-none font-bold">
                                        Smart Card Telemetry & Live Taps
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>

                <div className="flex h-full items-center px-2 sm:px-4 shrink-0 max-w-[48vw] sm:max-w-none overflow-hidden">
                    <NavUser user={{ name: "IoT Engineer", email: "dev@iot.local", avatar: "/avatars/shadcn.jpg" }} />
                </div>
            </header>

            {/* Main Content */}
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                                    Smart Card Telemetry & Live Taps
                                </h1>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-mono">
                                    INGRESS STREAMING
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                High-frequency tap verification feed across distributed NFC turnstiles and validation nodes.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Button
                                variant={isLiveStreaming ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                                className={`gap-2 h-9 text-xs font-semibold ${
                                    isLiveStreaming ? "bg-emerald-600 text-white hover:bg-emerald-500" : ""
                                }`}
                            >
                                {isLiveStreaming ? (
                                    <>
                                        <Pause className="h-3.5 w-3.5" />
                                        Streaming Live
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5" />
                                        Stream Paused
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.success("Export Complete", { description: "Exported 500 recent tap logs to CSV." })}
                                className="gap-1.5 h-9 text-xs"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Export Log
                            </Button>
                        </div>
                    </div>

                    {/* Telemetry Stats Bar */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Tap Velocity</div>
                                    <div className="text-xl font-black font-mono">248 / min</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Auth Success Rate</div>
                                    <div className="text-xl font-black font-mono text-emerald-500">99.4%</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
                                    <Radio className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Edge Latency</div>
                                    <div className="text-xl font-black font-mono">28 ms avg</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Cpu className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Connected Nodes</div>
                                    <div className="text-xl font-black font-mono">148 Nodes</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Card UID, Event ID, Node ID, or Location..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 text-xs font-mono"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {(["ALL", "AUTHORIZED", "SETTLEMENT_QUEUED", "DECLINED"] as const).map((st) => (
                                <Button
                                    key={st}
                                    variant={statusFilter === st ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(st)}
                                    className={`h-10 text-[11px] font-bold ${
                                        statusFilter === st ? "bg-primary text-primary-foreground" : ""
                                    }`}
                                >
                                    {st.replace("_", " ")}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Telemetry Stream Table */}
                    <Card className="border border-border/60 bg-card shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold">Ingress Tap Events Log</CardTitle>
                                <CardDescription className="text-xs">Showing {filteredLogs.length} events</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Live TLS Feed Active
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-border/40 text-muted-foreground text-left bg-muted/20">
                                            <th className="p-3 font-semibold">Event ID</th>
                                            <th className="p-3 font-semibold">Card UID</th>
                                            <th className="p-3 font-semibold">Terminal Node</th>
                                            <th className="p-3 font-semibold">Location / Gate</th>
                                            <th className="p-3 font-semibold">Operation Type</th>
                                            <th className="p-3 font-semibold text-right">Fare</th>
                                            <th className="p-3 font-semibold text-center">Status</th>
                                            <th className="p-3 font-semibold">MAC Digest</th>
                                            <th className="p-3 font-semibold text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20 font-mono">
                                        {filteredLogs.map((log) => (
                                            <tr
                                                key={log.id}
                                                onClick={() => setSelectedRecord(log)}
                                                className="hover:bg-muted/40 transition-colors cursor-pointer"
                                            >
                                                <td className="p-3 font-bold text-foreground">{log.id}</td>
                                                <td className="p-3 text-cyan-500 font-semibold">{log.cardUid}</td>
                                                <td className="p-3 text-muted-foreground">{log.terminalId}</td>
                                                <td className="p-3 font-sans font-medium text-foreground">{log.location}</td>
                                                <td className="p-3 font-sans text-muted-foreground">{log.type}</td>
                                                <td className="p-3 text-right font-bold text-foreground">₱{log.fare.toFixed(2)}</td>
                                                <td className="p-3 text-center">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                                                            log.status === "AUTHORIZED"
                                                                ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                                                                : log.status === "SETTLEMENT_QUEUED"
                                                                ? "border-indigo-500/30 text-indigo-500 bg-indigo-500/10"
                                                                : "border-rose-500/30 text-rose-500 bg-rose-500/10"
                                                        }`}
                                                    >
                                                        {log.status.replace("_", " ")}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-muted-foreground text-[10px]">{log.macSig}</td>
                                                <td className="p-3 text-right font-sans text-muted-foreground text-[11px]">{log.timestamp}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detail Modal / Drawer Simulation */}
                    {selectedRecord && (
                        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                            <Card className="w-full max-w-lg border border-border bg-card shadow-2xl">
                                <CardHeader className="pb-3 border-b border-border/40">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-bold">
                                            Telemetry Event Details ({selectedRecord.id})
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedRecord(null)}
                                            className="h-7 w-7 p-0"
                                        >
                                            &times;
                                        </Button>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Cryptographic validation audit of edge smart card tap.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3 font-mono text-xs">
                                    <div className="flex justify-between border-b border-border/30 pb-2">
                                        <span className="text-muted-foreground">Smart Card UID:</span>
                                        <span className="text-foreground font-bold">{selectedRecord.cardUid}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/30 pb-2">
                                        <span className="text-muted-foreground">Terminal Ingress Node:</span>
                                        <span className="text-foreground">{selectedRecord.terminalId}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/30 pb-2">
                                        <span className="text-muted-foreground">Location:</span>
                                        <span className="font-sans text-foreground">{selectedRecord.location}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/30 pb-2">
                                        <span className="text-muted-foreground">Operation:</span>
                                        <span className="font-sans text-foreground">{selectedRecord.type}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/30 pb-2">
                                        <span className="text-muted-foreground">Processed Fare:</span>
                                        <span className="text-primary font-bold text-sm">₱{selectedRecord.fare.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/30 pb-2">
                                        <span className="text-muted-foreground">Security MAC:</span>
                                        <span className="text-muted-foreground">{selectedRecord.macSig}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Verification Result:</span>
                                        <span className="text-emerald-500 font-bold">{selectedRecord.status}</span>
                                    </div>
                                </CardContent>
                                <div className="p-4 pt-0">
                                    <Button
                                        onClick={() => setSelectedRecord(null)}
                                        className="w-full text-xs font-semibold"
                                    >
                                        Close Audit Record
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
