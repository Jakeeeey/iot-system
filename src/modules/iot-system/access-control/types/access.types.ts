export type DoorControlMode = 'normally_open' | 'normally_closed' | 'controlled';
export type EmergencyState = 'NORMAL' | 'LOCKDOWN' | 'OPEN_ALL';
export type UserRole = 'viewer' | 'admin' | 'superadmin';

export interface ControllerDoor {
    doorNumber: number;
    name?: string;
    mode?: DoorControlMode;
    delaySeconds?: number;
    status?: 'open' | 'closed' | 'unknown';
    forced?: boolean;
}

export interface ControllerDevice {
    serialNumber: number;
    name?: string;
    location?: string;
    ip: string;
    port: number;
    mac: string;
    mask?: string;
    gateway?: string;
    version?: string;
    releaseDate?: string;
    online: boolean;
    lastSeen: string | null;
    doors?: Record<number, ControllerDoor>;
    errorCount?: number;
}

export interface AccessUser {
    cardNumber: string | number;
    name: string;
    pin?: string;
    validFrom: string;
    validTo: string;
    doors: number[];
    synced?: boolean;
    syncStatus?: Record<number, boolean>;
    notes?: string;
}

export interface AccessEventLog {
    id: string | number;
    timestamp: string;
    serialNumber: number;
    doorNumber: number;
    cardNumber?: string | number;
    cardHolderName?: string;
    granted: boolean;
    reason?: string;
    eventType?: string;
    direction?: 'in' | 'out';
}

export interface EmergencyStatusResponse {
    status: EmergencyState;
    triggeredBy?: string;
    triggeredAt?: string;
    notes?: string;
    affectedDoorsCount?: number;
}

export interface AuthStatusResponse {
    role: UserRole;
    authenticated: boolean;
    canWrite: boolean;
    canAdminister: boolean;
    hasSuperadminConfigured: boolean;
}
