"use client";

import React from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "@/components/shared/app-sidebar/nav-user";
import { PaymentGatewayModule } from "@/modules/iot-system/payment-gateway";

export default function PaymentGatewayPage() {
    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F4F7F6] map-epay-portal apexpay-portal">
            {/* System Top Breadcrumb Bar */}
            <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-[#D3DEDB] bg-white sm:h-16 overflow-hidden">
                <div className="flex h-full min-w-0 items-center gap-2 px-3 sm:px-4 overflow-hidden">
                    <SidebarTrigger className="-ml-1 shrink-0 text-[#0D2322]" />
                    <Separator orientation="vertical" className="hidden sm:block mr-2 data-[orientation=vertical]:h-4 shrink-0 bg-[#D3DEDB]" />
                    <div className="min-w-0 overflow-hidden">
                        <Breadcrumb>
                            <BreadcrumbList className="min-w-0 overflow-hidden text-[#566C6A]">
                                <BreadcrumbItem className="hidden md:block shrink-0">
                                    <BreadcrumbLink href="/iot-system" className="text-[#566C6A] hover:text-[#0D2322]">
                                        IoT System
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block shrink-0 text-[#8B9F9D]" />
                                <BreadcrumbItem className="min-w-0 overflow-hidden">
                                    <BreadcrumbPage className="truncate max-w-[56vw] sm:max-w-[60vw] md:max-w-none font-bold text-[#0D2322]">
                                        Map-ePay Unified Gateway
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>

                <div className="flex h-full items-center px-2 sm:px-4 shrink-0 max-w-[48vw] sm:max-w-none overflow-hidden">
                    <NavUser user={{ name: "IoT Engineer", email: "dev@iot.local" }} />
                </div>
            </header>

            {/* Main Content View with locked porcelain background */}
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#F4F7F6]">
                <PaymentGatewayModule />
            </main>
        </div>
    );
}
