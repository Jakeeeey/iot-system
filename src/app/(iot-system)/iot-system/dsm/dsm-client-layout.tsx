"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleProvider } from "@/lib/role-context";
import { AccountProvider } from "@/lib/account-context";
import { SidebarProvider } from "@/components/dsm/sidebar-context";
import { Header as DsmHeader } from "@/components/dsm/header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Zap, Sun, Activity, Sliders, TrendingUp, ShieldCheck, Building2 } from "lucide-react";

const TAB_TITLES: Record<string, { title: string; icon: React.ComponentType<{ className?: string; size?: number }> }> = {
    "/iot-system/dsm": { title: "Energy Flow & Fleet Hub", icon: Zap },
    "/iot-system/dsm/accounts": { title: "Accounts & Plant Matrix", icon: Building2 },
    "/iot-system/dsm/hardware-telemetry": { title: "Hardware Telemetry & MPPT", icon: Sliders },
    "/iot-system/dsm/yield-arbitrage": { title: "Yield & Tariff Arbitrage", icon: TrendingUp },
    "/iot-system/dsm/trigonometric-analytics": { title: "Trigonometric & Harmonics", icon: Activity },
    "/iot-system/dsm/api-diagnostics": { title: "API Diagnostics & Cloud Health", icon: ShieldCheck },
};

function getActiveTabInfo(pathname: string) {
    for (const [route, info] of Object.entries(TAB_TITLES)) {
        if (pathname === route || (route !== "/iot-system/dsm" && pathname.startsWith(route))) {
            return info;
        }
    }
    return { title: "Energy Flow & Fleet Hub", icon: Sun };
}

export function DsmClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "/iot-system/dsm";
    const activeInfo = getActiveTabInfo(pathname);
    const ActiveIcon = activeInfo.icon;

    return (
        <RoleProvider>
            <AccountProvider>
                <SidebarProvider>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
                        {/* Subsystem Breadcrumb Topbar */}
                        <header className="relative z-20 flex h-13 shrink-0 items-center justify-between border-b border-border/60 bg-card/40 px-3 sm:px-4 backdrop-blur-md">
                            <div className="flex h-full min-w-0 items-center gap-2 overflow-hidden">
                                <SidebarTrigger className="-ml-1 shrink-0" />
                                <Separator
                                    orientation="vertical"
                                    className="hidden sm:block mr-2 data-[orientation=vertical]:h-4 shrink-0"
                                />
                                <Breadcrumb>
                                    <BreadcrumbList className="min-w-0 overflow-hidden text-xs">
                                        <BreadcrumbItem className="hidden md:block shrink-0">
                                            <BreadcrumbLink href="/iot-system">IoT System</BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block shrink-0" />
                                        <BreadcrumbItem className="shrink-0 font-medium">
                                            <BreadcrumbLink href="/iot-system/dsm" className="flex items-center gap-1.5 text-amber-500 font-semibold">
                                                <Sun size={13} className="shrink-0" />
                                                <span>DSM (Solar Monitoring)</span>
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="shrink-0" />
                                        <BreadcrumbItem className="min-w-0 overflow-hidden">
                                            <BreadcrumbPage className="flex items-center gap-1.5 truncate max-w-[45vw] sm:max-w-[55vw] md:max-w-none font-semibold text-foreground">
                                                <ActiveIcon size={12} className="text-primary shrink-0" />
                                                <span className="truncate">{activeInfo.title}</span>
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>

                            {/* Subtabs Quick Navigation Pills on top bar for convenience */}
                            <nav className="hidden xl:flex items-center gap-1">
                                {[
                                    { href: "/iot-system/dsm", label: "Fleet", icon: Zap },
                                    { href: "/iot-system/dsm/accounts", label: "Accounts", icon: Building2 },
                                    { href: "/iot-system/dsm/hardware-telemetry", label: "Telemetry", icon: Sliders },
                                    { href: "/iot-system/dsm/yield-arbitrage", label: "Yield", icon: TrendingUp },
                                    { href: "/iot-system/dsm/trigonometric-analytics", label: "Trigonometric", icon: Activity },
                                    { href: "/iot-system/dsm/api-diagnostics", label: "Diagnostics", icon: ShieldCheck },
                                ].map((tab) => {
                                    const isActive = tab.href === "/iot-system/dsm"
                                        ? pathname === "/iot-system/dsm"
                                        : pathname.startsWith(tab.href);
                                    const Icon = tab.icon;
                                    return (
                                        <Link
                                            key={tab.href}
                                            href={tab.href}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                                                isActive
                                                    ? "bg-amber-500/15 text-amber-500 font-semibold border border-amber-500/30"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                            }`}
                                        >
                                            <Icon size={12} />
                                            <span>{tab.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </header>

                        {/* DSM Mission Control Header Toolbar */}
                        <div className="shrink-0 border-b border-border/50 bg-background/95">
                            <DsmHeader />
                        </div>

                        {/* Main DSM Page Content */}
                        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6">
                            <div className="max-w-[1700px] mx-auto w-full">
                                {children}
                            </div>
                        </main>
                    </div>
                </SidebarProvider>
            </AccountProvider>
        </RoleProvider>
    );
}
