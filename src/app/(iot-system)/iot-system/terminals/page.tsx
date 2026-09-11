"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Cpu,
    Radio,
    Wifi,
    WifiOff,
    RotateCw,
    Shield,
    Server,
    CheckCircle2,
    AlertTriangle,
    Search,
    Filter,
    Key,
    Activity,
    SlidersHorizontal,
    ArrowUpRight
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

interface GatewayNode {
    id: string;
    name: string;
    type: "Turnstile Gate" | "POS Reader" | "BRT Bus Validator" | "Kiosk Terminal";
    ipAddress: string;
    macAddress: string;
    status: "ONLINE" | "SYNCING" | "OFFLINE";
    firmware: string;
    rssi: number;
    lastPing: string;
}

const INITIAL_NODES: GatewayNode[] = [
    {
        id: "NODE-TRN-01",
        name: "North Turnstile Entry Gate #01",
        type: "Turnstile Gate",
        ipAddress: "192.168.10.21",
        macAddress: "00:1B:44:11:3A:01",
        status: "ONLINE",
        firmware: "v3.4.2-LTS",
        rssi: -52,
        lastPing: "12ms"
    },
    {
        id: "NODE-TRN-02",
        name: "North Turnstile Entry Gate #02",
        type: "Turnstile Gate",
        ipAddress: "192.168.10.22",
        macAddress: "00:1B:44:11:3A:02",
        status: "ONLINE",
        firmware: "v3.4.2-LTS",
        rssi: -54,
        lastPing: "15ms"
    },
    {
        id: "NODE-BRT-11",
        name: "Bus Rapid Transit Validator #11",
        type: "BRT Bus Validator",
        ipAddress: "10.42.0.11",
        macAddress: "A4:C3:F0:88:14:11",
        status: "ONLINE",
        firmware: "v3.4.2-LTS",
        rssi: -68,
        lastPing: "28ms"
    },
    {
        id: "NODE-POS-01",
        name: "Customer Top-up Kiosk #01",
        type: "Kiosk Terminal",
        ipAddress: "192.168.20.101",
        macAddress: "E0:D5:5E:29:7B:01",
        status: "SYNCING",
        firmware: "v3.4.1-DEV",
        rssi: -60,
        lastPing: "34ms"
    },
    {
        id: "NODE-POS-03",
        name: "Station Convenience Merchant POS #03",
        type: "POS Reader",
        ipAddress: "192.168.30.55",
        macAddress: "3C:71:BF:90:12:03",
        status: "ONLINE",
        firmware: "v3.4.2-LTS",
        rssi: -58,
        lastPing: "18ms"
    },
    {
        id: "NODE-TRN-09",
        name: "South Auxiliary Exit Gate #09",
        type: "Turnstile Gate",
        ipAddress: "192.168.10.29",
        macAddress: "00:1B:44:11:3A:09",
        status: "OFFLINE",
        firmware: "v3.3.9",
        rssi: -95,
        lastPing: "Timeout"
    }
];

export default function TerminalsPage() {
    const [nodes, setNodes] = useState<GatewayNode[]>(INITIAL_NODES);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handlePing = (nodeId: string) => {
        setActionLoading(`ping-${nodeId}`);
        setTimeout(() => {
            const randomLatency = Math.floor(12 + Math.random() * 25);
            setNodes((prev) =>
                prev.map((n) => (n.id === nodeId ? { ...n, lastPing: `${randomLatency}ms`, status: "ONLINE" } : n))
            );
            setActionLoading(null);
            toast.success(`Node ${nodeId} Responding`, {
                description: `Roundtrip latency: ${randomLatency}ms. Health status OK.`
            });
        }, 800);
    };

    const handleReboot = (nodeId: string) => {
        setActionLoading(`reboot-${nodeId}`);
        toast.info(`Initiating Remote Reboot: ${nodeId}`, {
            description: "Sending SIGTERM to firmware controller daemon..."
        });
        setTimeout(() => {
            setNodes((prev) =>
                prev.map((n) => (n.id === nodeId ? { ...n, status: "SYNCING" } : n))
            );
            setTimeout(() => {
                setNodes((prev) =>
                    prev.map((n) => (n.id === nodeId ? { ...n, status: "ONLINE" } : n))
                );
                setActionLoading(null);
                toast.success(`Node ${nodeId} Reboot Complete`, {
                    description: "Mutual TLS connection re-established."
                });
            }, 1500);
        }, 1200);
    };

    const handleRotateKeys = () => {
        toast.info("Deploying AES-256 Master Key", {
            description: "Broadcasting encrypted key update to all 148 online nodes..."
        });
        setTimeout(() => {
            toast.success("Security Key Rotation Complete", {
                description: "All cluster endpoints verified with new token signatures."
            });
        }, 1500);
    };

    const filteredNodes = nodes.filter((n) => {
        const matchesSearch =
            n.name.toLowerCase().includes(search.toLowerCase()) ||
            n.id.toLowerCase().includes(search.toLowerCase()) ||
            n.ipAddress.includes(search) ||
            n.macAddress.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "ALL" || n.type === typeFilter;
        const matchesStatus = statusFilter === "ALL" || n.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
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
                                        Terminals & NFC Gateway Nodes
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
                                    Terminals & NFC Gateway Nodes
                                </h1>
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-mono">
                                    FLEET DEPLOYMENT
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Hardware telemetry, firmware health monitoring & remote diagnostics for transit validators.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRotateKeys}
                                className="gap-1.5 h-9 text-xs font-semibold"
                            >
                                <Key className="h-3.5 w-3.5 text-primary" />
                                Rotate Master Keys
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => toast.success("Node Scan Complete", { description: "Discovered 0 new unprovisioned nodes on subnet." })}
                                className="gap-1.5 h-9 text-xs font-semibold bg-primary text-primary-foreground"
                            >
                                <Radio className="h-3.5 w-3.5" />
                                Scan Subnet
                            </Button>
                        </div>
                    </div>

                    {/* Fleet Stats Banner */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Nodes Online</div>
                                    <div className="text-2xl font-black font-mono mt-0.5 text-emerald-500">148 / 150</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <Wifi className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Fleet Uptime</div>
                                    <div className="text-2xl font-black font-mono mt-0.5 text-foreground">99.98%</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Node Clusters</div>
                                    <div className="text-2xl font-black font-mono mt-0.5 text-foreground">4 Hubs</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                    <Server className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Firmware Target</div>
                                    <div className="text-2xl font-black font-mono mt-0.5 text-amber-500">v3.4.2</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Cpu className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Node Name, ID, IP address or MAC..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 text-xs font-mono"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {(["ALL", "ONLINE", "SYNCING", "OFFLINE"] as const).map((st) => (
                                <Button
                                    key={st}
                                    variant={statusFilter === st ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(st)}
                                    className={`h-10 text-[11px] font-bold ${
                                        statusFilter === st ? "bg-primary text-primary-foreground" : ""
                                    }`}
                                >
                                    {st}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Nodes Card Grid */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredNodes.map((node) => (
                            <Card key={node.id} className="border border-border/60 bg-card shadow-xs flex flex-col justify-between">
                                <CardHeader className="p-4 pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <Badge variant="outline" className="text-[9px] font-mono uppercase mb-1.5">
                                                {node.id}
                                            </Badge>
                                            <CardTitle className="text-sm font-bold leading-snug">
                                                {node.name}
                                            </CardTitle>
                                            <CardDescription className="text-xs mt-0.5 font-medium">
                                                {node.type}
                                            </CardDescription>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                                                node.status === "ONLINE"
                                                    ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                                                    : node.status === "SYNCING"
                                                    ? "border-amber-500/30 text-amber-500 bg-amber-500/10"
                                                    : "border-rose-500/30 text-rose-500 bg-rose-500/10"
                                            }`}
                                        >
                                            {node.status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="px-4 py-2 space-y-2 text-xs font-mono border-t border-border/40 bg-muted/10">
                                    <div className="flex justify-between text-muted-foreground pt-1">
                                        <span>IP Address:</span>
                                        <span className="text-foreground">{node.ipAddress}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>MAC Address:</span>
                                        <span className="text-foreground">{node.macAddress}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Firmware:</span>
                                        <span className="text-cyan-500 font-semibold">{node.firmware}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Signal RSSI:</span>
                                        <span className="text-foreground">{node.rssi} dBm</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground pb-1">
                                        <span>Last Latency:</span>
                                        <span className="text-emerald-500 font-bold">{node.lastPing}</span>
                                    </div>
                                </CardContent>

                                <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-between gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePing(node.id)}
                                        disabled={actionLoading === `ping-${node.id}`}
                                        className="h-8 text-[11px] font-semibold flex-1"
                                    >
                                        <Radio className={`h-3 w-3 mr-1.5 ${actionLoading === `ping-${node.id}` ? "animate-pulse text-primary" : ""}`} />
                                        Ping Node
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleReboot(node.id)}
                                        disabled={actionLoading === `reboot-${node.id}`}
                                        className="h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                                    >
                                        <RotateCw className={`h-3 w-3 mr-1.5 ${actionLoading === `reboot-${node.id}` ? "animate-spin" : ""}`} />
                                        Reboot
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
