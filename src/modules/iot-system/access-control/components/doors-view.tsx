"use client";

import React, { useState } from "react";
import { useAccessControl, FlatDoor } from "../context/access-context";
import { DoorClosed, Unlock, CheckCircle2 } from "lucide-react";
import { DoorControlMode } from "../types/access.types";

export function DoorsView() {
    const { doors, auth, pulseDoor, setDoorMode, isGatewayOnline } = useAccessControl();
    const [pulsingId, setPulsingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [filterOnline, setFilterOnline] = useState<boolean>(false);

    const handlePulse = async (door: FlatDoor) => {
        if (!auth.canWrite) {
            alert("Operator login required to pulse doors.");
            return;
        }
        setPulsingId(door.id);
        const ok = await pulseDoor(door.serialNumber, door.doorNumber);
        setPulsingId(null);
        if (ok) {
            setFeedback(`Door ${door.doorNumber} on ${door.controllerName} unlocked for 5s`);
            setTimeout(() => setFeedback(null), 4000);
        }
    };

    const handleModeChange = async (door: FlatDoor, mode: DoorControlMode) => {
        if (!auth.canWrite) {
            alert("Operator login required to change door mode.");
            return;
        }
        await setDoorMode(door.serialNumber, door.doorNumber, mode);
    };

    const filteredDoors = filterOnline ? doors.filter((d) => d.online) : doors;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold tracking-tight">Doors & Real-Time Monitoring</h2>
                    <p className="text-xs text-muted-foreground">
                        Live status and pulse commands for all controller-managed doors.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none border rounded-lg px-3 py-1.5 hover:bg-muted/50">
                        <input
                            type="checkbox"
                            checked={filterOnline}
                            onChange={(e) => setFilterOnline(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>Online Boards Only</span>
                    </label>
                </div>
            </div>

            {feedback && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{feedback}</span>
                </div>
            )}

            {!isGatewayOnline && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
                    ⚠️ The hardware UDP gateway (Port 60000) is unreachable. Please verify server status on port 3001.
                </div>
            )}

            {filteredDoors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                    <DoorClosed className="w-12 h-12 mb-3 stroke-1 text-muted-foreground/50" />
                    <p className="text-sm font-semibold">No doors discovered</p>
                    <p className="text-xs">Connect UHPPOTE boards to your LAN and run a Network Scan in the Controllers tab.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDoors.map((door) => {
                        const isPulsing = pulsingId === door.id;
                        return (
                            <div
                                key={door.id}
                                className={`rounded-xl border p-4 bg-card shadow-xs transition-all hover:shadow-md flex flex-col justify-between gap-4 ${
                                    !door.online ? "opacity-60 grayscale-50" : ""
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    door.mode === "normally_open"
                                                        ? "bg-emerald-500/10 text-emerald-500"
                                                        : door.mode === "normally_closed"
                                                        ? "bg-red-500/10 text-red-500"
                                                        : "bg-primary/10 text-primary"
                                                }`}
                                            >
                                                {door.mode === "normally_open" ? (
                                                    <Unlock className="w-4 h-4" />
                                                ) : (
                                                    <DoorClosed className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold truncate">{door.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    SN:{door.serialNumber} • Door {door.doorNumber}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
                                                door.online
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            {door.online ? "ONLINE" : "OFFLINE"}
                                        </span>
                                    </div>

                                    <div className="text-xs space-y-1 pt-1">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Mode:</span>
                                            <span className="font-medium text-foreground capitalize">
                                                {door.mode.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Board:</span>
                                            <span className="font-mono text-[11px] truncate max-w-[140px]">
                                                {door.controllerName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t">
                                    <button
                                        onClick={() => handlePulse(door)}
                                        disabled={!door.online || isPulsing || !auth.canWrite}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
                                    >
                                        <Unlock className={`w-3.5 h-3.5 ${isPulsing ? "animate-pulse" : ""}`} />
                                        <span>{isPulsing ? "Pulsing Relay..." : "Pulse Unlock (5s)"}</span>
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <label className="text-[11px] text-muted-foreground shrink-0">Mode:</label>
                                        <select
                                            value={door.mode}
                                            disabled={!door.online || !auth.canWrite}
                                            onChange={(e) =>
                                                handleModeChange(door, e.target.value as DoorControlMode)
                                            }
                                            className="w-full text-xs py-1 px-2 rounded-md border bg-background disabled:opacity-50"
                                        >
                                            <option value="controlled">Controlled (Card badge only)</option>
                                            <option value="normally_open">Hold Open (Always Unlocked)</option>
                                            <option value="normally_closed">Always Locked</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
