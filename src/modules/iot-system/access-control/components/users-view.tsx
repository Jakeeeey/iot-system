"use client";

import React, { useState, useMemo } from "react";
import { useAccessControl } from "../context/access-context";
import { AccessUser } from "../types/access.types";
import { parseRfidCard } from "../lib/card-format";
import {
    Users,
    UserPlus,
    Trash2,
    Edit3,
    ArrowUpCircle,
    CheckCircle2,
    Search,
    Shield,
    Layers,
    Download,
    Key,
    Database,
    Calendar,
    DoorClosed,
    Building2,
    Check,
} from "lucide-react";

export function UsersView() {
    const {
        controllers,
        doors,
        users,
        auth,
        saveUser,
        deleteUser,
        syncUsers,
        syncDirectus,
        batchUpdatePrivileges,
        selectedUserCards,
        toggleSelectUser,
        selectAllUsers,
        clearUserSelection,
    } = useAccessControl();

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("all");
    const [selectedDoorFilter, setSelectedDoorFilter] = useState("all");
    const [message, setMessage] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Add / Edit Modal state
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<string | number | null>(null);
    const [formName, setFormName] = useState("");
    const [formCardNumber, setFormCardNumber] = useState("");
    const [formPin, setFormPin] = useState("");
    const [formDept, setFormDept] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formValidFrom, setFormValidFrom] = useState("2024-01-01");
    const [formValidTo, setFormValidTo] = useState("2030-12-31");
    const [formNotes, setFormNotes] = useState("");
    const [formBoardDoors, setFormBoardDoors] = useState<Record<number, number[]>>({});

    // Batch Privilege Modal state
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchMode, setBatchMode] = useState<"grant" | "revoke" | "overwrite">("grant");
    const [batchBoardDoors, setBatchBoardDoors] = useState<Record<number, number[]>>({});
    const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

    // Departments list
    const departments = useMemo(() => {
        const set = new Set<string>();
        users.forEach((u) => {
            if (u.department) set.add(u.department);
        });
        return Array.from(set);
    }, [users]);

    // Live parsed card preview for the modal form
    const parsedCardPreview = useMemo(() => {
        return parseRfidCard(formCardNumber);
    }, [formCardNumber]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                !term ||
                String(u.cardNumber).includes(term) ||
                (u.rawCardNumber && u.rawCardNumber.includes(term)) ||
                u.name.toLowerCase().includes(term) ||
                (u.department || "").toLowerCase().includes(term) ||
                (u.pin || "").includes(term);

            const matchesDept = selectedDept === "all" || u.department === selectedDept;

            return matchesSearch && matchesDept;
        });
    }, [users, searchTerm, selectedDept]);

    const allSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserCards.includes(u.cardNumber));

    // Open Add User
    const handleOpenAddUser = (initialCard = "") => {
        setEditingCard(null);
        setFormName("");
        setFormCardNumber(initialCard);
        setFormPin("");
        setFormDept("General Operations");
        setFormPhone("");
        setFormValidFrom("2024-01-01");
        setFormValidTo("2030-12-31");
        setFormNotes("");

        // Default all doors selected
        const initDoors: Record<number, number[]> = {};
        controllers.forEach((c) => {
            initDoors[c.serialNumber] = [1, 2, 3, 4];
        });
        setFormBoardDoors(initDoors);
        setIsUserModalOpen(true);
    };

    // Open Edit User
    const handleOpenEditUser = (user: AccessUser) => {
        setEditingCard(user.cardNumber);
        setFormName(user.name);
        setFormCardNumber(String(user.cardNumber));
        setFormPin(user.pin || "");
        setFormDept(user.department || "");
        setFormPhone(user.phone || "");
        setFormValidFrom(user.validFrom || "2024-01-01");
        setFormValidTo(user.validTo || "2030-12-31");
        setFormNotes(user.notes || "");

        const doorsMap: Record<number, number[]> = {};
        controllers.forEach((c) => {
            doorsMap[c.serialNumber] = user.boardDoors?.[c.serialNumber] || user.doors || [1, 2, 3, 4];
        });
        setFormBoardDoors(doorsMap);
        setIsUserModalOpen(true);
    };

    const handleDoorToggleInForm = (sn: number, doorNum: number) => {
        setFormBoardDoors((prev) => {
            const current = prev[sn] || [];
            const next = current.includes(doorNum) ? current.filter((d) => d !== doorNum) : [...current, doorNum];
            return { ...prev, [sn]: next };
        });
    };

    const handleToggleAllDoorsInBoard = (sn: number) => {
        setFormBoardDoors((prev) => {
            const current = prev[sn] || [];
            const next = current.length === 4 ? [] : [1, 2, 3, 4];
            return { ...prev, [sn]: next };
        });
    };

    const handleSaveUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName || !formCardNumber) return;

        const allDoorsFlat: number[] = [];
        Object.values(formBoardDoors).forEach((ds) => {
            ds.forEach((d) => {
                if (!allDoorsFlat.includes(d)) allDoorsFlat.push(d);
            });
        });

        const ok = await saveUser({
            cardNumber: formCardNumber.trim(),
            rawCardNumber: parsedCardPreview?.raw10D || undefined,
            name: formName.trim(),
            department: formDept.trim() || undefined,
            phone: formPhone.trim() || undefined,
            pin: formPin.trim() || undefined,
            validFrom: formValidFrom,
            validTo: formValidTo,
            doors: allDoorsFlat,
            boardDoors: formBoardDoors,
            notes: formNotes.trim() || undefined,
            active: true,
        });

        if (ok) {
            setMessage(`Cardholder "${formName}" (Card ${formCardNumber}) saved.`);
            setIsUserModalOpen(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const handleDeleteUser = async (user: AccessUser) => {
        if (!confirm(`Are you sure you want to delete cardholder "${user.name}" (Card ${user.cardNumber})?`)) {
            return;
        }
        const ok = await deleteUser(user.cardNumber);
        if (ok) {
            setMessage(`Cardholder ${user.name} removed from database & controller memory.`);
            setTimeout(() => setMessage(null), 3500);
        }
    };

    const handleSyncToHardware = async () => {
        setIsSyncing(true);
        setMessage("Uploading cardholder records to hardware controller buffers (0x50)...");
        await syncUsers();
        setIsSyncing(false);
        setMessage("All cardholders synchronized with hardware memory.");
        setTimeout(() => setMessage(null), 4000);
    };

    const handleExportCsv = () => {
        const headers = ["Card Number", "Raw 10D", "Name", "Department", "PIN", "Valid From", "Valid To"];
        const rows = users.map((u) => [
            u.cardNumber,
            u.rawCardNumber || "",
            `"${u.name}"`,
            `"${u.department || ""}"`,
            u.pin || "",
            u.validFrom,
            u.validTo,
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `access_users_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Batch actions
    const handleOpenBatchModal = () => {
        const initDoors: Record<number, number[]> = {};
        controllers.forEach((c) => {
            initDoors[c.serialNumber] = [1, 2, 3, 4];
        });
        setBatchBoardDoors(initDoors);
        setIsBatchModalOpen(true);
    };

    const handleBatchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingBatch(true);
        const ok = await batchUpdatePrivileges({
            cardNumbers: selectedUserCards,
            doors: batchBoardDoors,
            mode: batchMode,
        });
        setIsSubmittingBatch(false);
        if (ok) {
            setMessage(`Batch privileges updated for ${selectedUserCards.length} cardholders.`);
            setIsBatchModalOpen(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border shadow-xs">
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search card, name, PIN, department..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border bg-background"
                        />
                    </div>

                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border bg-background"
                    >
                        <option value="all">All Departments</option>
                        {departments.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => handleOpenAddUser()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Cardholder</span>
                    </button>

                    <button
                        onClick={handleSyncToHardware}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border bg-card hover:bg-muted transition-colors disabled:opacity-50 shadow-xs"
                        title="Upload all cardholder permissions to UHPPOTE hardware memory"
                    >
                        <ArrowUpCircle className={`w-3.5 h-3.5 text-emerald-500 ${isSyncing ? "animate-spin" : ""}`} />
                        <span>Sync to Hardware</span>
                    </button>

                    <button
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border bg-card hover:bg-muted transition-colors shadow-xs"
                        title="Export Cardholders as CSV"
                    >
                        <Download className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Floating / Sticky Batch Actions Bar */}
            {selectedUserCards.length > 0 && (
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/30 shadow-sm animate-in fade-in duration-150">
                    <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                            {selectedUserCards.length} Cardholders Selected
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOpenBatchModal}
                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 shadow-xs"
                        >
                            Batch Edit Privileges
                        </button>
                        <button
                            onClick={clearUserSelection}
                            className="px-3 py-1.5 border bg-background hover:bg-muted rounded-lg text-xs font-medium text-muted-foreground"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {/* Alert Message */}
            {message && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {/* Users Data Table */}
            <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                            <tr>
                                <th className="px-4 py-3 w-8">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={(e) => selectAllUsers(e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="px-4 py-3">Cardholder Name</th>
                                <th className="px-4 py-3">Card Number & Wiegand</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">PIN Code</th>
                                <th className="px-4 py-3">Validity Window</th>
                                <th className="px-4 py-3">Door Authorizations</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-xs text-muted-foreground italic">
                                        No cardholders found matching the active filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isSelected = selectedUserCards.includes(user.cardNumber);
                                    const parsed = parseRfidCard(user.cardNumber);

                                    return (
                                        <tr
                                            key={user.cardNumber}
                                            className={`hover:bg-muted/30 transition-colors ${
                                                isSelected ? "bg-primary/5" : ""
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectUser(user.cardNumber)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <b className="font-semibold text-foreground block">{user.name}</b>
                                                        {user.phone && (
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                {user.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-mono">
                                                    <b className="text-cyan-600 dark:text-cyan-400 font-semibold">
                                                        {user.cardNumber}
                                                    </b>
                                                    <span className="text-[10px] text-muted-foreground block">
                                                        W26: {parsed?.wiegandStr || "---"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium">
                                                    {user.department || "General"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono">
                                                {user.pin ? (
                                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                                                        {user.pin}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">---</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                                                <div>{user.validFrom}</div>
                                                <div className="text-[10px]">to {user.validTo}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 flex-wrap max-w-xs">
                                                    {[1, 2, 3, 4].map((dNum) => {
                                                        const isAuth = user.doors?.includes(dNum);
                                                        return (
                                                            <span
                                                                key={dNum}
                                                                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                                                                    isAuth
                                                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                                                        : "bg-muted text-muted-foreground/50 border border-border"
                                                                }`}
                                                                title={`Door ${dNum} Authorization`}
                                                            >
                                                                D{dNum}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenEditUser(user)}
                                                        className="p-1.5 rounded-md border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                        title="Edit privileges and card settings"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="p-1.5 rounded-md border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                        title="Revoke and delete cardholder"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold">
                                        {editingCard ? "Edit Cardholder Privilege" : "Enroll Cardholder Privilege"}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Configure B07D575HN8 door permissions and validity dates.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsUserModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground text-lg leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSaveUserSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                        Card Number (Raw or W26)
                                    </label>
                                    <input
                                        type="text"
                                        value={formCardNumber}
                                        onChange={(e) => setFormCardNumber(e.target.value)}
                                        placeholder="e.g. 11156292 or 10D"
                                        className="w-full px-3 py-2 text-xs rounded-lg border bg-background font-mono"
                                        required
                                    />
                                    {parsedCardPreview && (
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
                                            Wiegand 26: {parsedCardPreview.wiegandStr}
                                            {parsedCardPreview.raw10D ? ` • 10D: ${parsedCardPreview.raw10D}` : ""}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="e.g. Carlos Rivera"
                                        className="w-full px-3 py-2 text-xs rounded-lg border bg-background"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                        Department / Division
                                    </label>
                                    <input
                                        type="text"
                                        value={formDept}
                                        onChange={(e) => setFormDept(e.target.value)}
                                        placeholder="e.g. Security, IT, Facilities"
                                        className="w-full px-3 py-2 text-xs rounded-lg border bg-background"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                        PIN Code (Optional, 6-digits)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={formPin}
                                        onChange={(e) => setFormPin(e.target.value)}
                                        placeholder="e.g. 449102"
                                        className="w-full px-3 py-2 text-xs rounded-lg border bg-background font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                        Valid From (Start Date)
                                    </label>
                                    <input
                                        type="date"
                                        value={formValidFrom}
                                        onChange={(e) => setFormValidFrom(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border bg-background font-mono"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">
                                        Valid To (End Date)
                                    </label>
                                    <input
                                        type="date"
                                        value={formValidTo}
                                        onChange={(e) => setFormValidTo(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border bg-background font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Door Privileges per controller */}
                            <div className="space-y-2 pt-2 border-t">
                                <label className="text-xs font-semibold text-foreground block">
                                    Door Access Authorizations
                                </label>
                                <div className="space-y-3">
                                    {controllers.map((ctrl) => {
                                        const assignedDoors = formBoardDoors[ctrl.serialNumber] || [];
                                        return (
                                            <div key={ctrl.serialNumber} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-foreground">
                                                        {ctrl.name || `Panel SN ${ctrl.serialNumber}`}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleAllDoorsInBoard(ctrl.serialNumber)}
                                                        className="text-[11px] text-primary hover:underline font-medium"
                                                    >
                                                        {assignedDoors.length === 4 ? "Deselect All" : "Select All 4 Doors"}
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-4 gap-2">
                                                    {[1, 2, 3, 4].map((dNum) => {
                                                        const isChecked = assignedDoors.includes(dNum);
                                                        const doorName = ctrl.doors?.[dNum]?.name || `Door ${dNum}`;
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={dNum}
                                                                onClick={() => handleDoorToggleInForm(ctrl.serialNumber, dNum)}
                                                                className={`p-2 rounded-lg border text-center text-xs transition-colors ${
                                                                    isChecked
                                                                        ? "bg-primary text-primary-foreground font-semibold border-primary"
                                                                        : "bg-background text-muted-foreground hover:bg-muted"
                                                                }`}
                                                            >
                                                                <span className="block font-bold">Door {dNum}</span>
                                                                <span className="text-[10px] truncate block opacity-80">{doorName}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className="px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs"
                                >
                                    Save & Sync with Controllers
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Batch Privilege Modal */}
            {isBatchModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold">Batch Privilege Management</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Apply door authorizations across {selectedUserCards.length} selected cardholders.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsBatchModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground text-lg leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleBatchSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1.5">
                                    Operation Mode
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setBatchMode("grant")}
                                        className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                                            batchMode === "grant"
                                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                                : "bg-background text-muted-foreground hover:bg-muted"
                                        }`}
                                    >
                                        Grant Doors
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBatchMode("revoke")}
                                        className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                                            batchMode === "revoke"
                                                ? "bg-destructive text-destructive-foreground border-destructive shadow-xs"
                                                : "bg-background text-muted-foreground hover:bg-muted"
                                        }`}
                                    >
                                        Revoke Doors
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBatchMode("overwrite")}
                                        className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                                            batchMode === "overwrite"
                                                ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                                                : "bg-background text-muted-foreground hover:bg-muted"
                                        }`}
                                    >
                                        Overwrite All
                                    </button>
                                </div>
                            </div>

                            {/* Batch door picker */}
                            <div className="space-y-3 pt-2">
                                <label className="text-xs font-semibold text-foreground block">
                                    Target Doors
                                </label>
                                {controllers.map((ctrl) => {
                                    const assigned = batchBoardDoors[ctrl.serialNumber] || [];
                                    return (
                                        <div key={ctrl.serialNumber} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                                            <span className="font-semibold text-xs text-foreground block">
                                                {ctrl.name || `Panel SN ${ctrl.serialNumber}`}
                                            </span>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[1, 2, 3, 4].map((dNum) => {
                                                    const isChecked = assigned.includes(dNum);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={dNum}
                                                            onClick={() => {
                                                                setBatchBoardDoors((prev) => {
                                                                    const cur = prev[ctrl.serialNumber] || [];
                                                                    const next = cur.includes(dNum) ? cur.filter((d) => d !== dNum) : [...cur, dNum];
                                                                    return { ...prev, [ctrl.serialNumber]: next };
                                                                });
                                                            }}
                                                            className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${
                                                                isChecked
                                                                    ? "bg-primary text-primary-foreground border-primary"
                                                                    : "bg-background text-muted-foreground hover:bg-muted"
                                                            }`}
                                                        >
                                                            Door {dNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsBatchModalOpen(false)}
                                    className="px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingBatch}
                                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs disabled:opacity-50"
                                >
                                    {isSubmittingBatch ? "Applying to Controllers..." : "Apply Batch Privileges"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
