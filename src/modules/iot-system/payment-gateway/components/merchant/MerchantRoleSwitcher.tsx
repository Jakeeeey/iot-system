"use client";

import React from "react";
import { MerchantRBACRole } from "../../types";
import { PaymentIcon } from "../PaymentIcon";

interface MerchantRoleSwitcherProps {
    currentRole: MerchantRBACRole;
    onRoleChange: (role: MerchantRBACRole) => void;
}

export function MerchantRoleSwitcher({ currentRole, onRoleChange }: MerchantRoleSwitcherProps) {
    const roles: {
        key: MerchantRBACRole;
        label: string;
        badge: string;
        icon: string;
        desc: string;
    }[] = [
        {
            key: "cashier",
            label: "Store Cashier",
            badge: "Floor POS Level",
            icon: "point_of_sale",
            desc: "Process customer checkouts, display dynamic QR Ph, trigger Soundbox audio verification",
        },
        {
            key: "accountant",
            label: "Finance & Accountant",
            badge: "Auditor Level",
            icon: "receipt",
            desc: "Reconcile daily settlement ledger, download BIR 2307 certificates, configure midnight net-sweep",
        },
        {
            key: "administrator",
            label: "Store Administrator",
            badge: "Full Access",
            icon: "verified_user",
            desc: "Manage POS terminal fleet & OTA patches, configure developer webhooks, dispatch bulk payroll",
        },
    ];

    return (
        <div className="bg-white rounded-2xl p-4 border border-[#D3DEDB] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#EDF4F2] flex items-center justify-center text-[#0D2322]">
                        <PaymentIcon name="how_to_reg" className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#0D2322] uppercase tracking-wider">
                                Merchant RBAC Console
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] font-mono font-bold border border-[#D3DEDB]">
                                Sec. J.2
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">Switch active terminal operational role to preview scoped access</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F7F6] border border-[#D3DEDB] self-start sm:self-auto">
                    <span className="text-[11px] text-[#566C6A] font-medium">Current Session:</span>
                    <span className="text-xs font-bold text-[#0D2322] capitalize font-mono">{currentRole}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {roles.map((r) => {
                    const isActive = currentRole === r.key;
                    return (
                        <button
                            key={r.key}
                            type="button"
                            onClick={() => onRoleChange(r.key)}
                            className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between gap-2 cursor-pointer ${
                                isActive
                                    ? "bg-gradient-to-br from-[#0D2322] to-[#163331] text-white border-[#0D2322] shadow-md shadow-[#0D2322]/15"
                                    : "bg-[#F4F7F6] text-[#0D2322] border-[#D3DEDB] hover:bg-[#EAEFEF]"
                            }`}
                        >
                            <div className="flex items-start justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                            isActive ? "bg-[#D97706] text-white" : "bg-white text-[#0D2322] border border-[#D3DEDB]"
                                        }`}
                                    >
                                        <PaymentIcon name={r.icon} className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-xs font-bold ${isActive ? "text-white" : "text-[#0D2322]"}`}>
                                        {r.label}
                                    </span>
                                </div>
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                        isActive
                                            ? "bg-white/20 text-white border border-white/30"
                                            : "bg-[#EDF4F2] text-[#566C6A] border border-[#D3DEDB]"
                                    }`}
                                >
                                    {r.badge}
                                </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${isActive ? "text-white/80" : "text-[#566C6A]"}`}>
                                {r.desc}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
