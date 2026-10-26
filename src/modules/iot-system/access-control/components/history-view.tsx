"use client";

import React, { useState, useMemo } from "react";
import { useAccessControl } from "../context/access-context";
import { AccessEventLog } from "../types/access.types";
import { parseRfidCard } from "../lib/card-format";
import {
    History,
    Search,
    Download,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Zap,
    UserPlus,
    RefreshCw,
    Shield,
    Database,
} from "lucide-react";

export function HistoryView() {
    const {
        controllers,
        doors,
        historyLogs,
        recentEvents,
        saveUser,
        fetchHardwareRecords,
        clearEventsTable,
    } = useAccessControl();

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterCtrl, setFilterCtrl] = useState("all");
    const [filterDoor, setFilterDoor] = useState("all");
    const [isFetchingHw, setIsFetchingHw] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Clear Modal
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [confirmKeyword, setConfirmKeyword] = useState("");
    const [isClearing, setIsClearing] = useState(false);

    // Quick Enroll Modal
    const [enrollCard, setEnrollCard] = useState<string | null>(null);
    const [enrollName, setEnrollName] = useState("");
    const [enrollDept, setEnrollDept] = useState("General");

    const allLogs = historyLogs.length > 0 ? historyLogs : recentEvents;

    // Filtered logs
    const filteredLogs = useMemo(() => {
        return allLogs.filter((log) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                !term ||
                String(log.cardNumber || "").includes(term) ||
                String(log.rawCardNumber || "").includes(term) ||
                (log.cardHolderName || "").toLowerCase().includes(term) ||
                (log.userName || "").toLowerCase().includes(term) ||
                (log.doorName || "").toLowerCase().includes(term) ||
                (log.controllerName || "").toLowerCase().includes(term) ||
                (log.message || "").toLowerCase().includes(term);

            const matchesType =
                filterType === "all" ||
                (filterType === "GRANTED" && log.granted) ||
                (filterType === "DENIED" && !log.granted) ||
                (filterType === "PULSE" && log.type === "REMOTE_OPEN") ||
                (filterType === "ALARM" && (log.type === "SECURITY" || log.unknownCard));

            const matchesCtrl = filterCtrl === "all" || String(log.serialNumber) === filterCtrl;
            const matchesDoor = filterDoor === "all" || String(log.doorNumber) === filterDoor;

            return matchesSearch && matchesType && matchesCtrl && matchesDoor;
        });
    }, [allLogs, searchTerm, filterType, filterCtrl, filterDoor]);

    const handleFetchHw = async () => {
        setIsFetchingHw(true);
        setMessage("Downloading stored entrance records from controller memory buffer (0xB0)...");
        const ok = await fetchHardwareRecords();
        setIsFetchingHw(false);
        if (ok) {
            setMessage("Hardware buffer records extracted and merged into audit logs.");
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const handleExportCsv = () => {
        const headers = ["Timestamp", "Type", "Controller", "Door", "Card Number", "Wiegand", "Name", "Granted", "Message"];
        const rows = filteredLogs.map((l) => [
            `"${l.timestamp}"`,
            l.type || (l.granted ? "GRANTED" : "DENIED"),
            `"${l.controllerName || l.serialNumber}"`,
            `"${l.doorName || l.doorNumber}"`,
            l.cardNumber || "",
            `"${l.wiegandStr || ""}"`,
            `"${l.cardHolderName || l.userName || ""}"`,
            l.granted ? "TRUE" : "FALSE",
            `"${l.message || ""}"`,
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `access_history_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClearConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmKeyword !== "CLEAR") return;
        setIsClearing(true);
        const ok = await clearEventsTable("CLEAR");
        setIsClearing(false);
        if (ok) {
            setMessage("Audit event history cleared.");
            setIsClearModalOpen(false);
            setConfirmKeyword("");
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const handleQuickEnrollSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollCard || !enrollName) return;
        const parsed = parseRfidCard(enrollCard);
        const ok = await saveUser({
            cardNumber: enrollCard,
            rawCardNumber: parsed?.raw10D || undefined,
            name: enrollName,
            department: enrollDept,
            validFrom: "2024-01-01",
            validTo: "2030-12-31",
            doors: [1, 2, 3, 4],
            active: true,
        });
        if (ok) {
            setMessage(`Enrolled cardholder "${enrollName}" for Card ${enrollCard}.`);
            setEnrollCard(null);
            setEnrollName("");
            setTimeout(() => setMessage(null), 4000);
        }
    };

    return (
        <div className="space-y-5">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border shadow-xs">
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[320px]">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search card, name, door, reason..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border bg-background"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border bg-background"
                    >
                        <option value="all">All Event Types</option>
                        <option value="GRANTED">Granted Access</option>
                        <option value="DENIED">Denied Access</option>
                        <option value="PULSE">Remote Pulse</option>
                        <option value="ALARM">Security / Unknowns</option>
                    </select>

                    <select
                        value={filterCtrl}
                        onChange={(e) => setFilterCtrl(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border bg-background"
                    >
                        <option value="all">All Controllers</option>
                        {controllers.map((c) => (
                            <option key={c.serialNumber} value={String(c.serialNumber)}>
                                SN: {c.serialNumber}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterDoor}
                        onChange={(e) => setFilterDoor(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border bg-background"
                    >
                        <option value="all">All Doors</option>
                        <option value="1">Door 1</option>
                        <option value="2">Door 2</option>
                        <option value="3">Door 3</option>
                        <option value="4">Door 4</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleFetchHw}
                        disabled={isFetchingHw}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border bg-card hover:bg-muted transition-colors disabled:opacity-50 shadow-xs"
                        title="Extract entrance records stored in hardware controller flash memory"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-primary ${isFetchingHw ? "animate-spin" : ""}`} />
                        <span>Fetch Hardware Memory</span>
                    </button>

                    <button
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border bg-card hover:bg-muted transition-colors shadow-xs"
                        title="Export filtered records as CSV"
                    >
                        <Download className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Export CSV</span>
                    </button>

                    <button
                        onClick={() => setIsClearModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-destructive/30 hover:bg-destructive/10 text-destructive transition-colors shadow-xs"
                        title="Clear iot_access_events table"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear History</span>
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {message && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {/* History Table */}
            <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                            <tr>
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">Event Type</th>
                                <th className="px-4 py-3">Controller</th>
                                <th className="px-4 py-3">Entrance Door</th>
                                <th className="px-4 py-3">Card & Wiegand 26</th>
                                <th className="px-4 py-3">Cardholder</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Details / Message</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-xs text-muted-foreground italic">
                                        No access event records matching the specified criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => {
                                    const parsed = log.cardNumber ? parseRfidCard(log.cardNumber) : null;
                                    const isGranted = log.granted;
                                    const isPulse = log.type === "REMOTE_OPEN";
                                    const isUnknown = log.unknownCard;

                                    return (
                                        <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                                                {log.type || (isGranted ? "SWIPE_GRANTED" : "SWIPE_DENIED")}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {log.controllerName || `SN ${log.serialNumber}`}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-foreground">
                                                {log.doorName || `Door ${log.doorNumber}`}
                                            </td>
                                            <td className="px-4 py-3 font-mono">
                                                {log.cardNumber ? (
                                                    <div>
                                                        <b className="text-cyan-600 dark:text-cyan-400">
                                                            {log.cardNumber}
                                                        </b>
                                                        <span className="text-[10px] text-muted-foreground block">
                                                            W26: {parsed?.wiegandStr || "---"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">---</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isUnknown ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-semibold">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Unknown Cardholder
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-foreground">
                                                        {log.cardHolderName || log.userName || (isPulse ? "Remote Operator" : "---")}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        isPulse
                                                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                                            : isGranted
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                                    }`}
                                                >
                                                    {isPulse ? "PULSE" : isGranted ? "GRANTED" : "DENIED"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                                                {log.message || "---"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {isUnknown && log.cardNumber && (
                                                    <button
                                                        onClick={() => {
                                                            setEnrollCard(String(log.cardNumber));
                                                            setEnrollName("");
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                                                    >
                                                        <UserPlus className="w-3 h-3" />
                                                        <span>Enroll</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Clear Events Warning Modal */}
            {isClearModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl border border-destructive/40 bg-background p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-destructive">Warning: Clear Audit Events Table</h3>
                                <p className="text-xs text-muted-foreground">
                                    Truncate all entrance logs and security audit records from database.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleClearConfirm} className="space-y-3.5">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                This action is permanent and cannot be undone. To proceed, please type <b className="text-foreground">CLEAR</b> in capital letters below:
                            </p>

                            <input
                                type="text"
                                value={confirmKeyword}
                                onChange={(e) => setConfirmKeyword(e.target.value)}
                                placeholder='Type "CLEAR" to confirm'
                                className="w-full px-3 py-2 text-xs rounded-lg border bg-background font-mono"
                                autoFocus
                                required
                            />

                            <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsClearModalOpen(false);
                                        setConfirmKeyword("");
                                    }}
                                    className="px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={confirmKeyword !== "CLEAR" || isClearing}
                                    className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 shadow-xs disabled:opacity-40"
                                >
                                    {isClearing ? "Clearing..." : "Confirm Delete"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Enroll Modal */}
            {enrollCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold">Enroll Cardholder from Swipe</h3>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        Card Number: {enrollCard}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEnrollCard(null)}
                                className="text-muted-foreground hover:text-foreground text-lg leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleQuickEnrollSubmit} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">
                                    Cardholder Full Name
                                </label>
                                <input
                                    type="text"
                                    value={enrollName}
                                    onChange={(e) => setEnrollName(e.target.value)}
                                    placeholder="e.g. Johnathan Doe"
                                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={enrollDept}
                                    onChange={(e) => setEnrollDept(e.target.value)}
                                    placeholder="e.g. Security, Visitor, Staff"
                                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => setEnrollCard(null)}
                                    className="px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs"
                                >
                                    Enroll & Authorize
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
