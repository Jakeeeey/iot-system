"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { TerminalFleetNode } from "../../types";
import { PaymentIcon } from "../PaymentIcon";

const INITIAL_FLEET: TerminalFleetNode[] = [
    {
        id: "TERM-MNL-001",
        name: "Map-ePay Hybrid Pro",
        onlineCount: 4,
        totalCount: 4,
        description: "Dual Contact Chip + NFC Contactless + Fallback Magstripe (EMV L1/L2)",
        batteryLevel: "94%",
        network: "4G LTE / Dual-Band WiFi",
        firmwareVersion: "v4.1.2-PCI",
        status: "healthy",
    },
    {
        id: "SND-MNL-002",
        name: "Map-ePay Soundbox Q1",
        onlineCount: 6,
        totalCount: 6,
        description: "Real-time voice payment alert speaker with 4G dual-SIM automatic failover",
        batteryLevel: "100%",
        network: "eSIM 4G Direct",
        firmwareVersion: "v2.0.8-Audio",
        status: "healthy",
    },
    {
        id: "MPOS-MNL-003",
        name: "Mobile Cashier mPOS",
        onlineCount: 2,
        totalCount: 3,
        description: "Handheld Bluetooth BLE queue-busting floor checkout units",
        batteryLevel: "68%",
        network: "BLE 5.2 Mesh",
        firmwareVersion: "v5.2.0-Patch",
        status: "warning",
    },
];

export function TerminalFleetManager() {
    const [fleet, setFleet] = useState<TerminalFleetNode[]>(INITIAL_FLEET);
    const [isUpdatingOta, setIsUpdatingOta] = useState(false);
    const [soundboxSpeaking, setSoundboxSpeaking] = useState(false);

    const handleOtaUpdate = (terminalId: string) => {
        setIsUpdatingOta(true);
        toast.info("Dispatching OTA Firmware Patch", {
            description: `Sending encrypted signed binary to ${terminalId}...`,
        });

        setTimeout(() => {
            setFleet((prev) =>
                prev.map((t) =>
                    t.id === terminalId
                        ? { ...t, firmwareVersion: "v5.3.0-Latest", status: "healthy" }
                        : t
                )
            );
            setIsUpdatingOta(false);
            toast.success("OTA Firmware Update Complete", {
                description: `Terminal ${terminalId} updated to v5.3.0-Latest with certified EMV L2 kernel.`,
            });
        }, 1500);
    };

    const handleSoundboxVoiceTest = () => {
        setSoundboxSpeaking(true);
        toast.success("Soundbox Voice Broadcast Triggered", {
            description: "🔊 'Map-ePay received payment of ₱1,250.00 via QR Ph'",
        });

        // Play synthetic speech if web SpeechSynthesis is available in browser
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            try {
                const utterance = new SpeechSynthesisUtterance("Map-ePay received payment of 1,250 pesos via QR Ph");
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
            } catch {
                // Ignore speech error if unsupported
            }
        }

        setTimeout(() => {
            setSoundboxSpeaking(false);
        }, 3000);
    };

    const handleDukptKeyInject = (terminalId: string) => {
        toast.success("DUKPT Key Injected", {
            description: `Derived Unique Key Per Transaction renewed for ${terminalId} via HSM zone master key.`,
        });
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#D3DEDB] shadow-xs flex flex-col gap-5">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D3DEDB]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D2322] text-white flex items-center justify-center">
                        <PaymentIcon name="point_of_sale" className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-[#0D2322]">
                                POS Terminal Fleet &amp; Hardware Orchestration
                            </h2>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDF4F2] text-[#0D2322] font-mono font-bold border border-[#D3DEDB]">
                                Sec. J.4 / J.5 / J.7
                            </span>
                        </div>
                        <p className="text-xs text-[#566C6A]">
                            Centralized device management, remote OTA firmware deployment, and soundbox broadcast engine
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSoundboxVoiceTest}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            soundboxSpeaking
                                ? "bg-[#059669] text-white animate-pulse"
                                : "bg-[#EDF4F2] text-[#0D2322] hover:bg-[#E2EBE9] border border-[#D3DEDB]"
                        }`}
                    >
                        <PaymentIcon name="volume_up" className="w-4 h-4 text-[#D97706]" />
                        <span>{soundboxSpeaking ? "Broadcasting Voice..." : "Test Soundbox Broadcast"}</span>
                    </button>
                </div>
            </div>

            {/* Fleet Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fleet.map((t) => (
                    <div
                        key={t.id}
                        className="p-4 rounded-xl bg-[#F4F7F6] border border-[#D3DEDB] flex flex-col justify-between gap-3 hover:border-[#0D2322]/40 transition-all shadow-2xs"
                    >
                        <div>
                            <div className="flex items-start justify-between mb-1.5">
                                <div>
                                    <span className="text-xs font-mono text-[#566C6A] block">{t.id}</span>
                                    <h3 className="text-sm font-bold text-[#0D2322]">{t.name}</h3>
                                </div>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        t.status === "healthy"
                                            ? "bg-[#E8F5F1] text-[#0F5B46] border-[#BCE3D6]"
                                            : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                                    }`}
                                >
                                    {t.onlineCount}/{t.totalCount} Online
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A] leading-relaxed mb-3">{t.description}</p>
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t border-[#D3DEDB]/80 text-[11px] text-[#566C6A]">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                    <PaymentIcon name="battery_charging_full" className="w-3.5 h-3.5 text-[#059669]" />
                                    <span>Battery: {t.batteryLevel}</span>
                                </span>
                                <span className="font-mono text-[#0D2322] font-semibold">{t.network}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Firmware:</span>
                                <span className="font-mono font-bold text-[#0D2322]">{t.firmwareVersion}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                                type="button"
                                disabled={isUpdatingOta}
                                onClick={() => handleOtaUpdate(t.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#0D2322] text-white text-[11px] font-bold hover:bg-[#163331] transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                            >
                                <PaymentIcon name="system_update" className="w-3 h-3 text-[#D97706]" />
                                <span>OTA Patch</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDukptKeyInject(t.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D3DEDB] text-[#0D2322] text-[11px] font-semibold hover:bg-[#EDF4F2] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <PaymentIcon name="key" className="w-3 h-3 text-[#566C6A]" />
                                <span>DUKPT Key</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Security / Architecture Telemetry */}
            <div className="p-3 rounded-xl bg-[#EDF4F2] border border-[#D3DEDB] flex flex-wrap items-center justify-between gap-3 text-xs text-[#566C6A]">
                <div className="flex items-center gap-4 flex-wrap">
                    <span>
                        Kernel Spec: <strong className="text-[#0D2322]">EMVCo Level 1 &amp; 2 Contactless</strong>
                    </span>
                    <span>•</span>
                    <span>
                        Key Scheme: <strong className="text-[#0D2322]">DUKPT ANSI X9.24 Tier-3</strong>
                    </span>
                    <span>•</span>
                    <span>
                        Fallback Logic: <strong className="text-[#0D2322]">Chip First &rarr; NFC &rarr; Magstripe Intercept</strong>
                    </span>
                </div>
                <span className="text-[11px] text-[#059669] font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#059669]" />
                    Mesh Fleet Standby
                </span>
            </div>
        </div>
    );
}
