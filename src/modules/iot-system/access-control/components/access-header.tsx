"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccessControl } from "../context/access-context";
import {
    Shield,
    KeyRound,
    AlertTriangle,
    LogIn,
    LogOut,
    RefreshCw,
    Gauge,
    Server,
    Users,
    Activity,
    History,
    Sliders,
    Database,
    DoorOpen,
    Cpu,
    CheckCircle2,
} from "lucide-react";

export function AccessHeader() {
    const pathname = usePathname();
    const {
        controllers,
        doors,
        users,
        emergencyState,
        auth,
        directusStatus,
        isGatewayOnline,
        isLoading,
        refreshAll,
        syncDirectus,
        login,
        logout,
        restoreNormal,
    } = useAccessControl();

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [tokenInput, setTokenInput] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [directusFeedback, setDirectusFeedback] = useState<string | null>(null);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setIsSubmitting(true);
        const ok = await login(tokenInput);
        setIsSubmitting(false);
        if (ok) {
            setTokenInput("");
            setIsLoginOpen(false);
        } else {
            setLoginError("Invalid token or access denied.");
        }
    };

    const handleDirectusSyncClick = async () => {
        setDirectusFeedback("Triggering Directus MySQL synchronization...");
        const ok = await syncDirectus();
        if (ok) {
            setDirectusFeedback("Directus database synchronized successfully.");
        } else {
            setDirectusFeedback("Directus sync error. Check API credentials.");
        }
        setTimeout(() => setDirectusFeedback(null), 4000);
    };

    const onlineBoards = controllers.filter((c) => c.online || c.isOnline).length;
    const onlineDoors = doors.filter((d) => d.online).length;

    const navTabs = [
        { label: "Command Center", href: "/iot-system/access-control", icon: Gauge, exact: true },
        { label: "Controllers & Doors", href: "/iot-system/access-control/controllers", icon: Server },
        { label: "Users & Privileges", href: "/iot-system/access-control/users", icon: Users },
        { label: "Real-Time Monitor", href: "/iot-system/access-control/monitor", icon: Activity },
        { label: "History Records", href: "/iot-system/access-control/history", icon: History },
        { label: "Extended Functions", href: "/iot-system/access-control/extended", icon: Sliders },
        { label: "Emergency Overrides", href: "/iot-system/access-control/emergency", icon: AlertTriangle, isDestructive: true },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Emergency Global Banner */}
            {emergencyState !== "NORMAL" && (
                <div
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all ${
                        emergencyState === "LOCKDOWN"
                            ? "bg-red-600 animate-pulse border border-red-500"
                            : "bg-emerald-600 animate-pulse border border-emerald-500"
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                            <span className="font-bold uppercase tracking-wide">
                                EMERGENCY OVERRIDE ACTIVE:{" "}
                                {emergencyState === "LOCKDOWN"
                                    ? "ALL DOORS LOCKED DOWN — ACCESS BADGES SUSPENDED"
                                    : "ALL DOORS UNLOCKED — FREE EMERGENCY EVACUATION"}
                            </span>
                            <p className="text-xs text-white/80 font-normal">
                                High-priority override broadcast to all connected B07D575HN8 hardware panels.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => restoreNormal("Operator banner restore")}
                        className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        Restore Normal
                    </button>
                </div>
            )}

            {/* Directus Feedback Alert */}
            {directusFeedback && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{directusFeedback}</span>
                </div>
            )}

            {/* Top Brand & Metrics Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl font-bold tracking-tight">ACCESS Professional</h1>
                            <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-muted text-muted-foreground border">
                                B07D575HN8 / UHPPOTE
                            </span>
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    isGatewayOnline
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        isGatewayOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                                    }`}
                                />
                                {isGatewayOnline ? "Gateway Listening (60000)" : "Gateway Standby"}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enterprise Access Control Subsystem & Live Multi-Controller Management
                        </p>
                    </div>
                </div>

                {/* Quick Stat Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border text-xs shadow-xs">
                        <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="text-muted-foreground">Live Boards:</span>
                        <b className="font-semibold text-foreground">{onlineBoards}/{controllers.length}</b>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border text-xs shadow-xs">
                        <DoorOpen className="w-3.5 h-3.5 text-primary" />
                        <span className="text-muted-foreground">Doors Online:</span>
                        <b className="font-semibold text-foreground">{onlineDoors}/{doors.length}</b>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border text-xs shadow-xs">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-muted-foreground">Authorized Users:</span>
                        <b className="font-semibold text-foreground">{users.length}</b>
                    </div>

                    <button
                        onClick={handleDirectusSyncClick}
                        title="Click to trigger Directus MySQL DB sync (iot_access_*)"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border hover:bg-muted/70 text-xs shadow-xs transition-colors cursor-pointer"
                    >
                        <Database
                            className={`w-3.5 h-3.5 ${
                                directusStatus.status === "syncing"
                                    ? "animate-spin text-amber-500"
                                    : directusStatus.status === "connected"
                                    ? "text-emerald-500"
                                    : "text-amber-500"
                            }`}
                        />
                        <span className="text-muted-foreground">Directus DB:</span>
                        <b className="font-semibold text-foreground capitalize">
                            {directusStatus.status === "syncing" ? "Syncing..." : directusStatus.status}
                        </b>
                    </button>

                    <button
                        onClick={() => setIsLoginOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border hover:bg-muted/70 text-xs shadow-xs transition-colors cursor-pointer"
                        title="Click to view or set Admin API Token"
                    >
                        <KeyRound className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="text-muted-foreground">Auth:</span>
                        <b className="font-semibold text-primary capitalize">{auth.role || "Set Token"}</b>
                    </button>

                    <button
                        onClick={() => refreshAll()}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50 shadow-xs"
                        title="Refresh Hardware State"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    </button>

                    {auth.authenticated && (
                        <button
                            onClick={() => logout()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-destructive/30 hover:bg-destructive/10 text-destructive transition-colors shadow-xs"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs scrollbar-none">
                {navTabs.map((tab) => {
                    const isActive = tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href);
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all select-none ${
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : tab.isDestructive
                                    ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Admin Token Modal */}
            {isLoginOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold">Operator Authentication</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Configure ADMIN_TOKEN or superadmin credential for hardware control.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsLoginOpen(false)}
                                className="text-muted-foreground hover:text-foreground text-lg leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1.5">
                                    Admin Bearer Token / Password
                                </label>
                                <input
                                    type="password"
                                    value={tokenInput}
                                    onChange={(e) => setTokenInput(e.target.value)}
                                    placeholder="Enter security token or admin credential..."
                                    className="w-full px-3.5 py-2 text-sm rounded-lg border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary font-mono"
                                    autoFocus
                                    required
                                />
                                <span className="text-[11px] text-muted-foreground mt-1 block">
                                    Standard token configured in `.env` (ADMIN_TOKEN) or Directus operator role.
                                </span>
                            </div>

                            {loginError && (
                                <p className="text-xs text-destructive font-medium p-2 rounded-md bg-destructive/10 border border-destructive/20">
                                    {loginError}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsLoginOpen(false)}
                                    className="px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>{isSubmitting ? "Authenticating..." : "Save & Unlock"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
