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
    url: "/iot-system/access-control",
    slug: "access-control",
    iconName: "Shield",
    items: [
        {
            title: "Command Center",
            url: "/iot-system/access-control",
            slug: "access-command-center",
            iconName: "Gauge",
        },
        {
            title: "Controllers & Doors",
            url: "/iot-system/access-control/controllers",
            slug: "access-controllers",
            iconName: "Server",
        },
        {
            title: "Users & Privileges",
            url: "/iot-system/access-control/users",
            slug: "access-users",
            iconName: "Users",
        },
        {
            title: "Real-Time Monitor",
            url: "/iot-system/access-control/monitor",
            slug: "access-monitor",
            iconName: "Activity",
        },
        {
            title: "History Records",
            url: "/iot-system/access-control/history",
            slug: "access-history",
            iconName: "History",
        },
        {
            title: "Extended Functions",
            url: "/iot-system/access-control/extended",
            slug: "access-extended",
            iconName: "Sliders",
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
    let hasDsm = false;
    let hasAccess = false;

    let mergedItems: NavItem[] = items.map((item) => {
        if (item.slug === "dsm" || item.url.startsWith("/iot-system/dsm")) {
            hasDsm = true;
            return {
                ...item,
                items: item.items && item.items.length > 0 ? item.items : DSM_NAVIGATION_ITEM.items,
            };
        }
        if (item.slug === "access-control" || item.url.startsWith("/iot-system/access-control")) {
            hasAccess = true;
            return {
                ...item,
                items: item.items && item.items.length > 0 ? item.items : ACCESS_CONTROL_NAVIGATION_ITEM.items,
            };
        }
        return item;
    });

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