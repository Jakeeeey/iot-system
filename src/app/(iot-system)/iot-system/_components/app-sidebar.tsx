import * as React from "react";
import { type ComponentProps } from "react";
import { AppSidebarClient } from "@/components/shared/app-sidebar/app-sidebar-client";
import { getSidebarNavigation } from "@/actions/app-sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { NavItem } from "@/types/navigation";

const DSM_NAVIGATION_ITEM: NavItem = {
    title: "Deye Solar Monitoring",
    url: "/iot-system/dsm",
    slug: "dsm",
    iconName: "Sun",
    items: [
        {
            title: "Energy Flow & Fleet",
            url: "/iot-system/dsm",
            slug: "dsm-energy-flow",
            iconName: "Zap",
        },
        {
            title: "Accounts & Plants",
            url: "/iot-system/dsm/accounts",
            slug: "dsm-accounts",
            iconName: "Building2",
        },
        {
            title: "Hardware Telemetry",
            url: "/iot-system/dsm/hardware-telemetry",
            slug: "dsm-hardware-telemetry",
            iconName: "Sliders",
        },
        {
            title: "Yield & Arbitrage",
            url: "/iot-system/dsm/yield-arbitrage",
            slug: "dsm-yield-arbitrage",
            iconName: "TrendingUp",
        },
        {
            title: "Trigonometric Analytics",
            url: "/iot-system/dsm/trigonometric-analytics",
            slug: "dsm-trigonometric-analytics",
            iconName: "Activity",
        },
        {
            title: "API & Diagnostics",
            url: "/iot-system/dsm/api-diagnostics",
            slug: "dsm-api-diagnostics",
            iconName: "ShieldCheck",
        },
    ],
};

export async function AppSidebar(props: ComponentProps<typeof Sidebar>) {
    // 1. Fetch data on the server using the shared action
    const items = await getSidebarNavigation("iot-system");

    // 2. Ensure DSM module is present as its own collapsible menu with subtabs
    const hasDsm = items.some(
        (item) => item.slug === "dsm" || item.url.startsWith("/iot-system/dsm")
    );

    const mergedItems: NavItem[] = hasDsm
        ? items
        : [...items, DSM_NAVIGATION_ITEM];

    return (
        <AppSidebarClient
            {...props}
            initialItems={mergedItems}
            subsystemTitle="Iot System"
        />
    );
}
