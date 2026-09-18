"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="border border-border/60 bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Select Recharge Amount</CardTitle>
                <CardDescription className="text-xs">
                    Choose a quick amount or enter a custom transit top-up value.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {presetAmounts.map((val) => {
                        const isSelected = selectedAmount === val && !customAmount;
                        return (
                            <Button
                                key={val}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                className={`h-12 font-mono font-bold text-sm ${
                                    isSelected
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:border-primary/50"
                                }`}
                                onClick={() => onSelectPreset(val)}
                            >
                                ₱{val}
                            </Button>
                        );
                    })}
                </div>

                <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-muted-foreground">Or Enter Custom Amount (₱)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-muted-foreground text-sm">
                            ₱
                        </span>
                        <Input
                            type="number"
                            min="20"
                            max="10000"
                            placeholder="Custom value (e.g. 750)"
                            value={customAmount}
                            onChange={(e) => onCustomChange(e.target.value)}
                            className="pl-8 font-mono font-semibold"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
