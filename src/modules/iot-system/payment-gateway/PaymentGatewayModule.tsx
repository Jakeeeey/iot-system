"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PaymentGatewayProvider } from "./providers/PaymentGatewayProvider";
import { PaymentPortalType, EnvironmentMode } from "./types";
import { ApexPayHeader } from "./components/ApexPayHeader";
import { ConsumerWalletView } from "./components/ConsumerWalletView";
import { MerchantPortalView } from "./components/MerchantPortalView";
import { OpsConsoleView } from "./components/OpsConsoleView";

function PaymentGatewayInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const portalParam = searchParams.get("portal") as PaymentPortalType | null;

    const [activePortal, setActivePortal] = useState<PaymentPortalType>(
        portalParam && ["consumer-wallet", "merchant-portal", "ops-console"].includes(portalParam)
            ? portalParam
            : "consumer-wallet"
    );

    const [mode, setMode] = useState<EnvironmentMode>("LIVE");

    // Sync state with URL parameter if it changes
    useEffect(() => {
        if (portalParam && ["consumer-wallet", "merchant-portal", "ops-console"].includes(portalParam)) {
            setActivePortal(portalParam);
        }
    }, [portalParam]);

    const handleSelectPortal = (portal: PaymentPortalType) => {
        setActivePortal(portal);
        const params = new URLSearchParams(searchParams.toString());
        params.set("portal", portal);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Unified ApexPay Global Navigation Header */}
            <ApexPayHeader
                activePortal={activePortal}
                onSelectPortal={handleSelectPortal}
                mode={mode}
                onToggleMode={setMode}
            />

            {/* Render Selected Portal Suite */}
            <div className="w-full">
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
            <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading ApexPay Gateway Suite...</div>}>
                <PaymentGatewayInner />
            </Suspense>
        </PaymentGatewayProvider>
    );
}
