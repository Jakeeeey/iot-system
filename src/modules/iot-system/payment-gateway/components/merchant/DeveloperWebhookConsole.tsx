"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { WebhookLogItem } from "../../types";
import { PaymentIcon } from "../PaymentIcon";

const INITIAL_LOGS: WebhookLogItem[] = [
    {
        id: "WH-EVT-90412",
        event: "payment.succeeded",
        targetEndpoint: "https://api.merchantstore.ph/v1/webhooks/map-epay",
        payloadHash: "sha256:4f8e9a2b...c381",
        status: "200 OK",
        deliveredAt: "10:38:12 AM",
    },
    {
        id: "WH-EVT-90409",
        event: "payout.disbursed",
        targetEndpoint: "https://api.merchantstore.ph/v1/webhooks/map-epay",
        payloadHash: "sha256:d189c47e...a910",
        status: "200 OK",
        deliveredAt: "09:14:02 AM",
    },
    {
        id: "WH-EVT-90398",
        event: "chargeback.created",
        targetEndpoint: "https://api.merchantstore.ph/v1/webhooks/map-epay",
        payloadHash: "sha256:772ab3e1...120f",
        status: "408 Timeout",
        deliveredAt: "Yesterday",
    },
];

export function DeveloperWebhookConsole() {
    const [logs, setLogs] = useState<WebhookLogItem[]>(INITIAL_LOGS);
    const [webhookUrl, setWebhookUrl] = useState("https://api.merchantstore.ph/v1/webhooks/map-epay");
    const [showSecret, setShowSecret] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);

    const apiKeyPublic = "pk_live_mapepay_88419024f9a";
    const apiKeySecret = "sk_live_mapepay_sec_993410a8b9e8c";

    const handleCopy = (text: string, label: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            toast.success(`${label} Copied`, { description: text });
        }
    };

    const handleSimulateWebhook = (eventType: string) => {
        setIsSimulating(true);
        toast.info("Dispatching Webhook", {
            description: `Sending HMAC-SHA256 signed event '${eventType}' to ${webhookUrl}...`,
        });

        setTimeout(() => {
            const newLog: WebhookLogItem = {
                id: `WH-EVT-${Math.floor(10000 + Math.random() * 90000)}`,
                event: eventType,
                targetEndpoint: webhookUrl,
                payloadHash: `sha256:${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
                status: "200 OK",
                deliveredAt: "Just now",
            };
            setLogs((prev) => [newLog, ...prev]);
            setIsSimulating(false);
            toast.success("Webhook Delivered 200 OK", {
                description: `Merchant endpoint acknowledged signature '${eventType}'.`,
            });
        }, 600);
    };

    const handleRetry = (logId: string) => {
        toast.info("Retrying Webhook Delivery", {
            description: `Exponential backoff retry initiated for ${logId}...`,
        });
        setTimeout(() => {
            setLogs((prev) =>
                prev.map((l) => (l.id === logId ? { ...l, status: "200 OK", deliveredAt: "Retried now" } : l))
            );
            toast.success("Retry Succeeded: 200 OK", {
                description: `Event payload successfully acknowledged.`,
            });
        }, 500);
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#D3DEDB] shadow-xs flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D3DEDB]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D2322] text-white flex items-center justify-center">
                        <PaymentIcon name="key" className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-[#0D2322]">
                                Developer Sandbox &amp; Webhook Dispatcher
                            </h2>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] font-mono font-bold border border-[#D3DEDB]">
                                Sec. J.6
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            API keys, SDK endpoints, and cryptographically signed event notifications
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-[#E8F5F1] text-[#0F5B46] font-bold border border-[#BCE3D6] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#059669]" />
                        <span>SDK v3.4.0 Active</span>
                    </span>
                </div>
            </div>

            {/* API Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A]">
                            Public API Key (Client-Side)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#566C6A] font-mono border border-[#D3DEDB]">
                            Publishable
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={apiKeyPublic}
                            className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white border border-[#D3DEDB] text-[#0D2322]"
                        />
                        <button
                            type="button"
                            onClick={() => handleCopy(apiKeyPublic, "Public Key")}
                            className="p-2 rounded-lg bg-[#EDF4F2] hover:bg-[#E2EBE9] text-[#0D2322] transition-colors border border-[#D3DEDB] cursor-pointer"
                            title="Copy Public Key"
                        >
                            <PaymentIcon name="content_copy" className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A]">
                            Secret API Key (Server-Side)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-mono font-bold border border-[#FDE68A]">
                            Restricted
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type={showSecret ? "text" : "password"}
                            readOnly
                            value={apiKeySecret}
                            className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white border border-[#D3DEDB] text-[#0D2322]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="p-2 rounded-lg bg-[#EDF4F2] hover:bg-[#E2EBE9] text-[#0D2322] transition-colors border border-[#D3DEDB] cursor-pointer"
                            title={showSecret ? "Hide Secret" : "Reveal Secret"}
                        >
                            <PaymentIcon name={showSecret ? "visibility_off" : "visibility"} className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCopy(apiKeySecret, "Secret Key")}
                            className="p-2 rounded-lg bg-[#EDF4F2] hover:bg-[#E2EBE9] text-[#0D2322] transition-colors border border-[#D3DEDB] cursor-pointer"
                            title="Copy Secret Key"
                        >
                            <PaymentIcon name="content_copy" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Webhook Endpoint & Simulation Strip */}
            <div className="p-4 rounded-xl bg-[#EDF4F2] border border-[#D3DEDB] flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <span className="text-xs font-bold text-[#0D2322]">Registered Webhook Listener URL</span>
                        <p className="text-[11px] text-[#566C6A]">Events are signed using HMAC-SHA256 signature in MapEPay-Signature header</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => toast.success("Webhook URL Saved", { description: webhookUrl })}
                        className="text-xs text-[#D97706] font-bold hover:underline self-start sm:self-auto cursor-pointer"
                    >
                        Save Configuration
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white border border-[#D3DEDB] text-[#0D2322] focus:outline-none focus:border-[#0D2322]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D3DEDB]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#566C6A]">
                        Test Events Simulator:
                    </span>
                    <button
                        type="button"
                        disabled={isSimulating}
                        onClick={() => handleSimulateWebhook("payment.succeeded")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#D3DEDB] text-[#0D2322] text-xs font-semibold hover:bg-[#F4F7F6] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        + payment.succeeded
                    </button>
                    <button
                        type="button"
                        disabled={isSimulating}
                        onClick={() => handleSimulateWebhook("payout.disbursed")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#D3DEDB] text-[#0D2322] text-xs font-semibold hover:bg-[#F4F7F6] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        + payout.disbursed
                    </button>
                    <button
                        type="button"
                        disabled={isSimulating}
                        onClick={() => handleSimulateWebhook("chargeback.created")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#D3DEDB] text-[#0D2322] text-xs font-semibold hover:bg-[#F4F7F6] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        + chargeback.created
                    </button>
                </div>
            </div>

            {/* Webhook Delivery Log Table */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[#0D2322] uppercase tracking-wider">
                    Recent Webhook Dispatches
                </span>
                <div className="overflow-x-auto w-full border border-[#D3DEDB] rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-[#EDF4F2] text-[#566C6A] uppercase font-bold text-[10px] border-b border-[#D3DEDB]">
                            <tr>
                                <th className="py-2.5 px-3">Event ID &amp; Type</th>
                                <th className="py-2.5 px-3">Target Endpoint</th>
                                <th className="py-2.5 px-3">Signature Digest</th>
                                <th className="py-2.5 px-3">Delivered</th>
                                <th className="py-2.5 px-3 text-center">Status</th>
                                <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D3DEDB]/60">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-[#F4F7F6] transition-colors">
                                    <td className="py-2 px-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#0D2322] font-mono">{log.event}</span>
                                            <span className="text-[10px] text-[#566C6A] font-mono">{log.id}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 text-[#566C6A] font-mono text-[11px] max-w-[200px] truncate">
                                        {log.targetEndpoint}
                                    </td>
                                    <td className="py-2 px-3 text-[#566C6A] font-mono text-[11px]">{log.payloadHash}</td>
                                    <td className="py-2 px-3 text-[#566C6A]">{log.deliveredAt}</td>
                                    <td className="py-2 px-3 text-center">
                                        <span
                                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] border inline-block ${
                                                log.status === "200 OK"
                                                    ? "bg-[#E8F5F1] text-[#0F5B46] border-[#BCE3D6]"
                                                    : "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                                            }`}
                                        >
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        {log.status !== "200 OK" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleRetry(log.id)}
                                                className="px-2 py-1 rounded bg-[#0D2322] text-white text-[10px] font-bold hover:bg-[#163331] cursor-pointer"
                                            >
                                                Retry Now
                                            </button>
                                        ) : (
                                            <span className="text-[#566C6A] text-[10px]">Delivered</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
