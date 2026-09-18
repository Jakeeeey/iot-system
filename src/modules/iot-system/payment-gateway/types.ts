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
