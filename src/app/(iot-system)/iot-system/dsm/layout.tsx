import React from "react";
import { DsmClientLayout } from "./dsm-client-layout";

export const metadata = {
    title: "DSM - Deye Solar Monitoring | IoT System",
    description: "Enterprise Deye Solar Inverter Telemetry, Multi-Account Fleet Synoptics, and Trigonometric Harmonics",
};

export default function DsmLayout({ children }: { children: React.ReactNode }) {
    return <DsmClientLayout>{children}</DsmClientLayout>;
}
