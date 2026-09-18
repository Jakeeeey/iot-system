import { z } from "zod";

export const PaymentMethodSchema = z.enum(["maya", "gcash", "card", "bank"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export interface PaymentChannelOption {
    id: PaymentMethod;
    name: string;
    subtitle: string;
    iconLetter?: string;
    badge?: string;
    fee: number;
}

export const TopUpRequestSchema = z.object({
    cardUid: z.string().min(1, "Card UID is required"),
    amount: z.number().positive("Amount must be greater than zero"),
    paymentMethod: PaymentMethodSchema,
});
export type TopUpRequest = z.infer<typeof TopUpRequestSchema>;

export const TopUpResponseSchema = z.object({
    success: z.boolean(),
    transactionId: z.string(),
    previousBalance: z.number(),
    amountAdded: z.number(),
    newBalance: z.number(),
    fee: z.number(),
    totalCharged: z.number(),
    timestamp: z.string(),
    status: z.enum(["SETTLED", "PENDING", "FAILED"]),
});
export type TopUpResponse = z.infer<typeof TopUpResponseSchema>;

export interface SmartCardInfo {
    cardUid: string;
    cardType: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    balance: number;
    currency: string;
}

// ==========================================
// ApexPay Portal & Multi-View Types
// ==========================================

export type PaymentPortalType = "consumer-wallet" | "merchant-portal" | "ops-console";
export type EnvironmentMode = "LIVE" | "SANDBOX";

// Consumer Wallet Models
export interface WalletTransactionItem {
    id: string;
    merchant: string;
    amount: number;
    type: "in" | "spending";
    time: string;
    date: string;
    referenceCode: string;
    cashback: string;
    category: string;
    paymentMethod: string;
    status: "Settled" | "Auto-Paid" | "Pending";
    icon: string;
}

export interface QuickContact {
    id: string;
    name: string;
    phone: string;
    initials: string;
    colorTheme: "amber" | "sage" | "slate";
}

export interface ScheduledBill {
    id: string;
    billerName: string;
    accountNumber: string;
    category: string;
    dueInDays: number;
    amount: number;
    isAutoPay: boolean;
}

export interface SavingsGoal {
    id: string;
    title: string;
    subtitle: string;
    emoji: string;
    currentAmount: number;
    targetAmount: number;
    badgeText: string;
}

export interface CardSecuritySettings {
    isFrozen: boolean;
    onlinePayments: boolean;
    overseasTransactions: boolean;
    dailyLimit: number;
}

// Merchant Portal Models
export interface MerchantMetricTile {
    title: string;
    value: string;
    comparisonText: string;
    trendPercentage?: string;
    trendPositive?: boolean;
    badgeText?: string;
    progressPercentage: number;
}

export interface ChannelLiquidityItem {
    label: string;
    percentage: number;
    amountFormatted: string;
    icon: string;
    colorClass: string;
}

export interface TerminalFleetNode {
    id: string;
    name: string;
    onlineCount: number;
    totalCount: number;
    description: string;
    batteryLevel?: string;
    network: string;
    firmwareVersion: string;
    status: "healthy" | "warning" | "updating";
}

export interface MerchantLedgerTransaction {
    id: string;
    time: string;
    cashier: string;
    storeLocation: string;
    initials: string;
    railMethod: string;
    grossAmount: number;
    mdrRate: number;
    mdrFee: number;
    netSettlement: number;
    status: "Settled" | "Batch In-Flight" | "Processing";
}

export interface ChargebackDispute {
    id: string;
    reason: string;
    amount: number;
    store: string;
    remainingHours: number;
    remainingMinutes: number;
    status: "Action Required" | "Submitted" | "Under Review";
}

// Platform Ops Console Models
export interface CoreRailTelemetry {
    name: string;
    status: "Operational" | "Staged Window" | "Acquiring Live" | "Active Feed";
    statusColor: "mint" | "amber" | "danger";
    latency: string;
    metricLabel: string;
    metricValue: string;
    secondaryLabel: string;
    secondaryValue: string;
}

export interface DualControlAdjustment {
    journalRef: string;
    adjustmentAmount: number;
    targetAccount: string;
    correspondent: string;
    reasonCode: string;
    reasonDescription: string;
    initiatingOfficer: string;
    timestamp: string;
    ledgerHash: string;
    justification: string;
    status: "Pending" | "Authorized" | "Rejected";
}

export interface AMLAlertItem {
    id: string;
    entityName: string;
    alertType: "Covered Threshold" | "PEP Match" | "Structuring Surge";
    severity: "danger" | "amber";
    accountNumber: string;
    amount: number;
    channel: string;
    description: string;
    matchRule: string;
    originNode: string;
    queueAge: string;
    status: "Pending" | "Investigating" | "Report Filed";
}

export interface AdjudicationCase {
    caseId: string;
    disputedValue: number;
    payerName: string;
    payerCard: string;
    merchantName: string;
    merchantId: string;
    claimCategory: string;
    reserveStatus: string;
    evidenceDocument: string;
    uploadedTime: string;
    status: "Open" | "Dismissed" | "Reversed";
}

export interface AuditTapeEvent {
    id: string;
    timestamp: string;
    actionTag: string;
    description: string;
    statusIcon: "check" | "warning" | "sync";
}
