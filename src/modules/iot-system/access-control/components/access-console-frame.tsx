"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AccessConsoleFrameProps {
    initialTab?: string;
    emergencyTrigger?: boolean;
}

const TAB_TO_ROUTE: Record<string, string> = {
    "tab-command": "/iot-system/access-control",
    "tab-controllers": "/iot-system/access-control/controllers",
    "tab-users": "/iot-system/access-control/users",
    "tab-monitor": "/iot-system/access-control/monitor",
    "tab-history": "/iot-system/access-control/history",
    "tab-extended": "/iot-system/access-control/extended",
};

export function AccessConsoleFrame({
    initialTab = "tab-command",
    emergencyTrigger = false,
}: AccessConsoleFrameProps) {
    const router = useRouter();
    const pathname = usePathname();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Sync inner iframe tab switches back to parent Next.js router
    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.data && event.data.type === "ACCESS_TAB_CHANGED") {
                const targetTab = event.data.tab;
                const nextRoute = TAB_TO_ROUTE[targetTab];
                if (nextRoute && pathname !== nextRoute) {
                    router.push(nextRoute);
                }
            }
        }
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [router, pathname]);

    // Send postMessage when initialTab changes without reloading the iframe
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: "SET_ACCESS_TAB", tab: initialTab },
                "*"
            );
        }
    }, [initialTab]);

    // Construct URL with query parameters
    const queryParams = new URLSearchParams();
    if (initialTab) queryParams.set("tab", initialTab);
    if (emergencyTrigger) queryParams.set("emergency", "1");
    const iframeSrc = `/iot-system/access-control/index.html?${queryParams.toString()}`;

    return (
        <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0c1017]">
            <iframe
                ref={iframeRef}
                src={iframeSrc}
                title="ACCESS Professional - Enterprise Door Control Management"
                className="w-full h-full flex-1 border-0"
                style={{ width: "100%", height: "100%", minHeight: "100%", border: "none" }}
            />
        </div>
    );
}
