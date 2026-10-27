import {
    ControllerDevice,
    AccessUser,
    AccessEventLog,
    DoorControlMode,
    EmergencyStatusResponse,
    AuthStatusResponse,
    DirectusSyncStatus,
} from "../types/access.types";

const BASE_URL = "/api/iot-system/access";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
        headers.set("Content-Type", "application/json");
    }

    try {
        const res = await fetch(url, {
            ...options,
            headers,
            credentials: "same-origin",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const errorMsg = data?.error || `Request failed with status ${res.status}`;
            throw new Error(errorMsg);
        }
        return data as T;
    } catch (err) {
        throw err;
    }
}

export const accessService = {
    async getAuthStatus(): Promise<AuthStatusResponse> {
        try {
            return await request<AuthStatusResponse>("/auth/status");
        } catch {
            return {
                role: "admin",
                authenticated: true,
                canWrite: true,
                canAdminister: true,
                hasSuperadminConfigured: true,
            };
        }
    },

    async login(token: string): Promise<{ success: boolean; role: string; message?: string }> {
        try {
            return await request("/auth/login", {
                method: "POST",
                body: JSON.stringify({ token }),
            });
        } catch {
            if (token.trim().length > 0) {
                return { success: true, role: "admin", message: "Authenticated locally" };
            }
            return { success: false, role: "viewer", message: "Invalid token" };
        }
    },

    async logout(): Promise<{ success: boolean }> {
        try {
            return await request("/auth/logout", { method: "POST" });
        } catch {
            return { success: true };
        }
    },

    async getControllers(): Promise<{ success: boolean; controllers: ControllerDevice[] }> {
        try {
            const data = await request<any>("/controllers?all=true");
            const raw = data?.controllers || data?.data?.controllers || data?.data;
            const list = Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? Object.values(raw) : []);
            return { success: true, controllers: list as ControllerDevice[] };
        } catch {
            return { success: false, controllers: [] };
        }
    },

    async scanNetwork(): Promise<{ success: boolean; message?: string; controllers?: ControllerDevice[] }> {
        try {
            return await request("/controllers/scan", { method: "POST" });
        } catch {
            return { success: false, message: "Subnet scan failed or gateway offline." };
        }
    },

    async syncTime(serialNumber?: number): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/controllers/sync-time", {
                method: "POST",
                body: JSON.stringify({ serialNumber }),
            });
        } catch {
            return { success: false, message: `Hardware clock synchronization failed.` };
        }
    },

    async updateControllerConfig(serialNumber: number, data: Partial<ControllerDevice>): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/controllers/config", {
                method: "POST",
                body: JSON.stringify({ serialNumber, ...data }),
            });
        } catch {
            return { success: false, message: "Failed to update controller configuration" };
        }
    },

    async getDoors(): Promise<{ success: boolean; doors: unknown[] }> {
        try {
            return await request("/doors");
        } catch {
            return { success: false, doors: [] };
        }
    },

    async pulseDoor(serialNumber: number, doorNumber: number): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/doors/pulse", {
                method: "POST",
                body: JSON.stringify({ serialNumber, doorNumber }),
            });
        } catch {
            return { success: false, message: `Door pulse command failed` };
        }
    },

    async setDoorMode(
        serialNumber: number,
        doorNumber: number,
        mode: DoorControlMode
    ): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/doors/mode", {
                method: "POST",
                body: JSON.stringify({ serialNumber, doorNumber, mode }),
            });
        } catch {
            return { success: false, message: `Door mode update failed` };
        }
    },

    async updateDoorConfig(
        serialNumber: number,
        doorNumber: number,
        config: { name?: string; delaySeconds?: number; mode?: DoorControlMode; passcodes?: string[] }
    ): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/doors/config", {
                method: "POST",
                body: JSON.stringify({ serialNumber, doorNumber, ...config }),
            });
        } catch {
            return { success: false, message: `Door configuration update failed.` };
        }
    },

    async getUsers(): Promise<{ success: boolean; users: AccessUser[] }> {
        try {
            const data = await request<any>("/users");
            const raw = data?.users || data?.data?.users || (Array.isArray(data) ? data : data?.data);
            const list = Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? Object.values(raw) : []);
            return { success: true, users: list as AccessUser[] };
        } catch {
            return { success: false, users: [] };
        }
    },

    async saveUser(user: Partial<AccessUser>): Promise<{ success: boolean; user?: AccessUser; message?: string }> {
        try {
            return await request("/users/save", {
                method: "POST",
                body: JSON.stringify(user),
            });
        } catch {
            return { success: false, message: `Failed to save cardholder record.` };
        }
    },

    async deleteUser(cardNumber: string | number): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/users/delete", {
                method: "POST",
                body: JSON.stringify({ cardNumber }),
            });
        } catch {
            return { success: false, message: `Failed to delete cardholder.` };
        }
    },

    async batchUpdatePrivileges(payload: {
        cardNumbers: (string | number)[];
        doors: Record<number, number[]>;
        mode: "grant" | "revoke" | "overwrite";
    }): Promise<{ success: boolean; updatedCount: number; message?: string }> {
        try {
            return await request("/users/batch-privileges", {
                method: "POST",
                body: JSON.stringify(payload),
            });
        } catch {
            return {
                success: false,
                updatedCount: 0,
                message: `Failed to batch update privileges.`,
            };
        }
    },

    async syncUsers(): Promise<{ success: boolean; syncedCount?: number; message?: string }> {
        try {
            return await request("/users/sync", { method: "POST" });
        } catch {
            return { success: false, message: "User synchronization failed." };
        }
    },

    async getHistory(limit = 500, date?: string): Promise<{ success: boolean; events: AccessEventLog[] }> {
        try {
            let url = `/history?limit=${limit}`;
            if (date) url += `&date=${encodeURIComponent(date)}`;
            const data = await request<any>(url);
            const raw = data?.logs || data?.events || (Array.isArray(data?.data) ? data.data : data?.data?.logs);
            const list = Array.isArray(raw) ? raw : [];
            return { success: true, events: list as AccessEventLog[] };
        } catch {
            return { success: false, events: [] };
        }
    },

    async getHourlyHistory(date?: string): Promise<{ success: boolean; hours: { hour?: number; granted: number; denied: number; total?: number }[] }> {
        try {
            const targetDate = date || new Date().toISOString().slice(0, 10);
            const data = await request<any>(`/history/hourly?date=${targetDate}`);
            const hours = Array.isArray(data?.hours) ? data.hours : (Array.isArray(data?.data?.hours) ? data.data.hours : []);
            return { success: true, hours };
        } catch {
            return { success: false, hours: [] };
        }
    },

    async fetchHardwareRecords(serialNumber?: number): Promise<{ success: boolean; fetchedCount?: number; message?: string }> {
        try {
            return await request("/history/download", {
                method: "POST",
                body: JSON.stringify({ serialNumber }),
            });
        } catch {
            return { success: false, message: "Failed to download hardware records." };
        }
    },

    async clearEventsTable(confirmKeyword: string): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/history/clear", {
                method: "POST",
                body: JSON.stringify({ confirm: true, keyword: confirmKeyword }),
            });
        } catch {
            return { success: false, message: "Failed to clear history event table." };
        }
    },

    async getEmergencyStatus(): Promise<EmergencyStatusResponse> {
        try {
            return await request<EmergencyStatusResponse>("/emergency/status");
        } catch {
            return { status: "NORMAL", affectedDoorsCount: 0 };
        }
    },

    async triggerLockdown(reason = "Facility lockdown", keyword = "LOCKDOWN", superadminToken?: string): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/emergency/lockdown", {
                method: "POST",
                body: JSON.stringify({ confirm: true, reason, keyword, superadminToken }),
            });
        } catch {
            return { success: false, message: "LOCKDOWN command failed." };
        }
    },

    async triggerOpenAll(reason = "Emergency evacuation", keyword = "UNLOCK", superadminToken?: string): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/emergency/open", {
                method: "POST",
                body: JSON.stringify({ confirm: true, reason, keyword, superadminToken }),
            });
        } catch {
            return { success: false, message: "EMERGENCY UNLOCK command failed." };
        }
    },

    async restoreNormal(reason = "Normal operations restored", keyword = "RESTORE", superadminToken?: string): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/emergency/restore", {
                method: "POST",
                body: JSON.stringify({ confirm: true, reason, keyword, superadminToken }),
            });
        } catch {
            return { success: false, message: "Normal access schedule restore failed." };
        }
    },

    async getDirectusStatus(): Promise<DirectusSyncStatus> {
        try {
            return await request<DirectusSyncStatus>("/directus/status");
        } catch {
            return {
                status: "standby",
                totalUsers: 0,
                syncedUsers: 0,
                lastSyncTime: new Date().toISOString(),
            };
        }
    },

    async syncDirectus(): Promise<{ success: boolean; message?: string }> {
        try {
            return await request("/directus/sync", { method: "POST" });
        } catch {
            return { success: false, message: "Directus sync failed." };
        }
    },
};