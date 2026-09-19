"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PaymentGatewayProvider } from "./providers/PaymentGatewayProvider";
import { PaymentPortalType, EnvironmentMode } from "./types";
import { MapEPayHeader } from "./components/MapEPayHeader";
import { ConsumerWalletView } from "./components/ConsumerWalletView";
import { MerchantPortalView } from "./components/MerchantPortalView";
import { OpsConsoleView } from "./components/OpsConsoleView";

function PaymentGatewayInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const portalParam = searchParams.get("portal") as PaymentPortalType | null;
    const isValidPortal = portalParam && ["consumer-wallet", "merchant-portal", "ops-console"].includes(portalParam);
    const [selectedPortal, setSelectedPortal] = useState<PaymentPortalType>("consumer-wallet");
    const activePortal = isValidPortal ? portalParam : selectedPortal;

    const [mode, setMode] = useState<EnvironmentMode>("LIVE");

    const handleSelectPortal = (portal: PaymentPortalType) => {
        setSelectedPortal(portal);
        const params = new URLSearchParams(searchParams.toString());
        params.set("portal", portal);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Unified Map-ePay Global Navigation Header */}
            <MapEPayHeader
                activePortal={activePortal}
                onSelectPortal={handleSelectPortal}
                mode={mode}
                onToggleMode={setMode}
            />

            {/* Render Selected Portal Suite */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12">
                {activePortal === "consumer-wallet" && <ConsumerWalletView />}
                {activePortal === "merchant-portal" && <MerchantPortalView />}
                {activePortal === "ops-console" && <OpsConsoleView />}
            </div>
        </div>
    );
}

export function PaymentGatewayModule() {
    return (
        <PaymentGatewayProvider>
            <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Map-ePay Gateway Suite...</div>}>
                <PaymentGatewayInner />
            </Suspense>
        </PaymentGatewayProvider>
    );
}
