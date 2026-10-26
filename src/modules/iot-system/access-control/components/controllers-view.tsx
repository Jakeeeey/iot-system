"use client";

import React, { useState } from "react";
import { useAccessControl, FlatDoor } from "../context/access-context";
import { ControllerDevice, DoorControlMode } from "../types/access.types";
import {
    Server,
    RefreshCw,
    Clock,
    CheckCircle2,
    Search,
    Unlock,
    Lock,
    Settings,
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    List,
    AlignJustify,
    Shield,
    Wifi,
    Cpu,
    Radio,
} from "lucide-react";

export function ControllersView() {
    const {
        controllers,
        doors,
        auth,
        scanNetwork,
        syncTime,
        pulseDoor,
        setDoorMode,
        updateDoorConfig,
        updateControllerConfig,
    } = useAccessControl();

    const [isScanning, setIsScanning] = useState(false);
    const [syncingSn, setSyncingSn] = useState<number | null>(null);
    const [pulsingDoorId, setPulsingDoorId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"detailed" | "compact" | "table">("detailed");
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [expandedMetaSn, setExpandedMetaSn] = useState<Record<number, boolean>>({});

    // Door Config Modal state
    const [configDoor, setConfigDoor] = useState<FlatDoor | null>(null);
    const [modalDoorName, setModalDoorName] = useState("");
    const [modalDoorDelay, setModalDoorDelay] = useState(5);
    const [modalDoorMode, setModalDoorMode] = useState<DoorControlMode>("controlled");
    const [modalPasscodes, setModalPasscodes] = useState<string>("");

    const handleScan = async () => {
        setIsScanning(true);
        setMessage("Performing live network broadcast and unicast sweep on port 60000...");
        await scanNetwork();
        setIsScanning(false);
        setMessage("Network scan complete. Controller panels updated.");
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
            setMessage(`Controller SN ${sn} hardware clock synchronized.`);
            setTimeout(() => setMessage(null), 3500);
        }
    };

    const handlePulse = async (door: FlatDoor) => {
        if (!auth.canWrite) {
            alert("Operator login required to pulse doors.");
            return;
        }
        setPulsingDoorId(door.id);
        const ok = await pulseDoor(door.serialNumber, door.doorNumber);
        setPulsingDoorId(null);
        if (ok) {
            setMessage(`Door ${door.doorNumber} (${door.name}) unlocked for ${door.delaySeconds}s.`);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const openDoorModal = (door: FlatDoor) => {
        setConfigDoor(door);
        setModalDoorName(door.name);
        setModalDoorDelay(door.delaySeconds || 5);
        setModalDoorMode(door.mode || "controlled");
        setModalPasscodes((door.passcodes || []).join(", "));
    };

    const handleSaveDoorConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!configDoor) return;
        const passcodes = modalPasscodes
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0);

        const ok = await updateDoorConfig(configDoor.serialNumber, configDoor.doorNumber, {
            name: modalDoorName,
            delaySeconds: Number(modalDoorDelay),
            mode: modalDoorMode,
            passcodes,
        });

        if (ok) {
            setMessage(`Door configuration saved for ${modalDoorName}.`);
            setConfigDoor(null);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const toggleMeta = (sn: number) => {
        setExpandedMetaSn((prev) => ({ ...prev, [sn]: !prev[sn] }));
    };

    const filteredControllers = controllers.filter((c) => {
        const term = searchTerm.toLowerCase();
        return (
            !term ||
            String(c.serialNumber).includes(term) ||
            (c.name || "").toLowerCase().includes(term) ||
            (c.ip || "").includes(term) ||
            (c.mac || "").toLowerCase().includes(term)
        );
    });

    return (
        <div className="space-y-5">
            {/* Scanner Toolbar & View Modes */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border shadow-xs">
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[240px]">
                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                        <span>{isScanning ? "Scanning Subnet (60000)..." : "Scan Subnet / UDP"}</span>
                    </button>

                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by SN, IP, name, or MAC..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border bg-background"
                        />
                    </div>
                </div>

                {/* View Switchers */}
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border text-xs">
                    <button
                        onClick={() => setViewMode("detailed")}
                        title="Detailed Card View"
                        className={`p-1.5 rounded-md transition-colors ${
                            viewMode === "detailed" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("compact")}
                        title="Compact View"
                        className={`p-1.5 rounded-md transition-colors ${
                            viewMode === "compact" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <AlignJustify className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        title="Table View"
                        className={`p-1.5 rounded-md transition-colors ${
                            viewMode === "table" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <List className="w-4 h-4" />
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

            {/* Main Controllers Rendering */}
            {filteredControllers.length === 0 ? (
                <div className="p-12 text-center border rounded-2xl bg-card text-muted-foreground text-xs space-y-2">
                    <Server className="w-8 h-8 mx-auto text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">No controller panels discovered.</p>
                    <p>Click &quot;Scan Subnet / UDP&quot; to broadcast discovery packets across local network interfaces.</p>
                </div>
            ) : viewMode === "table" ? (
                /* Table View */
                <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Panel Name</th>
                                    <th className="px-4 py-3">Serial Number</th>
                                    <th className="px-4 py-3">IP Address : Port</th>
                                    <th className="px-4 py-3">MAC Address</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Doors</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredControllers.map((ctrl) => {
                                    const ctrlDoors = doors.filter((d) => d.serialNumber === ctrl.serialNumber);
                                    return (
                                        <tr key={ctrl.serialNumber} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-foreground">
                                                {ctrl.name || `Panel SN ${ctrl.serialNumber}`}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-cyan-600 dark:text-cyan-400">
                                                {ctrl.serialNumber}
                                            </td>
                                            <td className="px-4 py-3 font-mono">
                                                {ctrl.ip}:{ctrl.port}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-muted-foreground">
                                                {ctrl.mac}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Online
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {ctrlDoors.length} doors configured
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleSyncTime(ctrl.serialNumber)}
                                                    disabled={syncingSn === ctrl.serialNumber}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] hover:bg-muted font-medium transition-colors"
                                                >
                                                    <Clock className="w-3 h-3" />
                                                    <span>Sync Time</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Detailed & Compact Card Views */
                <div className="space-y-5">
                    {filteredControllers.map((ctrl) => {
                        const ctrlDoors = doors.filter((d) => d.serialNumber === ctrl.serialNumber);
                        const isExpanded = Boolean(expandedMetaSn[ctrl.serialNumber]);

                        return (
                            <div
                                key={ctrl.serialNumber}
                                className="rounded-2xl border bg-card shadow-xs overflow-hidden transition-all hover:border-primary/30"
                            >
                                {/* Card Header */}
                                <div className="p-4 sm:p-5 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                                            <Cpu className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-bold tracking-tight text-foreground">
                                                    {ctrl.name || `Panel SN ${ctrl.serialNumber}`}
                                                </h3>
                                                <span className="font-mono text-xs text-primary font-semibold">
                                                    SN: {ctrl.serialNumber}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Online
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 font-mono">
                                                <span>IP: {ctrl.ip}:{ctrl.port}</span>
                                                <span>•</span>
                                                <span>MAC: {ctrl.mac}</span>
                                                {ctrl.version && (
                                                    <>
                                                        <span>•</span>
                                                        <span>FW: {ctrl.version}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Header Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSyncTime(ctrl.serialNumber)}
                                            disabled={syncingSn === ctrl.serialNumber}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
                                            title="Synchronize hardware clock with server time (Command 0x30)"
                                        >
                                            <Clock className={`w-3.5 h-3.5 ${syncingSn === ctrl.serialNumber ? "animate-spin" : ""}`} />
                                            <span>Sync Time</span>
                                        </button>

                                        <button
                                            onClick={() => toggleMeta(ctrl.serialNumber)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted text-muted-foreground transition-colors"
                                        >
                                            <span>Hardware Info</span>
                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Hardware Metadata Drawer */}
                                {isExpanded && (
                                    <div className="p-4 bg-muted/30 border-b text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-150 font-mono">
                                        <div>
                                            <span className="text-muted-foreground block text-[10px]">Subnet Mask</span>
                                            <b>{ctrl.mask || "255.255.255.0"}</b>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-[10px]">Gateway</span>
                                            <b>{ctrl.gateway || "192.168.1.1"}</b>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-[10px]">Socket Status</span>
                                            <b className="text-emerald-600 dark:text-emerald-400">{ctrl.socketStatus || "CONNECTED"}</b>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-[10px]">Hardware Release</span>
                                            <b>{ctrl.releaseDate || "2024-03-15"}</b>
                                        </div>
                                    </div>
                                )}

                                {/* Doors Grid for this Controller */}
                                <div className="p-4 sm:p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                        {ctrlDoors.map((door) => {
                                            const isPulsing = pulsingDoorId === door.id;
                                            return (
                                                <div
                                                    key={door.id}
                                                    className="p-3.5 rounded-xl border bg-background hover:border-primary/40 transition-all space-y-3"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center font-bold text-[11px] text-muted-foreground">
                                                                    {door.doorNumber}
                                                                </span>
                                                                <h4 className="text-xs font-bold text-foreground truncate max-w-[140px]">
                                                                    {door.name}
                                                                </h4>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">
                                                                Relay: {door.delaySeconds}s pulse
                                                            </span>
                                                        </div>

                                                        <span
                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                                                                door.mode === "controlled"
                                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                                    : door.mode === "normally_open"
                                                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                                                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                                            }`}
                                                        >
                                                            {door.mode.replace("_", " ")}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 pt-1">
                                                        <button
                                                            onClick={() => handlePulse(door)}
                                                            disabled={isPulsing}
                                                            className="flex-1 py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                                            title="Send 0x40 UDP Pulse Unlock to this door"
                                                        >
                                                            <Unlock className={`w-3.5 h-3.5 ${isPulsing ? "animate-pulse" : ""}`} />
                                                            <span>{isPulsing ? "Pulsing..." : "Pulse Unlock"}</span>
                                                        </button>

                                                        <button
                                                            onClick={() => openDoorModal(door)}
                                                            className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground transition-colors"
                                                            title="Configure Door Mode, Delay & Passcodes"
                                                        >
                                                            <Settings className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Configure Door Settings Modal */}
            {configDoor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold">Configure Door Parameters</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Door {configDoor.doorNumber} on {configDoor.controllerName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setConfigDoor(null)}
                                className="text-muted-foreground hover:text-foreground text-lg leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSaveDoorConfig} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">
                                    Door Display Name
                                </label>
                                <input
                                    type="text"
                                    value={modalDoorName}
                                    onChange={(e) => setModalDoorName(e.target.value)}
                                    placeholder="e.g. Main Lobby Entrance Turnstile"
                                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                        Pulse Delay (Seconds)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="600"
                                        value={modalDoorDelay}
                                        onChange={(e) => setModalDoorDelay(Number(e.target.value))}
                                        className="w-full px-3 py-2 text-xs rounded-lg border bg-background"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                        Relay Mode
                                    </label>
                                    <select
                                        value={modalDoorMode}
                                        onChange={(e) => setModalDoorMode(e.target.value as DoorControlMode)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border bg-background"
                                    >
                                        <option value="controlled">Controlled</option>
                                        <option value="normally_open">Normally Open</option>
                                        <option value="normally_closed">Normally Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">
                                    Keypad Door Passcodes (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={modalPasscodes}
                                    onChange={(e) => setModalPasscodes(e.target.value)}
                                    placeholder="e.g. 1234, 5678, 9999"
                                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background font-mono"
                                />
                                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                                    Hardware keypad codes programmed directly into controller memory.
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setConfigDoor(null)}
                                    className="px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs"
                                >
                                    Save Door Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
