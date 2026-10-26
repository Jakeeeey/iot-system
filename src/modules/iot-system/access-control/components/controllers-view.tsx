"use client";

import React, { useState } from "react";
import { useAccessControl } from "../context/access-context";
import { Cpu, RefreshCw, Clock, CheckCircle2 } from "lucide-react";

export function ControllersView() {
    const { controllers, auth, scanNetwork, syncTime } = useAccessControl();
    const [isScanning, setIsScanning] = useState(false);
    const [syncingSn, setSyncingSn] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleScan = async () => {
        setIsScanning(true);
        setMessage("Performing live network broadcast and unicast sweep on port 60000...");
        await scanNetwork();
        setIsScanning(false);
        setMessage("Network scan complete. Controller list updated.");
        setTimeout(() => setMessage(null), 4000);
    };

    const handleSyncTime = async (sn: number) => {
        if (!auth.canWrite) {
            alert("Operator login required to synchronize hardware clocks.");
            return;
        }
        setSyncingSn(sn);
        const ok = await syncTime(sn);
        setSyncingSn(null);
        if (ok) {
            setMessage(`Controller ${sn} hardware clock synchronized.`);
            setTimeout(() => setMessage(null), 3500);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold tracking-tight">Hardware Controllers (UHPPOTE)</h2>
                    <p className="text-xs text-muted-foreground">
                        Physical access control boards discovered on port 60000.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                        <span>{isScanning ? "Scanning LAN..." : "Scan Subnet"}</span>
                    </button>
                </div>
            </div>

            {message && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                            <tr>
                                <th className="px-4 py-3">Controller</th>
                                <th className="px-4 py-3">Serial Number</th>
                                <th className="px-4 py-3">Network IP : Port</th>
                                <th className="px-4 py-3">Hardware MAC</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Last Seen</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {controllers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No controllers registered yet. Click &quot;Scan Subnet&quot; to probe for UHPPOTE hardware on the local network.
                                    </td>
                                </tr>
                            ) : (
                                controllers.map((ctrl) => {
                                    const isSyncing = syncingSn === ctrl.serialNumber;
                                    return (
                                        <tr key={ctrl.serialNumber} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                    <Cpu className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{ctrl.name || `Controller-${ctrl.serialNumber}`}</div>
                                                    <div className="text-[10px] text-muted-foreground">{ctrl.location || "Main Facility"}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-foreground">
                                                {ctrl.serialNumber}
                                            </td>
                                            <td className="px-4 py-3 font-mono">
                                                {ctrl.ip}:{ctrl.port || 60000}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                                                {ctrl.mac || "00:66:19:--:--:--"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                        ctrl.online
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            ctrl.online ? "bg-emerald-500" : "bg-red-500"
                                                        }`}
                                                    />
                                                    {ctrl.online ? "ONLINE" : "OFFLINE"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-[11px]">
                                                {ctrl.lastSeen ? new Date(ctrl.lastSeen).toLocaleTimeString() : "Never"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleSyncTime(ctrl.serialNumber)}
                                                    disabled={!ctrl.online || isSyncing || !auth.canWrite}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md border hover:bg-muted disabled:opacity-50 transition-colors"
                                                    title="Synchronize controller hardware RTC clock"
                                                >
                                                    <Clock className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                                                    <span>{isSyncing ? "Syncing..." : "Sync Clock"}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
