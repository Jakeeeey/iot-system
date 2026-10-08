"use client";

import React from "react";
import { RoleProvider } from "@/modules/iot-system/dsm/context/role-context";
import { AccountProvider } from "@/modules/iot-system/dsm/context/account-context";
import { Header as DsmHeader } from "@/modules/iot-system/dsm/components/dsm-header";

export default function DsmLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleProvider>
            <AccountProvider>
                <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-background">
                    <DsmHeader />
                    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                        {children}
                    </div>
                </div>
            </AccountProvider>
        </RoleProvider>
    );
}
