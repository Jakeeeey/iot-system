"use client";

import React from "react";

interface AmountSelectorProps {
    presetAmounts: readonly number[];
    selectedAmount: number;
    customAmount: string;
    onSelectPreset: (val: number) => void;
    onCustomChange: (val: string) => void;
}

export function AmountSelector({
    presetAmounts,
    selectedAmount,
    customAmount,
    onSelectPreset,
    onCustomChange,
}: AmountSelectorProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#D3DEDB] p-5 shadow-sm">
            <div className="pb-3">
                <h3 className="text-base font-bold text-[#0D2322]">Select Recharge Amount</h3>
                <p className="text-xs text-[#566C6A]">
                    Choose a quick amount or enter a custom transit top-up value.
                </p>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {presetAmounts.map((val) => {
                        const isSelected = selectedAmount === val && !customAmount;
                        return (
                            <button
                                key={val}
                                type="button"
                                className={`h-12 rounded-xl font-mono font-bold text-sm transition-all cursor-pointer border ${
                                    isSelected
                                        ? "bg-[#D97706] text-white border-[#D97706] shadow-sm shadow-[#D97706]/25"
                                        : "bg-[#EDF2F1] text-[#0D2322] border-[#D3DEDB] hover:bg-[#FFF7ED] hover:border-[#D97706]/40"
                                }`}
                                onClick={() => onSelectPreset(val)}
                            >
                                ₱{val}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-[#566C6A]">Or Enter Custom Amount (₱)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-[#566C6A] text-sm">
                            ₱
                        </span>
                        <input
                            type="number"
                            min="20"
                            max="10000"
                            placeholder="Custom value (e.g. 750)"
                            value={customAmount}
                            onChange={(e) => onCustomChange(e.target.value)}
                            className="w-full h-11 pl-8 pr-4 rounded-xl bg-[#EDF2F1] text-[#0D2322] text-sm border border-[#D3DEDB] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all font-mono font-semibold"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
