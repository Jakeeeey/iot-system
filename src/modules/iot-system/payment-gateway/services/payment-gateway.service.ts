import { 
    PaymentMethod, 
    PaymentChannelOption, 
    TopUpRequest, 
    TopUpResponse,
    TopUpRequestSchema 
} from "../types";

export const PAYMENT_CHANNELS: PaymentChannelOption[] = [
    {
        id: "maya",
        name: "Maya E-Wallet",
        subtitle: "Instant 0% convenience fee",
        iconLetter: "M",
        fee: 0.00,
    },
    {
        id: "gcash",
        name: "GCash QR / Web",
        subtitle: "Direct app push verification",
        iconLetter: "G",
        fee: 0.00,
    },
    {
        id: "card",
        name: "Visa / Mastercard",
        subtitle: "₱15.00 gateway MDR fee",
        fee: 15.00,
    },
    {
        id: "bank",
        name: "Direct Bank Transfer",
        subtitle: "InstaPay / PESONet",
        fee: 0.00,
    },
];

export const PRESET_AMOUNTS = [100, 300, 500, 1000] as const;

export class PaymentGatewayService {
    static getChannelFee(method: PaymentMethod): number {
        const channel = PAYMENT_CHANNELS.find((c) => c.id === method);
        return channel ? channel.fee : 0;
    }

    static calculateSummary(amount: number, method: PaymentMethod) {
        const fee = this.getChannelFee(method);
        const total = amount + fee;
        const vat = amount * 0.12; // 12% inclusive VAT
        return { fee, total, vat };
    }

    static async processTopUp(
        payload: TopUpRequest, 
        currentBalance: number
    ): Promise<TopUpResponse> {
        // Validate with Zod
        const validated = TopUpRequestSchema.parse(payload);
        const { fee, total } = this.calculateSummary(validated.amount, validated.paymentMethod);

        // Simulate network/clearing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newBalance = currentBalance + validated.amount;
        const txId = `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        return {
            success: true,
            transactionId: txId,
            previousBalance: currentBalance,
            amountAdded: validated.amount,
            newBalance,
            fee,
            totalCharged: total,
            timestamp: new Date().toISOString(),
            status: "SETTLED",
        };
    }
}
