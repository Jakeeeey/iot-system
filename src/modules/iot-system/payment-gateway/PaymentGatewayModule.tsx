"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { PaymentGatewayProvider, usePaymentGatewayContext } from "./providers/PaymentGatewayProvider";
import { SmartCardVisualizer } from "./components/SmartCardVisualizer";
import { AmountSelector } from "./components/AmountSelector";
import { PaymentChannelSelector } from "./components/PaymentChannelSelector";
import { TransactionSummaryCard } from "./components/TransactionSummaryCard";

function PaymentGatewayView() {
    const {
        card,
        presetAmounts,
        selectedAmount,
        customAmount,
        paymentMethod,
        isProcessing,
        amount,
        fee,
        total,
        vat,
        projectedBalance,
        handleSelectPreset,
        handleCustomChange,
        setPaymentMethod,
        handleProcessTopUp,
    } = usePaymentGatewayContext();

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                        IoT Payment Gateway & Top-up
                    </h1>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono">
                        NFC DESFire EV3
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Direct cloud clearing payment gateway for transit cards, campus IDs & contactless tap balances.
                </p>
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
                {/* Left Column: Card Visualizer & Configuration (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <SmartCardVisualizer
                        card={card}
                        amount={amount}
                        projectedBalance={projectedBalance}
                    />

                    <AmountSelector
                        presetAmounts={presetAmounts}
                        selectedAmount={selectedAmount}
                        customAmount={customAmount}
                        onSelectPreset={handleSelectPreset}
                        onCustomChange={handleCustomChange}
                    />

                    <PaymentChannelSelector
                        paymentMethod={paymentMethod}
                        onSelectMethod={setPaymentMethod}
                    />
                </div>

                {/* Right Column: Order Summary & Clearing Trigger (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <TransactionSummaryCard
                        card={card}
                        amount={amount}
                        fee={fee}
                        vat={vat}
                        total={total}
                        isProcessing={isProcessing}
                        onConfirmTopUp={handleProcessTopUp}
                    />
                </div>
            </div>
        </div>
    );
}

export function PaymentGatewayModule() {
    return (
        <PaymentGatewayProvider>
            <PaymentGatewayView />
        </PaymentGatewayProvider>
    );
}
