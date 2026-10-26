import {
    ControllerDevice,
    AccessUser,
    AccessEventLog,
    DoorControlMode,
    EmergencyStatusResponse,
    AuthStatusResponse,
} from "../types/access.types";

const BASE_URL = "/api/iot-system/access";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
        headers.set("Content-Type", "application/json");
    }

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
}

export const accessService = {
    async getAuthStatus(): Promise<AuthStatusResponse> {
        return request<AuthStatusResponse>("/auth/status");
    },

    async login(token: string): Promise<{ success: boolean; role: string; message?: string }> {
        return request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ token }),
        });
    },

    async logout(): Promise<{ success: boolean }> {
        return request("/auth/logout", {
            method: "POST",
        });
    },

    async getControllers(): Promise<{ success: boolean; controllers: ControllerDevice[] }> {
        const data = await request<{ success: boolean; controllers: ControllerDevice[] | Record<string, ControllerDevice> }>("/controllers");
        const raw = data?.controllers;
        const list = Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? Object.values(raw) : []);
        return { success: true, controllers: list };
    },

    async scanNetwork(): Promise<{ success: boolean; message?: string }> {
        return request("/controllers/scan", {
            method: "POST",
        });
    },

    async syncTime(serialNumber?: number): Promise<{ success: boolean; message?: string }> {
        return request("/controllers/sync-time", {
            method: "POST",
            body: JSON.stringify({ serialNumber }),
        });
    },

    async getDoors(): Promise<{ success: boolean; doors: unknown[] }> {
        return request("/doors");
    },

    async pulseDoor(serialNumber: number, doorNumber: number): Promise<{ success: boolean; message?: string }> {
        return request("/doors/pulse", {
            method: "POST",
            body: JSON.stringify({ serialNumber, doorNumber }),
        });
    },

    async setDoorMode(
        serialNumber: number,
        doorNumber: number,
        mode: DoorControlMode
    ): Promise<{ success: boolean; message?: string }> {
        return request("/doors/mode", {
            method: "POST",
            body: JSON.stringify({ serialNumber, doorNumber, mode }),
        });
    },

    async getUsers(): Promise<{ success: boolean; users: AccessUser[] }> {
        const data = await request<{ success: boolean; users: AccessUser[] | Record<string, AccessUser> }>("/users");
        const raw = data?.users;
        const list = Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? Object.values(raw) : []);
        return { success: true, users: list };
    },

    async saveUser(user: Partial<AccessUser>): Promise<{ success: boolean; user?: AccessUser; message?: string }> {
        return request("/users", {
            method: "POST",
            body: JSON.stringify(user),
        });
    },

    async deleteUser(cardNumber: string | number): Promise<{ success: boolean; message?: string }> {
        return request(`/users/${cardNumber}`, {
            method: "DELETE",
        });
    },

    async syncUsers(): Promise<{ success: boolean; message?: string }> {
        return request("/users/sync", {
            method: "POST",
        });
    },

    async getHistory(limit = 100): Promise<{ success: boolean; events: AccessEventLog[] }> {
        const data = await request<{ success: boolean; events: AccessEventLog[] }>(`/history?limit=${limit}`);
        return { success: true, events: Array.isArray(data?.events) ? data.events : [] };
    },

    async getEmergencyStatus(): Promise<EmergencyStatusResponse> {
        return request<EmergencyStatusResponse>("/emergency/status");
    },

    async triggerLockdown(notes?: string): Promise<{ success: boolean; message?: string }> {
        return request("/emergency/lockdown", {
            method: "POST",
            body: JSON.stringify({ notes }),
        });
    },

    async triggerOpenAll(notes?: string): Promise<{ success: boolean; message?: string }> {
        return request("/emergency/open-all", {
            method: "POST",
            body: JSON.stringify({ notes }),
        });
    },

    async restoreNormal(notes?: string): Promise<{ success: boolean; message?: string }> {
        return request("/emergency/restore", {
            method: "POST",
            body: JSON.stringify({ notes }),
        });
    },
};