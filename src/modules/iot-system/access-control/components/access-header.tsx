"use client";

import React, { useState } from "react";
import { useAccessControl } from "../context/access-context";
import { Shield, KeyRound, AlertTriangle, LogIn, LogOut, RefreshCw } from "lucide-react";

export function AccessHeader() {
    const {
        controllers,
        doors,
        users,
        emergencyState,
        auth,
        isGatewayOnline,
        isLoading,
        refreshAll,
        login,
        logout,
    } = useAccessControl();

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [tokenInput, setTokenInput] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const onlineBoards = controllers.filter((c) => c.online).length;

    return (
        <div className="flex flex-col gap-3 pb-4 border-b border-border">
            {emergencyState !== "NORMAL" && (
                <div
                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-white font-semibold text-sm ${
                        emergencyState === "LOCKDOWN" ? "bg-red-600 animate-pulse" : "bg-emerald-600 animate-pulse"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>
                            EMERGENCY OVERRIDE ACTIVE:{" "}
                            {emergencyState === "LOCKDOWN"
                                ? "ALL DOORS LOCKED DOWN (CARD BADGES SUSPENDED)"
                                : "ALL DOORS UNLOCKED (FREE EVACUATION)"}
                        </span>
                    </div>
                    <span className="text-xs uppercase bg-black/30 px-2 py-0.5 rounded">Facility Safety</span>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight">Access Control Subsystem</h1>
                            <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                                    isGatewayOnline
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        isGatewayOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                                    }`}
                                />
                                {isGatewayOnline ? "Hardware Gateway Online" : "Gateway Offline"}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enterprise UHPPOTE UDP Gateway (Port 60000) & Facility Door Operations
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50 border text-xs">
                        <div>
                            <span className="text-muted-foreground">Boards: </span>
                            <span className="font-semibold">{onlineBoards}/{controllers.length}</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div>
                            <span className="text-muted-foreground">Doors: </span>
                            <span className="font-semibold">{doors.length}</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div>
                            <span className="text-muted-foreground">Users: </span>
                            <span className="font-semibold">{users.length}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => refreshAll()}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center p-2 rounded-lg border hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
                        title="Refresh Hardware State"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>

                    {auth.authenticated ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-md font-medium capitalize bg-primary/10 text-primary border border-primary/20">
                                Role: {auth.role}
                            </span>
                            <button
                                onClick={() => logout()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-destructive/30 hover:bg-destructive/10 text-destructive transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsLoginOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Operator Login</span>
                        </button>
                    )}
                </div>
            </div>

            {isLoginOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <LogIn className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold">Operator Authentication</h3>
                                <p className="text-xs text-muted-foreground">
                                    Enter your Admin or Superadmin token to unlock mutating controls.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-foreground block mb-1">
                                    Access Token or Password
                                </label>
                                <input
                                    type="password"
                                    value={tokenInput}
                                    onChange={(e) => setTokenInput(e.target.value)}
                                    placeholder="Enter token or database password..."
                                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary font-mono"
                                    autoFocus
                                    required
                                />
                            </div>

                            {loginError && (
                                <p className="text-xs text-destructive font-medium">{loginError}</p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLoginOpen(false);
                                        setLoginError("");
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !tokenInput}
                                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Authenticating..." : "Authorize"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
