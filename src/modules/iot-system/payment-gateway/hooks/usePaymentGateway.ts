"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { PaymentMethod, SmartCardInfo } from "../types";
import { PaymentGatewayService, PRESET_AMOUNTS } from "../services/payment-gateway.service";

const INITIAL_CARD: SmartCardInfo = {
    cardUid: "04:88:29:A3:NFC:VOS",
    cardType: "VOS SMART PASS (DESFire EV3)",
    status: "ACTIVE",
    balance: 0.00,
    currency: "PHP",
};

export function usePaymentGateway(initialCard: SmartCardInfo = INITIAL_CARD) {
    const [card, setCard] = useState<SmartCardInfo>(initialCard);
    const [selectedAmount, setSelectedAmount] = useState<number>(500);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("maya");
    const [isProcessing, setIsProcessing] = useState(false);

    const parsedAmount = useMemo(() => {
        if (customAmount) {
            const val = parseFloat(customAmount);
            return isNaN(val) ? 0 : val;
        }
        return selectedAmount;
    }, [customAmount, selectedAmount]);

    const { fee, total, vat } = useMemo(() => {
        return PaymentGatewayService.calculateSummary(parsedAmount, paymentMethod);
    }, [parsedAmount, paymentMethod]);

    const projectedBalance = useMemo(() => {
        return card.balance + parsedAmount;
    }, [card.balance, parsedAmount]);

    const handleSelectPreset = useCallback((val: number) => {
        setSelectedAmount(val);
        setCustomAmount("");
    }, []);

    const handleCustomChange = useCallback((value: string) => {
        setCustomAmount(value);
    }, []);

    const handleProcessTopUp = useCallback(async () => {
        if (parsedAmount <= 0) {
            toast.error("Invalid Recharge Amount", {
                description: "Please choose or enter a valid amount greater than ₱0.00.",
            });
            return;
        }

        setIsProcessing(true);
        try {
            const response = await PaymentGatewayService.processTopUp(
                {
                    cardUid: card.cardUid,
                    amount: parsedAmount,
                    paymentMethod,
                },
                card.balance
            );

            setCard((prev) => ({
                ...prev,
                balance: response.newBalance,
            }));

            toast.success("Card Top-up Successful!", {
                description: `Added ₱${response.amountAdded.toFixed(2)} via ${paymentMethod.toUpperCase()}. New Balance: ₱${response.newBalance.toFixed(2)} (${response.transactionId})`,
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to process card top-up";
            toast.error("Transaction Clearance Failed", { description: msg });
        } finally {
            setIsProcessing(false);
        }
    }, [parsedAmount, card.cardUid, card.balance, paymentMethod]);

    return {
        card,
        presetAmounts: PRESET_AMOUNTS,
        selectedAmount,
        customAmount,
        paymentMethod,
        isProcessing,
        amount: parsedAmount,
        fee,
        total,
        vat,
        projectedBalance,
        handleSelectPreset,
        handleCustomChange,
        setPaymentMethod,
        handleProcessTopUp,
    };
}
