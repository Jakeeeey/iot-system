import * as React from "react";
import { type ComponentProps } from "react";
import { AppSidebarClient } from "@/components/shared/app-sidebar/app-sidebar-client";
import { getSidebarNavigation } from "@/actions/app-sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { NavItem } from "@/types/navigation";

const IOT_FALLBACK_NAV: NavItem[] = [
    {
        title: "Command Center",
        url: "/iot-system",
        slug: "overview",
        iconName: "Radio",
        status: "active",
    },
    {
        title: "Payment Gateway",
        url: "/iot-system/payment-gateway",
        slug: "payment-gateway",
        iconName: "CreditCard",
        status: "active",
        items: [
            {
                title: "Consumer Wallet",
                url: "/iot-system/payment-gateway?portal=consumer-wallet",
                slug: "consumer-wallet",
                iconName: "Wallet",
                status: "active",
            },
            {
                title: "Merchant Portal",
                url: "/iot-system/payment-gateway?portal=merchant-portal",
                slug: "merchant-portal",
                iconName: "Building2",
                status: "active",
            },
            {
                title: "Ops & Admin Console",
                url: "/iot-system/payment-gateway?portal=ops-console",
                slug: "ops-console",
                iconName: "ShieldCheck",
                status: "active",
            },
            {
                title: "Live Taps Telemetry",
                url: "/iot-system/telemetry",
                slug: "telemetry",
                iconName: "Activity",
                status: "active",
            },
            {
                title: "NFC Gateway Terminals",
                url: "/iot-system/terminals",
                slug: "terminals",
                iconName: "Cpu",
                status: "active",
            },
            {
                title: "Merchant Settlements",
                url: "/iot-system/settlements",
                slug: "settlements",
                iconName: "Receipt",
                status: "active",
            },
        ],
    },
    {
        title: "System Settings",
        url: "/iot-system/settings",
        slug: "settings",
        iconName: "Settings",
        status: "active",
    },
];

export async function AppSidebar(props: ComponentProps<typeof Sidebar>) {
    // 1. Fetch data on the server using the shared action
    const items = await getSidebarNavigation("iot-system");
    const resolvedItems = items && items.length > 0 ? items : IOT_FALLBACK_NAV;

    return (
        <AppSidebarClient
            {...props}
            initialItems={resolvedItems}
            subsystemTitle="IoT System"
        />
    );
}
