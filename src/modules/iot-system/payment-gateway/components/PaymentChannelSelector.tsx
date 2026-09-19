"use client";

import React from "react";
import { PaymentMethod } from "../types";
import { PAYMENT_CHANNELS } from "../services/payment-gateway.service";
import { PaymentIcon } from "./PaymentIcon";

interface PaymentChannelSelectorProps {
    paymentMethod: PaymentMethod;
    onSelectMethod: (method: PaymentMethod) => void;
}

export function PaymentChannelSelector({
    paymentMethod,
    onSelectMethod,
}: PaymentChannelSelectorProps) {
    const renderIcon = (id: PaymentMethod) => {
        if (id === "maya") {
            return (
                <div className="h-9 w-9 rounded-xl bg-[#E8F5F1] border border-[#BCE3D6] flex items-center justify-center text-[#0F5B46] shrink-0 font-bold text-xs">
                    M
                </div>
            );
        }
        if (id === "gcash") {
            return (
                <div className="h-9 w-9 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#D97706] shrink-0 font-bold text-xs">
                    <PaymentIcon name="qr_code_2" className="w-4 h-4 text-[#D97706]" />
                </div>
            );
        }
        if (id === "card") {
            return (
                <div className="h-9 w-9 rounded-xl bg-[#EDF2F1] border border-[#D3DEDB] flex items-center justify-center text-[#0D2322] shrink-0">
                    <PaymentIcon name="credit_card" className="w-4 h-4 text-[#0D2322]" />
                </div>
            );
        }
        return (
            <div className="h-9 w-9 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#D97706] shrink-0">
                <PaymentIcon name="account_balance" className="w-4 h-4 text-[#D97706]" />
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-[#D3DEDB] p-5 shadow-sm">
            <div className="pb-3">
                <h3 className="text-base font-bold text-[#0D2322]">Payment Gateway Channel</h3>
                <p className="text-xs text-[#566C6A]">
                    Select the merchant rail to settle this transaction.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_CHANNELS.map((channel) => {
                    const isSelected = paymentMethod === channel.id;
                    return (
                        <div
                            key={channel.id}
                            onClick={() => onSelectMethod(channel.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                isSelected
                                    ? "border-[#D97706] bg-[#FFF7ED]"
                                    : "border-[#D3DEDB] bg-[#F4F7F6] hover:bg-[#EDF2F1]"
                            }`}
                        >
                            {renderIcon(channel.id)}
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-[#0D2322]">{channel.name}</div>
                                <div className="text-[11px] text-[#566C6A]">{channel.subtitle}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
