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
    passcodes?: string[];
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
    isOnline?: boolean;
    status?: 'ONLINE' | 'OFFLINE' | 'UNREACHABLE' | 'STANDBY';
    socketStatus?: 'CONNECTED' | 'DISCONNECTED' | 'RETRYING';
    lastSeen: string | null;
    doors?: Record<number, ControllerDoor>;
    errorCount?: number;
    lastEventIndex?: number;
    timeDriftSeconds?: number;
    pollIntervalMs?: number;
}

export interface AccessUser {
    cardNumber: string | number;
    rawCardNumber?: string;
    name: string;
    department?: string;
    phone?: string;
    pin?: string;
    validFrom: string;
    validTo: string;
    doors: number[];
    boardDoors?: Record<number, number[]>;
    synced?: boolean;
    syncStatus?: Record<number, boolean>;
    notes?: string;
    active?: boolean;
}

export interface AccessEventLog {
    id: string | number;
    timestamp: string;
    serialNumber: number;
    controllerName?: string;
    doorNumber: number;
    doorName?: string;
    cardNumber?: string | number;
    rawCardNumber?: string;
    wiegandStr?: string;
    cardHolderName?: string;
    userName?: string;
    department?: string;
    pin?: string;
    granted: boolean;
    reason?: string | number;
    eventType?: string;
    type?: string;
    direction?: 'in' | 'out';
    message?: string;
    unknownCard?: boolean;
}

export interface DirectusSyncStatus {
    status: 'standby' | 'syncing' | 'connected' | 'error';
    totalUsers: number;
    syncedUsers: number;
    lastSyncTime: string | null;
    error?: string | null;
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
    token?: string;
}

export interface HourlyVelocityMetric {
    hour: number;
    label: string;
    granted: number;
    denied: number;
    total: number;
}

export interface DoorThroughputRank {
    doorId: string;
    doorName: string;
    controllerName: string;
    totalSwipes: number;
    grantedCount: number;
    deniedCount: number;
    grantedPercent: number;
}

export interface TopUserRank {
    name: string;
    cardNumber: string | number;
    department?: string;
    swipes: number;
    lastSeen: string;
}

export interface CommandAnalyticsKPIs {
    totalEvents: number;
    grantedCount: number;
    deniedCount: number;
    alertCount: number;
    passRate: number;
    flowVelocityPerHour: number;
}
