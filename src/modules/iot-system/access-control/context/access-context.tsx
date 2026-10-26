"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    ControllerDevice,
    AccessUser,
    AccessEventLog,
    EmergencyState,
    DoorControlMode,
    AuthStatusResponse,
} from "../types/access.types";
import { accessService } from "../services/access-service";

export interface FlatDoor {
    id: string;
    serialNumber: number;
    doorNumber: number;
    controllerName: string;
    name: string;
    mode: DoorControlMode;
    status: "open" | "closed" | "unknown";
    online: boolean;
}

interface AccessContextValue {
    controllers: ControllerDevice[];
    doors: FlatDoor[];
    users: AccessUser[];
    recentEvents: AccessEventLog[];
    emergencyState: EmergencyState;
    auth: AuthStatusResponse;
    isGatewayOnline: boolean;
    isLoading: boolean;
    error: string | null;
    refreshAll: () => Promise<void>;
    pulseDoor: (serialNumber: number, doorNumber: number) => Promise<boolean>;
    setDoorMode: (serialNumber: number, doorNumber: number, mode: DoorControlMode) => Promise<boolean>;
    scanNetwork: () => Promise<boolean>;
    syncTime: (serialNumber?: number) => Promise<boolean>;
    saveUser: (user: Partial<AccessUser>) => Promise<boolean>;
    deleteUser: (cardNumber: string | number) => Promise<boolean>;
    syncUsers: () => Promise<boolean>;
    triggerLockdown: (notes?: string) => Promise<boolean>;
    triggerOpenAll: (notes?: string) => Promise<boolean>;
    restoreNormal: (notes?: string) => Promise<boolean>;
    login: (token: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AccessContext = createContext<AccessContextValue | null>(null);

const DEFAULT_AUTH: AuthStatusResponse = {
    role: "viewer",
    authenticated: false,
    canWrite: false,
    canAdminister: false,
    hasSuperadminConfigured: false,
};

export function AccessProvider({ children }: { children: React.ReactNode }) {
    const [controllers, setControllers] = useState<ControllerDevice[]>([]);
    const [users, setUsers] = useState<AccessUser[]>([]);
    const [recentEvents, setRecentEvents] = useState<AccessEventLog[]>([]);
    const [emergencyState, setEmergencyState] = useState<EmergencyState>("NORMAL");
    const [auth, setAuth] = useState<AuthStatusResponse>(DEFAULT_AUTH);
    const [isGatewayOnline, setIsGatewayOnline] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refreshAll = useCallback(async () => {
        try {
            const [ctrlRes, userRes, histRes, emergRes, authRes] = await Promise.allSettled([
                accessService.getControllers(),
                accessService.getUsers(),
                accessService.getHistory(50),
                accessService.getEmergencyStatus(),
                accessService.getAuthStatus(),
            ]);

            let reachable = false;

            if (ctrlRes.status === "fulfilled" && ctrlRes.value.success) {
                setControllers(ctrlRes.value.controllers);
                reachable = true;
            }

            if (userRes.status === "fulfilled" && userRes.value.success) {
                setUsers(userRes.value.users);
                reachable = true;
            }

            if (histRes.status === "fulfilled" && histRes.value.success) {
                setRecentEvents(histRes.value.events);
                reachable = true;
            }

            if (emergRes.status === "fulfilled") {
                setEmergencyState(emergRes.value.status || "NORMAL");
                reachable = true;
            }

            if (authRes.status === "fulfilled") {
                setAuth(authRes.value);
            }

            setIsGatewayOnline(reachable);
            setError(null);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error connecting to access gateway";
            setError(msg);
            setIsGatewayOnline(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAll();
        const interval = setInterval(refreshAll, 6000);
        return () => clearInterval(interval);
    }, [refreshAll]);

    const doors: FlatDoor[] = React.useMemo(() => {
        const flat: FlatDoor[] = [];
        for (const ctrl of controllers) {
            const ctrlName = ctrl.name || `Board-${ctrl.serialNumber}`;
            for (let d = 1; d <= 4; d++) {
                const doorData = ctrl.doors ? ctrl.doors[d] : undefined;
                flat.push({
                    id: `${ctrl.serialNumber}-${d}`,
                    serialNumber: ctrl.serialNumber,
                    doorNumber: d,
                    controllerName: ctrlName,
                    name: doorData?.name || `${ctrlName} - Door ${d}`,
                    mode: doorData?.mode || "controlled",
                    status: doorData?.status || "unknown",
                    online: ctrl.online,
                });
            }
        }
        return flat;
    }, [controllers]);

    const pulseDoor = async (serialNumber: number, doorNumber: number): Promise<boolean> => {
        try {
            await accessService.pulseDoor(serialNumber, doorNumber);
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Pulse door failed";
            setError(msg);
            return false;
        }
    };

    const setDoorMode = async (serialNumber: number, doorNumber: number, mode: DoorControlMode): Promise<boolean> => {
        try {
            await accessService.setDoorMode(serialNumber, doorNumber, mode);
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Set door mode failed";
            setError(msg);
            return false;
        }
    };

    const scanNetwork = async (): Promise<boolean> => {
        try {
            await accessService.scanNetwork();
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Scan failed";
            setError(msg);
            return false;
        }
    };

    const syncTime = async (serialNumber?: number): Promise<boolean> => {
        try {
            await accessService.syncTime(serialNumber);
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Sync time failed";
            setError(msg);
            return false;
        }
    };

    const saveUser = async (user: Partial<AccessUser>): Promise<boolean> => {
        try {
            await accessService.saveUser(user);
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Save cardholder failed";
            setError(msg);
            return false;
        }
    };

    const deleteUser = async (cardNumber: string | number): Promise<boolean> => {
        try {
            await accessService.deleteUser(cardNumber);
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Delete cardholder failed";
            setError(msg);
            return false;
        }
    };

    const syncUsers = async (): Promise<boolean> => {
        try {
            await accessService.syncUsers();
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Hardware sync failed";
            setError(msg);
            return false;
        }
    };

    const triggerLockdown = async (notes?: string): Promise<boolean> => {
        try {
            await accessService.triggerLockdown(notes);
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Lockdown command failed";
            setError(msg);
            return false;
        }
    };

    const triggerOpenAll = async (notes?: string): Promise<boolean> => {
        try {
            await accessService.triggerOpenAll(notes);
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Open all command failed";
            setError(msg);
            return false;
        }
    };

    const restoreNormal = async (notes?: string): Promise<boolean> => {
        try {
            await accessService.restoreNormal(notes);
            await refreshAll();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Restore normal command failed";
            setError(msg);
            return false;
        }
    };

    const login = async (token: string): Promise<boolean> => {
        try {
            const res = await accessService.login(token);
            if (res.success) {
                await refreshAll();
                return true;
            }
            return false;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Login failed";
            setError(msg);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await accessService.logout();
            await refreshAll();
        } catch {
            setAuth(DEFAULT_AUTH);
        }
    };

    return (
        <AccessContext.Provider
            value={{
                controllers,
                doors,
                users,
                recentEvents,
                emergencyState,
                auth,
                isGatewayOnline,
                isLoading,
                error,
                refreshAll,
                pulseDoor,
                setDoorMode,
                scanNetwork,
                syncTime,
                saveUser,
                deleteUser,
                syncUsers,
                triggerLockdown,
                triggerOpenAll,
                restoreNormal,
                login,
                logout,
            }}
        >
            {children}
        </AccessContext.Provider>
    );
}

export function useAccessControl() {
    const ctx = useContext(AccessContext);
    if (!ctx) {
        throw new Error("useAccessControl must be used within an AccessProvider");
    }
    return ctx;
}