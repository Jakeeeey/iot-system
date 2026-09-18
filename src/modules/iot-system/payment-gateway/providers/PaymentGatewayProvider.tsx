"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePaymentGateway } from "../hooks/usePaymentGateway";

type PaymentGatewayContextType = ReturnType<typeof usePaymentGateway>;

const PaymentGatewayContext = createContext<PaymentGatewayContextType | null>(null);

export function PaymentGatewayProvider({ children }: { children: ReactNode }) {
    const gateway = usePaymentGateway();
    return (
        <PaymentGatewayContext.Provider value={gateway}>
            {children}
        </PaymentGatewayContext.Provider>
    );
}

export function usePaymentGatewayContext() {
    const context = useContext(PaymentGatewayContext);
    if (!context) {
        throw new Error("usePaymentGatewayContext must be used within a PaymentGatewayProvider");
    }
    return context;
}
