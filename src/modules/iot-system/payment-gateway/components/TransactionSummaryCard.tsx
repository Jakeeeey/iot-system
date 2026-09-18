"use client";

import React from "react";
import { ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SmartCardInfo } from "../types";

interface TransactionSummaryCardProps {
    card: SmartCardInfo;
    amount: number;
    fee: number;
    vat: number;
    total: number;
    isProcessing: boolean;
    onConfirmTopUp: () => void;
}

export function TransactionSummaryCard({
    card,
    amount,
    fee,
    vat,
    total,
    isProcessing,
    onConfirmTopUp,
}: TransactionSummaryCardProps) {
    const maskedUid = card.cardUid.length > 10 
        ? `${card.cardUid.substring(0, 8)}...${card.cardUid.slice(-3)}` 
        : card.cardUid;

    return (
        <Card className="border border-border/70 bg-card shadow-sm sticky top-20">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">Transaction Summary</CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono uppercase">
                        NODE #TX-8910
                    </Badge>
                </div>
                <CardDescription className="text-xs">
                    Review card balance adjustments before confirming.
                </CardDescription>
            </CardHeader>

            <CardContent className="py-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between text-muted-foreground">
                    <span>Target Card:</span>
                    <span className="text-foreground font-semibold">{maskedUid}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Recharge Principal:</span>
                    <span className="text-foreground font-bold">₱{amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Channel Gateway Fee:</span>
                    <span className="text-foreground">₱{fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>VAT (12% inclusive):</span>
                    <span className="text-foreground">₱{vat.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-sans font-black text-foreground pt-1">
                    <span>Total Amount Due:</span>
                    <span className="text-primary font-mono text-lg">₱{total.toFixed(2)}</span>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
                <Button
                    onClick={onConfirmTopUp}
                    disabled={isProcessing || amount <= 0}
                    className="w-full h-11 text-sm font-bold bg-primary text-primary-foreground shadow-md gap-2"
                >
                    {isProcessing ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Processing Tap & Clearing...
                        </>
                    ) : (
                        <>
                            Confirm Top-up (₱{total.toFixed(2)})
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>

                <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-[11px] space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>PCI-DSS Level 1 & VOS Guard</span>
                    </div>
                    <p className="text-[10px] leading-relaxed">
                        Card transactions are tokenized with end-to-end ECDSA signatures. Physical card balance updates via NFC edge antenna within 250ms.
                    </p>
                </div>
            </CardFooter>
        </Card>
    );
}
