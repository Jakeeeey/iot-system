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

const ACCESS_CONTROL_NAVIGATION_ITEM: NavItem = {
    title: "Access Control",
    url: "/iot-system/access-control/doors",
    slug: "access-control",
    iconName: "Shield",
    items: [
        {
            title: "Doors & Live Monitor",
            url: "/iot-system/access-control/doors",
            slug: "access-doors",
            iconName: "DoorClosed",
        },
        {
            title: "Hardware Controllers",
            url: "/iot-system/access-control/controllers",
            slug: "access-controllers",
            iconName: "Cpu",
        },
        {
            title: "Cardholders & Users",
            url: "/iot-system/access-control/users",
            slug: "access-users",
            iconName: "Users",
        },
        {
            title: "Event Logs & History",
            url: "/iot-system/access-control/history",
            slug: "access-history",
            iconName: "History",
        },
        {
            title: "Emergency Overrides",
            url: "/iot-system/access-control/emergency",
            slug: "access-emergency",
            iconName: "AlertTriangle",
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

    // 3. Ensure Access Control module is present as its own collapsible menu with subtabs
    const hasAccess = items.some(
        (item) => item.slug === "access-control" || item.url.startsWith("/iot-system/access-control")
    );

    let mergedItems: NavItem[] = items;
    if (!hasDsm) {
        mergedItems = [...mergedItems, DSM_NAVIGATION_ITEM];
    }
    if (!hasAccess) {
        mergedItems = [...mergedItems, ACCESS_CONTROL_NAVIGATION_ITEM];
    }

    return (
        <AppSidebarClient
            {...props}
            initialItems={mergedItems}
            subsystemTitle="Iot System"
        />
    );
}