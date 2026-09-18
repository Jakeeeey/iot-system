"use client";

import React from "react";
import { CreditCard, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethod } from "../types";
import { PAYMENT_CHANNELS } from "../services/payment-gateway.service";

interface PaymentChannelSelectorProps {
    paymentMethod: PaymentMethod;
    onSelectMethod: (method: PaymentMethod) => void;
}

export function PaymentChannelSelector({
    paymentMethod,
    onSelectMethod,
}: PaymentChannelSelectorProps) {
    const renderIcon = (id: PaymentMethod, iconLetter?: string) => {
        if (id === "maya") {
            return (
                <div className="h-9 w-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 font-black text-xs">
                    {iconLetter || "M"}
                </div>
            );
        }
        if (id === "gcash") {
            return (
                <div className="h-9 w-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0 font-black text-xs">
                    {iconLetter || "G"}
                </div>
            );
        }
        if (id === "card") {
            return (
                <div className="h-9 w-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shrink-0">
                    <CreditCard className="h-4 w-4" />
                </div>
            );
        }
        return (
            <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Building2 className="h-4 w-4" />
            </div>
        );
    };

    const getActiveBorder = (id: PaymentMethod) => {
        switch (id) {
            case "maya":
                return "border-emerald-500/80 bg-emerald-500/10";
            case "gcash":
                return "border-cyan-500/80 bg-cyan-500/10";
            case "card":
                return "border-indigo-500/80 bg-indigo-500/10";
            case "bank":
                return "border-amber-500/80 bg-amber-500/10";
        }
    };

    return (
        <Card className="border border-border/60 bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Payment Gateway Channel</CardTitle>
                <CardDescription className="text-xs">
                    Select the merchant rail to settle this transaction.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_CHANNELS.map((channel) => {
                    const isSelected = paymentMethod === channel.id;
                    return (
                        <div
                            key={channel.id}
                            onClick={() => onSelectMethod(channel.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                isSelected
                                    ? getActiveBorder(channel.id)
                                    : "border-border hover:border-border/80 hover:bg-muted/40"
                            }`}
                        >
                            {renderIcon(channel.id, channel.iconLetter)}
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-foreground">{channel.name}</div>
                                <div className="text-[11px] text-muted-foreground">{channel.subtitle}</div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
