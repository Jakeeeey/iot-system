"use client";

import React, { useState } from "react";
import { useAccessControl } from "../context/access-context";
import { Users, UserPlus, Trash2, ArrowUpCircle, CheckCircle2 } from "lucide-react";
import { AccessUser } from "../types/access.types";

export function UsersView() {
    const { users, auth, saveUser, deleteUser, syncUsers } = useAccessControl();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Form fields
    const [name, setName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [pin, setPin] = useState("");
    const [validFrom, setValidFrom] = useState("2026-01-01");
    const [validTo, setValidTo] = useState("2029-12-31");
    const [selectedDoors, setSelectedDoors] = useState<number[]>([1, 2, 3, 4]);

    const handleDoorToggle = (doorNum: number) => {
        setSelectedDoors((prev) =>
            prev.includes(doorNum) ? prev.filter((d) => d !== doorNum) : [...prev, doorNum]
        );
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !cardNumber) return;
        const ok = await saveUser({
            name,
            cardNumber: cardNumber.trim(),
            pin: pin.trim() || undefined,
            validFrom,
            validTo,
            doors: selectedDoors,
        });
        if (ok) {
            setMessage(`Cardholder "${name}" (Card ${cardNumber}) enrolled successfully.`);
            setName("");
            setCardNumber("");
            setPin("");
            setIsAddOpen(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const handleDelete = async (user: AccessUser) => {
        if (!confirm(`Are you sure you want to delete cardholder "${user.name}" (Card ${user.cardNumber})?`)) {
            return;
        }
        const ok = await deleteUser(user.cardNumber);
        if (ok) {
            setMessage(`Cardholder ${user.name} removed.`);
            setTimeout(() => setMessage(null), 3500);
        }
    };

    const handlePushSync = async () => {
        if (!auth.canWrite) {
            alert("Operator login required to push card records to boards.");
            return;
        }
        setIsSyncing(true);
        setMessage("Synchronizing card database into all online UHPPOTE boards (0x50 SetCard)...");
        const ok = await syncUsers();
        setIsSyncing(false);
        if (ok) {
            setMessage("Hardware card synchronization completed successfully.");
            setTimeout(() => setMessage(null), 4000);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold tracking-tight">Cardholders & Permissions</h2>
                    <p className="text-xs text-muted-foreground">
                        Manage Wiegand 26/34 credentials, PINs, and controller authorization schedules.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePushSync}
                        disabled={isSyncing || !auth.canWrite}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
                        title="Upload all users to hardware controller memory"
                    >
                        <ArrowUpCircle className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        <span>{isSyncing ? "Pushing to Boards..." : "Push to Hardware"}</span>
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        disabled={!auth.canWrite}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Cardholder</span>
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
                                <th className="px-4 py-3">Cardholder Name</th>
                                <th className="px-4 py-3">Card Number</th>
                                <th className="px-4 py-3">Authorized Doors</th>
                                <th className="px-4 py-3">Valid Range</th>
                                <th className="px-4 py-3">Hardware Sync</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No cardholders enrolled. Click &quot;Add Cardholder&quot; to register a card.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={String(u.cardNumber)} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{u.name}</div>
                                                {u.pin && <div className="text-[10px] text-muted-foreground">PIN Protected</div>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-foreground">
                                            {u.cardNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4].map((d) => (
                                                    <span
                                                        key={d}
                                                        className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${
                                                            u.doors && u.doors.includes(d)
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted text-muted-foreground/40"
                                                        }`}
                                                    >
                                                        D{d}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground text-[11px]">
                                            {u.validFrom || "2026-01-01"} ~ {u.validTo || "2029-12-31"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Synced</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(u)}
                                                disabled={!auth.canWrite}
                                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                                                title="Delete cardholder"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold">Enroll New Cardholder</h3>
                                <p className="text-xs text-muted-foreground">
                                    Register Wiegand RFID credentials and door authorizations.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-foreground block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-3 py-1.5 text-xs rounded-lg border bg-background"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-foreground block mb-1">
                                        Card Number (Wiegand)
                                    </label>
                                    <input
                                        type="number"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="e.g. 104523"
                                        className="w-full px-3 py-1.5 text-xs rounded-lg border bg-background font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-foreground block mb-1">
                                        Keypad PIN (Optional)
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={6}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        placeholder="4-6 digits"
                                        className="w-full px-3 py-1.5 text-xs rounded-lg border bg-background font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-foreground block mb-1">
                                    Door Access Permissions
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((d) => (
                                        <button
                                            type="button"
                                            key={d}
                                            onClick={() => handleDoorToggle(d)}
                                            className={`py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                                                selectedDoors.includes(d)
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-muted/50 text-muted-foreground"
                                            }`}
                                        >
                                            Door {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-foreground block mb-1">Valid From</label>
                                    <input
                                        type="date"
                                        value={validFrom}
                                        onChange={(e) => setValidFrom(e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs rounded-lg border bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-foreground block mb-1">Valid To</label>
                                    <input
                                        type="date"
                                        value={validTo}
                                        onChange={(e) => setValidTo(e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs rounded-lg border bg-background"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Save Cardholder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
