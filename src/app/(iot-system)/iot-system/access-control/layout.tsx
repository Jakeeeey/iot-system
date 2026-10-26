"use client";

import React from "react";
import { AccessProvider, AccessHeader } from "@/modules/iot-system/access-control";

export default function AccessControlLayout({ children }: { children: React.ReactNode }) {
    return (
        <AccessProvider>
            <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-background">
                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b bg-card/40">
                    <AccessHeader />
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                    {children}
                </div>
            </div>
        </AccessProvider>
    );
}