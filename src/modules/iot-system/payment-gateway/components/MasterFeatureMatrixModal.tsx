"use client";

import React, { useState, useMemo } from "react";
import { MasterFeatureItem, DashboardSurface, FeatureSectionKey } from "../types";
import { MASTER_FEATURES_INVENTORY, SECTION_METADATA } from "../services/master-features.data";
import { PaymentIcon } from "./PaymentIcon";

interface MasterFeatureMatrixModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigateSurface?: (surface: "consumer-wallet" | "merchant-portal" | "ops-console") => void;
}

export function MasterFeatureMatrixModal({
    isOpen,
    onClose,
    onNavigateSurface,
}: MasterFeatureMatrixModalProps) {
    const [search, setSearch] = useState("");
    const [selectedSurface, setSelectedSurface] = useState<DashboardSurface | "All">("All");
    const [selectedSection, setSelectedSection] = useState<FeatureSectionKey | "All">("All");

    const filteredFeatures = useMemo(() => {
        return MASTER_FEATURES_INVENTORY.filter((f) => {
            const matchesSearch =
                f.title.toLowerCase().includes(search.toLowerCase()) ||
                f.description.toLowerCase().includes(search.toLowerCase()) ||
                f.id.toLowerCase().includes(search.toLowerCase()) ||
                f.sectionTitle.toLowerCase().includes(search.toLowerCase());

            const matchesSurface =
                selectedSurface === "All" || f.dashboards.includes(selectedSurface);

            const matchesSection =
                selectedSection === "All" || f.sectionKey === selectedSection;

            return matchesSearch && matchesSurface && matchesSection;
        });
    }, [search, selectedSurface, selectedSection]);

    if (!isOpen) return null;

    const surfaceCounts = {
        User: MASTER_FEATURES_INVENTORY.filter((f) => f.dashboards.includes("User")).length,
        Merchant: MASTER_FEATURES_INVENTORY.filter((f) => f.dashboards.includes("Merchant")).length,
        "Admin/Ops": MASTER_FEATURES_INVENTORY.filter((f) => f.dashboards.includes("Admin/Ops")).length,
        System: MASTER_FEATURES_INVENTORY.filter((f) => f.dashboards.includes("System")).length,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A1C1B]/75 backdrop-blur-xs transition-opacity duration-200">
            <div className="fixed inset-0" onClick={onClose} />

            <div className="relative z-10 w-full max-w-5xl h-[92vh] max-h-[900px] bg-white rounded-2xl shadow-2xl border border-[#D3DEDB] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Bar */}
                <div className="px-6 py-4 border-b border-[#D3DEDB] flex items-center justify-between bg-[#F4F7F6]/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0D2322] flex items-center justify-center text-[#D97706] shadow-sm">
                            <PaymentIcon name="inventory_2" className="w-5 h-5 text-[#D97706]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-extrabold text-[#0D2322] tracking-tight">
                                    Master Feature Inventory
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-[#D97706]/15 text-[#D97706] text-xs font-bold font-mono">
                                    87 Items
                                </span>
                            </div>
                            <p className="text-xs text-[#566C6A]">
                                Digital Wallet &amp; Payment Gateway Consolidated Specification (Sec. A – M)
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#566C6A] hover:bg-white hover:text-[#0D2322] border border-transparent hover:border-[#D3DEDB] transition-all cursor-pointer"
                    >
                        <PaymentIcon name="close" className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter and Search Controls */}
                <div className="p-4 sm:px-6 bg-white border-b border-[#D3DEDB] flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Search Box */}
                        <div className="relative flex-1">
                            <PaymentIcon name="search" className="absolute left-3.5 top-2.5 w-4 h-4 text-[#566C6A]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by feature title, ID (e.g., A.1, K.4), or keyword..."
                                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F4F7F6] text-sm text-[#0D2322] border border-[#D3DEDB] focus:bg-white focus:border-[#D97706] focus:outline-none transition-all"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-2.5 text-xs text-[#566C6A] hover:text-[#0D2322]"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Surface Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            <button
                                type="button"
                                onClick={() => setSelectedSurface("All")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                    selectedSurface === "All"
                                        ? "bg-[#0D2322] text-white shadow-xs"
                                        : "bg-[#F4F7F6] text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                                }`}
                            >
                                All Surfaces (87)
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedSurface("User")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                    selectedSurface === "User"
                                        ? "bg-[#0D2322] text-white shadow-xs"
                                        : "bg-[#F4F7F6] text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                                }`}
                            >
                                User App ({surfaceCounts.User})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedSurface("Merchant")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                    selectedSurface === "Merchant"
                                        ? "bg-[#0D2322] text-white shadow-xs"
                                        : "bg-[#F4F7F6] text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                                }`}
                            >
                                Merchant ({surfaceCounts.Merchant})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedSurface("Admin/Ops")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                    selectedSurface === "Admin/Ops"
                                        ? "bg-[#0D2322] text-white shadow-xs"
                                        : "bg-[#F4F7F6] text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                                }`}
                            >
                                Admin/Ops ({surfaceCounts["Admin/Ops"]})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedSurface("System")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                    selectedSurface === "System"
                                        ? "bg-[#0D2322] text-white shadow-xs"
                                        : "bg-[#F4F7F6] text-[#566C6A] hover:text-[#0D2322] border border-[#D3DEDB]"
                                }`}
                            >
                                System ({surfaceCounts.System})
                            </button>
                        </div>
                    </div>

                    {/* Section Dropdown Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto text-xs">
                        <span className="text-[#566C6A] font-semibold shrink-0">Section Filter:</span>
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value as FeatureSectionKey | "All")}
                            aria-label="Filter features by specification section"
                            className="h-8 px-3 rounded-lg bg-[#F4F7F6] text-xs font-medium text-[#0D2322] border border-[#D3DEDB] focus:outline-none focus:border-[#D97706]"
                        >
                            <option value="All">All Sections (A to M)</option>
                            {Object.entries(SECTION_METADATA).map(([key, meta]) => (
                                <option key={key} value={key}>
                                    Sec. {key} — {meta.title} ({meta.count} items)
                                </option>
                            ))}
                        </select>
                        <span className="text-[#8B9F9D] text-[11px] ml-auto shrink-0 font-mono">
                            Showing {filteredFeatures.length} of 87 features
                        </span>
                    </div>
                </div>

                {/* Features List Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4F7F6]/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {filteredFeatures.map((item: MasterFeatureItem) => {
                            const isUser = item.dashboards.includes("User");
                            const isMerchant = item.dashboards.includes("Merchant");
                            const isAdmin = item.dashboards.includes("Admin/Ops");

                            return (
                                <div
                                    key={item.id}
                                    className="p-4 rounded-xl bg-white border border-[#D3DEDB] shadow-xs hover:border-[#D97706]/40 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-md bg-[#0D2322] text-[#D97706] text-xs font-bold font-mono">
                                                    {item.id}
                                                </span>
                                                <span className="text-[11px] text-[#566C6A] font-semibold uppercase tracking-wider">
                                                    Sec. {item.sectionKey}
                                                </span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-[#E8F5F1] text-[#0F5B46] border border-[#BCE3D6] text-[10px] font-bold">
                                                {item.status}
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-bold text-[#0D2322] leading-snug">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-[#566C6A] leading-relaxed mt-1">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-[#EDF2F1] text-[11px]">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[#8B9F9D] font-medium">Surfaces:</span>
                                            {item.dashboards.map((dash) => (
                                                <span
                                                    key={dash}
                                                    className="px-1.5 py-0.5 rounded bg-[#EDF2F1] text-[#0D2322] font-semibold text-[10px]"
                                                >
                                                    {dash}
                                                </span>
                                            ))}
                                        </div>

                                        {onNavigateSurface && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onClose();
                                                    if (isUser) onNavigateSurface("consumer-wallet");
                                                    else if (isMerchant) onNavigateSurface("merchant-portal");
                                                    else if (isAdmin) onNavigateSurface("ops-console");
                                                }}
                                                className="text-xs font-bold text-[#D97706] hover:text-[#E07A1F] flex items-center gap-0.5 cursor-pointer"
                                            >
                                                <span>Launch View</span>
                                                <PaymentIcon name="arrow_forward" className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="px-6 py-3 bg-white border-t border-[#D3DEDB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#566C6A]">
                    <span>
                        Master Feature Inventory strictly mapped to Map-ePay Subsystem Specifications.
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg bg-[#0D2322] text-white font-bold hover:bg-[#163331] transition-colors cursor-pointer"
                    >
                        Close Inventory
                    </button>
                </div>
            </div>
        </div>
    );
}
