"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Receipt,
    Coins,
    Building2,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Filter,
    Download,
    RefreshCw,
    Wallet,
    DollarSign,
    Layers,
    FileSpreadsheet
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SettlementBatch {
    id: string;
    merchantName: string;
    nodeCluster: string;
    transactionsCount: number;
    grossVolume: number;
    feeRate: number;
    mdrFee: number;
    netPayout: number;
    status: "CLEARED" | "PENDING_ACH" | "IN_TRANSIT";
    clearingDate: string;
}

const INITIAL_BATCHES: SettlementBatch[] = [
    {
        id: "BTH-88219",
        merchantName: "Metro Transit Rail Authority",
        nodeCluster: "North Station Rail Hub",
        transactionsCount: 4210,
        grossVolume: 105250.00,
        feeRate: 0.015,
        mdrFee: 1578.75,
        netPayout: 103671.25,
        status: "CLEARED",
        clearingDate: "Today, 04:00 AM"
    },
    {
        id: "BTH-88218",
        merchantName: "Express Bus Rapid Line",
        nodeCluster: "BRT Gateway Cluster #02",
        transactionsCount: 2980,
        grossVolume: 104300.00,
        feeRate: 0.015,
        mdrFee: 1564.50,
        netPayout: 102735.50,
        status: "PENDING_ACH",
        clearingDate: "Scheduled 12:00 PM"
    },
    {
        id: "BTH-88217",
        merchantName: "Station Food Concourse Retailers",
        nodeCluster: "Terminal POS Cluster #01",
        transactionsCount: 840,
        grossVolume: 92400.00,
        feeRate: 0.02,
        mdrFee: 1848.00,
        netPayout: 90552.00,
        status: "IN_TRANSIT",
        clearingDate: "Yesterday"
    },
    {
        id: "BTH-88216",
        merchantName: "Automated Vending Solutions Inc",
        nodeCluster: "Kiosk Node Cluster #04",
        transactionsCount: 512,
        grossVolume: 35840.00,
        feeRate: 0.02,
        mdrFee: 716.80,
        netPayout: 35123.20,
        status: "CLEARED",
        clearingDate: "Yesterday"
    },
    {
        id: "BTH-88215",
        merchantName: "South Perimeter Feeder Transit",
        nodeCluster: "South Suburban Nodes",
        transactionsCount: 1640,
        grossVolume: 41000.00,
        feeRate: 0.015,
        mdrFee: 615.00,
        netPayout: 40385.00,
        status: "CLEARED",
        clearingDate: "2 days ago"
    }
];

export default function SettlementsPage() {
    const [batches, setBatches] = useState<SettlementBatch[]>(INITIAL_BATCHES);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isSettling, setIsSettling] = useState(false);
    const [pendingPool, setPendingPool] = useState(4821300.00);

    const handleExecuteSettlement = () => {
        setIsSettling(true);
        setTimeout(() => {
            setBatches((prev) =>
                prev.map((b) => (b.status === "PENDING_ACH" ? { ...b, status: "IN_TRANSIT" } : b))
            );
            setPendingPool((prev) => prev - 104300);
            setIsSettling(false);
            toast.success("Batch Settlement Transmitted!", {
                description: "₱104,300.00 queued for direct PESONet / ACH bank credit."
            });
        }, 1200);
    };

    const filteredBatches = batches.filter((b) => {
        const matchesSearch =
            b.merchantName.toLowerCase().includes(search.toLowerCase()) ||
            b.id.toLowerCase().includes(search.toLowerCase()) ||
            b.nodeCluster.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
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
                                        Clearing & Merchant Settlements
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
                                    Clearing & Merchant Settlements Console
                                </h1>
                                <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px] font-mono">
                                    DAILY CUTOFF T+1
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Automated smart card fare clearing, MDR fee deductions & scheduled transit merchant disbursements.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.success("Ledger Exported", { description: "Settlement report downloaded in XLSX format." })}
                                className="gap-1.5 h-9 text-xs"
                            >
                                <FileSpreadsheet className="h-3.5 w-3.5" />
                                Export Ledger
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleExecuteSettlement}
                                disabled={isSettling}
                                className="gap-1.5 h-9 text-xs font-semibold bg-primary text-primary-foreground"
                            >
                                <Receipt className={`h-3.5 w-3.5 ${isSettling ? "animate-spin" : ""}`} />
                                Trigger Settlement Run
                            </Button>
                        </div>
                    </div>

                    {/* Financial Stats Banner */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Pending Clearing Pool</div>
                                    <div className="text-2xl font-black font-mono mt-0.5 text-indigo-500">
                                        ₱{pendingPool.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                    <Wallet className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Net Settled Volume</div>
                                    <div className="text-2xl font-black font-mono mt-0.5 text-foreground">₱32,491,120</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Processing Fee Revenue</div>
                                    <div className="text-2xl font-black font-mono mt-0.5 text-cyan-500">₱487,366</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                                    <Coins className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card/60">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Batches Cleared</div>
                                    <div className="text-2xl font-black font-mono mt-0.5 text-foreground">142 Batches</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
                                    <Layers className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Merchant Name, Batch ID, or Gateway Cluster..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 text-xs font-mono"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {(["ALL", "CLEARED", "PENDING_ACH", "IN_TRANSIT"] as const).map((st) => (
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

                    {/* Settlement Ledger Table */}
                    <Card className="border border-border/60 bg-card shadow-xs">
                        <CardHeader className="p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold">Merchant Clearing Ledger</CardTitle>
                                <CardDescription className="text-xs">Showing {filteredBatches.length} batch disbursements</CardDescription>
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground">
                                Automated Cutoff: 00:00 UTC+8
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-border/40 text-muted-foreground text-left bg-muted/20">
                                            <th className="p-3 font-semibold">Batch ID</th>
                                            <th className="p-3 font-semibold">Merchant / Transit Operator</th>
                                            <th className="p-3 font-semibold">Gateway Ingress Cluster</th>
                                            <th className="p-3 font-semibold text-center">Taps Count</th>
                                            <th className="p-3 font-semibold text-right">Gross Fare</th>
                                            <th className="p-3 font-semibold text-right">MDR (Fee)</th>
                                            <th className="p-3 font-semibold text-right">Net Payout</th>
                                            <th className="p-3 font-semibold text-center">Status</th>
                                            <th className="p-3 font-semibold text-right">Clearing Cycle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20 font-mono">
                                        {filteredBatches.map((b) => (
                                            <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="p-3 font-bold text-foreground">{b.id}</td>
                                                <td className="p-3 font-sans font-semibold text-foreground">{b.merchantName}</td>
                                                <td className="p-3 font-sans text-muted-foreground">{b.nodeCluster}</td>
                                                <td className="p-3 text-center text-muted-foreground">{b.transactionsCount.toLocaleString()}</td>
                                                <td className="p-3 text-right font-bold text-foreground">₱{b.grossVolume.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                                <td className="p-3 text-right text-rose-500 font-medium">₱{b.mdrFee.toFixed(2)}</td>
                                                <td className="p-3 text-right font-black text-emerald-500">₱{b.netPayout.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                                <td className="p-3 text-center">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                                                            b.status === "CLEARED"
                                                                ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                                                                : b.status === "PENDING_ACH"
                                                                ? "border-amber-500/30 text-amber-500 bg-amber-500/10"
                                                                : "border-indigo-500/30 text-indigo-500 bg-indigo-500/10"
                                                        }`}
                                                    >
                                                        {b.status.replace("_", " ")}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-right font-sans text-muted-foreground text-[11px]">{b.clearingDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
