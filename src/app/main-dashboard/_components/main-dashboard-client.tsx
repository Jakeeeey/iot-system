"use client";

import * as React from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import Image from "next/image";
import {
    ArrowUpRight,
    ChevronRight,
    Search,
    Timer,
} from "lucide-react";
import { motion } from "framer-motion";

import { CommandPalette } from "@/components/main-dashboard/command-palette";
import { UserMenu } from "@/components/main-dashboard/user-menu";
import { AnnouncementModal } from "@/components/main-dashboard/announcement-modal";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AnimatedBackground } from "@/components/command-center/AnimatedBackground";
import { Announcement } from "@/types/announcement";

export type Status = "active" | "comingSoon";

export type SubsystemCategory =
    | "Operations"
    | "Customer & Engagement"
    | "Corporate Services"
    | "Governance & Assurance"
    | "Monitoring & Oversight";

export type SubmoduleItem = {
    id: string;
    title: string;
    status?: Status;
};

export type SubsystemItem = {
    id: string;
    title: string;
    subtitle?: string;
    href?: string;
    status: Status;
    category: SubsystemCategory;
    iconName: string; // Passed as string from server
    icon: React.ComponentType<{ className?: string }>; // Resolved on client
    accentClass: string;
    tag?: string;
    submodules: SubmoduleItem[];
};

const CATEGORY_ORDER: SubsystemCategory[] = [
    "Operations",
    "Customer & Engagement",
    "Corporate Services",
    "Governance & Assurance",
    "Monitoring & Oversight",
];

const CATEGORY_META: Record<SubsystemCategory, { title: string; description: string }> =
{
    Operations: {
        title: "Operations",
        description: "Core execution systems (supply, production, delivery, projects).",
    },
    "Customer & Engagement": {
        title: "Customer & Engagement",
        description: "Customer lifecycle, communications, and engagement touchpoints.",
    },
    "Corporate Services": {
        title: "Corporate Services",
        description: "Back-office functions supporting the organization (Finance, HR).",
    },
    "Governance & Assurance": {
        title: "Governance & Assurance",
        description: "Risk, audit, and compliance governance workflows.",
    },
    "Monitoring & Oversight": {
        title: "Monitoring & Oversight",
        description: "Cross-cutting monitoring, KPIs, and program oversight.",
    },
};

const CATEGORY_CODE: Record<SubsystemCategory, string> = {
    Operations: "OPS",
    "Customer & Engagement": "C&E",
    "Corporate Services": "CORP",
    "Governance & Assurance": "GOV",
    "Monitoring & Oversight": "MON",
};

const HEADER_TOP_PAD = 96; // px — fixed compact offset

function normalize(s: string) {
    return (s || "").toLowerCase().trim();
}

function filterSubsystems(items: SubsystemItem[], q: string, statusFilter: "ALL" | Status = "ALL"): SubsystemItem[] {
    const query = normalize(q);
    return items.filter((x) => {
        if (statusFilter !== "ALL" && x.status !== statusFilter) return false;
        if (!query) return true;
        const subHay = x.submodules.map((m) => `${m.title} ${m.status ?? ""}`).join(" ");
        const hay = [x.title, x.subtitle ?? "", x.tag ?? "", x.category, x.status, x.href ?? "", subHay].join(" ");
        return normalize(hay).includes(query);
    });
}

function groupByCategory(items: SubsystemItem[]) {
    const map = new Map<SubsystemCategory, SubsystemItem[]>();
    items.forEach((s) => {
        const list = map.get(s.category) ?? [];
        list.push(s);
        map.set(s.category, list);
    });

    return CATEGORY_ORDER.map((cat) => ({
        category: cat,
        items: (map.get(cat) ?? []).sort((a, b) => a.title.localeCompare(b.title)),
    })).filter((g) => g.items.length > 0);
}

function StatusBadge({ status }: { status: Status }) {
    if (status === "active") {
        return (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                <Icons.CheckCircle2 className="h-3 w-3" />
                Active
            </span>
        );
    }
    return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-500/10 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-zinc-600 ring-1 ring-zinc-500/15 dark:text-zinc-300">
            <Timer className="h-3 w-3" />
            Soon
            </span>
    );
}

function HoverLift({
    children,
    disabled,
    className,
}: {
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "transition-all duration-150 ease-out",
                !disabled &&
                "hover:-translate-y-[1px] active:translate-y-0",
                disabled && "opacity-95",
                className
            )}
        >
            {children}
        </div>
    );
}

const containerVars = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.02,
        },
    },
};

const itemVars = {
    hidden: { opacity: 0, y: 4 },
    show: { opacity: 1, y: 0, transition: { duration: 0.15 } },
};

export type DashboardRegistryItem = Omit<SubsystemItem, "icon">;

function useClock() {
    const [now, setNow] = React.useState<string>("--:--:--");
    React.useEffect(() => {
        const tick = () => {
            const d = new Date();
            setNow(d.toLocaleTimeString("en-GB", { hour12: false }));
        };
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);
    return now;
}

export default function MainDashboardClient({
    initialSubsystems,
    userFullName,
    userEmail,
    announcements,
    isDealerOver = false
}: {
    initialSubsystems: DashboardRegistryItem[];
    userFullName: string;
    userEmail: string;
    announcements?: Announcement[];
    isDealerOver?: boolean;
}) {
    const announcementsList = announcements || [];
    const hasAnnouncements = announcementsList.length > 0;
    const [showAnnouncement, setShowAnnouncement] = React.useState(hasAnnouncements);

    // Helper to check if rankings modal should auto-popup (Fresh login + haven't closed yet)
    const checkShouldAutoOpenRankings = React.useCallback(() => {
        if (!isDealerOver) return false;
        try {
            const hasSeen = localStorage.getItem("dealerover_salesman_ranking") === "true";
            const isFreshLogin = sessionStorage.getItem("just_logged_in") === "true";
            // Must be fresh login and hasn't closed it yet
            return isFreshLogin && !hasSeen;
        } catch {
            return false;
        }
    }, [isDealerOver]);

    // Initial sequencing: if no announcement, check if fresh login & haven't seen rankings
    React.useEffect(() => {
        if (!hasAnnouncements && checkShouldAutoOpenRankings()) {
            // Small timeout to guarantee global listener in layout is mounted
            const timer = setTimeout(() => {
                window.dispatchEvent(new CustomEvent("open-dealerover-salesman-rankings"));
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [hasAnnouncements, checkShouldAutoOpenRankings]);

    // When announcement closes / finishes, check if fresh login & haven't seen rankings
    const handleAnnouncementOpenChange = (open: boolean) => {
        setShowAnnouncement(open);
        if (!open && checkShouldAutoOpenRankings()) {
            // Trigger rankings modal after announcement is dismissed
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent("open-dealerover-salesman-rankings"));
            }, 300);
        }
    };

    const handleAcknowledge = async (memoIds: number[]) => {
        try {
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memoIds })
            });
            if (res.ok) {
                window.dispatchEvent(new CustomEvent("announcements-updated"));
            } else {
                console.error("Failed to acknowledge memos:", await res.text());
            }
        } catch (err) {
            console.error("Error acknowledging memos:", err);
        }
    };

    const [query, setQuery] = React.useState("");
    const [catFilter, setCatFilter] = React.useState<"ALL" | SubsystemCategory>("ALL");
    const [statusFilter, setStatusFilter] = React.useState<"ALL" | Status>("ALL");
    const clock = useClock();

    const trackAccess = (id: string) => {
        // Access tracking disabled
        console.log("Access tracking disabled for:", id);
    };

    const resolvedSubsystems = React.useMemo(() => {
        return initialSubsystems.map((s): SubsystemItem => {
            const IconComponent = Icons[s.iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }> || Icons.Activity;
            return {
                ...s,
                icon: IconComponent
            };
        });
    }, [initialSubsystems]);

    const categoryCounts = React.useMemo(() => {
        const map = new Map<SubsystemCategory, number>();
        resolvedSubsystems.forEach((s) => map.set(s.category, (map.get(s.category) ?? 0) + 1));
        return map;
    }, [resolvedSubsystems]);

    const filtered = React.useMemo(() => {
        const byStatus = filterSubsystems(resolvedSubsystems, query, statusFilter === "ALL" ? "ALL" : statusFilter);
        if (catFilter === "ALL") return byStatus;
        return byStatus.filter((s) => s.category === catFilter);
    }, [resolvedSubsystems, query, statusFilter, catFilter]);

    const grouped = React.useMemo(() => groupByCategory(filtered), [filtered]);

    const totalActiveVisible = React.useMemo(
        () => resolvedSubsystems.filter((s) => s.status === "active").length,
        [resolvedSubsystems]
    );

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden">
            <div className="opacity-70 dark:opacity-50">
                <AnimatedBackground />
            </div>

            {/* SLIM HUD HEADER (~52px) */}
            <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-900/10 bg-white/80 px-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
                <div className="mx-auto flex h-[52px] w-full max-w-[1400px] items-center justify-between gap-3 py-2">
                    {/* Left: logo + HUD readouts */}
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex shrink-0 items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border border-slate-900/10 bg-slate-900/5 p-1 dark:border-white/10 dark:bg-white/5">
                                <Image
                                    src="/vos.png"
                                    alt="VOS Logo"
                                    width={18}
                                    height={18}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-sm font-black uppercase italic leading-none tracking-tighter">
                                    VOS ERP
                                </span>
                                <span className="mt-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 opacity-70 dark:text-slate-400">OPS-CONSOLE</span>
                            </div>
                        </div>
                        <div className="hidden items-center gap-3 border-l border-slate-900/10 pl-3 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 md:flex dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                {resolvedSubsystems.length} SYSTEMS SYNCED
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                                {totalActiveVisible} CORES ONLINE
                            </span>
                            <span className="hidden tabular-nums text-slate-400 lg:inline dark:text-slate-500">{clock}</span>
                        </div>
                    </div>

                    {/* Right: controls */}
                    <div className="flex items-center gap-2">
                        <div className="hidden items-center border-r border-slate-900/10 pr-2 sm:flex dark:border-white/10">
                            <CommandPalette subsystems={resolvedSubsystems} />
                        </div>
                        <UserMenu fullName={userFullName} email={userEmail} isDealerOver={isDealerOver} />
                    </div>
                </div>
            </header>

            {/* CONTENT */}
            <main
                className="mx-auto w-full max-w-[1400px] flex-1 px-3 pb-8 sm:px-4"
                style={{ paddingTop: HEADER_TOP_PAD }}
            >
                {/* COMPACT CONTROL STRIP */}
                <div className="mb-3 flex flex-col gap-2 border border-slate-900/10 bg-white/60 px-2.5 py-2 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {/* Category tabs */}
                        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Category filter">
                            <button
                                onClick={() => setCatFilter("ALL")}
                                className={cn(
                                    "rounded-sm border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                                    catFilter === "ALL"
                                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                                        : "border-slate-900/10 text-slate-500 hover:border-cyan-500/30 hover:text-slate-800 dark:border-white/10 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                            >
                                ALL [{resolvedSubsystems.length}]
                            </button>
                            {CATEGORY_ORDER.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCatFilter(c)}
                                    className={cn(
                                        "rounded-sm border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                                        catFilter === c
                                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                                            : "border-slate-900/10 text-slate-500 hover:border-cyan-500/30 hover:text-slate-800 dark:border-white/10 dark:text-slate-400 dark:hover:text-slate-200"
                                    )}
                                >
                                    {CATEGORY_CODE[c]} [{categoryCounts.get(c) ?? 0}]
                                </button>
                            ))}
                        </div>

                        <div className="mx-1 hidden h-4 w-px bg-slate-900/10 sm:block dark:bg-white/10" />

                        {/* Status segmented */}
                        <div className="flex items-center gap-1" role="group" aria-label="Status filter">
                            {(["ALL", "active", "comingSoon"] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={cn(
                                        "rounded-sm border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                                        statusFilter === s
                                            ? s === "active"
                                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                                : s === "comingSoon"
                                                    ? "border-zinc-500/40 bg-zinc-500/10 text-zinc-700 dark:text-zinc-200"
                                                    : "border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                                            : "border-slate-900/10 text-slate-500 hover:border-cyan-500/30 dark:border-white/10 dark:text-slate-400"
                                    )}
                                >
                                    {s === "ALL" ? "ALL" : s === "active" ? "ACTIVE" : "SOON"}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative ml-auto flex min-w-[160px] flex-1 items-center sm:max-w-[240px] sm:flex-none">
                            <Search className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="FILTER SYSTEMS..."
                                aria-label="Filter subsystems"
                                className="h-7 w-full rounded-sm border border-slate-900/10 bg-white/70 pl-7 pr-2 font-mono text-[11px] uppercase tracking-wider text-slate-800 placeholder:text-slate-400 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        <span className="truncate">
                            {catFilter === "ALL" ? "ALL SECTORS" : CATEGORY_META[catFilter].title.toUpperCase()} // {statusFilter === "ALL" ? "ANY STATUS" : statusFilter === "active" ? "ACTIVE ONLY" : "SOON ONLY"}
                        </span>
                        <span className="shrink-0 tabular-nums">SHOWING {filtered.length}/{resolvedSubsystems.length}</span>
                    </div>
                </div>

                <motion.div
                    variants={containerVars}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                >
                    {filtered.length === 0 ? (
                        <Card className="border bg-background/50 p-6 backdrop-blur">
                            <div className="text-sm text-muted-foreground">
                                {query.trim()
                                    ? `No visible subsystems match "${query.trim()}" for your account.`
                                    : "You do not have access to any subsystems. Please contact your Administrator."}
                            </div>
                        </Card>
                    ) : (
                        grouped.map((group) => {
                            const meta = CATEGORY_META[group.category];
                            return (
                                <motion.section key={group.category} variants={itemVars}>
                                    {/* Slim mono divider */}
                                    <div className="mb-1 flex items-center gap-2 border-b border-slate-900/10 px-1 pb-1 dark:border-white/10">
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                            {CATEGORY_CODE[group.category]} // {meta.title}
                                        </span>
                                        <span className="font-mono text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                                            [{group.items.length}]
                                        </span>
                                        <span className="hidden truncate font-mono text-[9px] uppercase tracking-widest text-slate-400/70 sm:inline dark:text-slate-500/70">
                                            — {meta.description}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        {group.items.map((s) => (
                                            <SubsystemRow
                                                key={s.id}
                                                subsystem={s}
                                                onAccess={() => trackAccess(s.id)}
                                            />
                                        ))}
                                    </div>
                                </motion.section>
                            );
                        })
                    )}
                </motion.div>
            </main>

            {/* Announcement Modal Overlay */}
            <AnnouncementModal
                open={showAnnouncement}
                onOpenChange={handleAnnouncementOpenChange}
                announcements={announcementsList}
                mode="popup"
                onAcknowledge={handleAcknowledge}
            />
        </div>
    );
}

function SubsystemRow({ subsystem, onAccess, className }: { subsystem: SubsystemItem; onAccess?: () => void; className?: string }) {
    const isComing = subsystem.status === "comingSoon";
    const Icon = subsystem.icon;
    const interactive = !isComing && !!subsystem.href;

    const row = (
        <div
            className={cn(
                "group flex items-center gap-2.5 border border-slate-900/10 bg-white/60 px-2.5 py-1.5 backdrop-blur transition-colors",
                "hover:border-cyan-500/30 hover:bg-white/80",
                "dark:border-white/10 dark:bg-slate-950/60 dark:hover:border-cyan-500/30 dark:hover:bg-slate-900/70",
                !interactive && "cursor-not-allowed opacity-70",
                className
            )}
        >
            {/* Status dot */}
            <span
                className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    subsystem.status === "active"
                        ? "animate-pulse bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                        : "bg-zinc-400 dark:bg-zinc-600"
                )}
                aria-hidden
            />

            {/* Icon */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-900/10 bg-slate-900/5 dark:border-white/10 dark:bg-white/5">
                <Icon className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
            </div>

            {/* Title + tag + category */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <h3 className="truncate text-[13px] font-bold leading-tight tracking-tight text-slate-800 dark:text-slate-100">
                    {subsystem.title}
                </h3>
                {subsystem.tag ? (
                    <span className="hidden shrink-0 rounded-sm bg-slate-900/5 px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600 ring-1 ring-slate-900/10 sm:inline dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                        {subsystem.tag}
                    </span>
                ) : null}
                <span className="hidden shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 md:inline dark:text-slate-500">
                    {CATEGORY_CODE[subsystem.category]}
                </span>
                {subsystem.subtitle ? (
                    <span className="hidden min-w-0 flex-1 truncate text-[11px] italic text-slate-500 lg:inline dark:text-slate-400">
                        {subsystem.subtitle}
                    </span>
                ) : null}
            </div>

            {/* Submodules */}
            <div className={cn("hidden items-center gap-1 md:flex", isComing && "opacity-50")}>
                {subsystem.submodules.slice(0, 3).map((m) => (
                    <Badge
                        key={m.id}
                        variant="outline"
                        className={cn(
                            "h-4 shrink-0 px-1.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                            m.status === "comingSoon" && "opacity-60"
                        )}
                    >
                        {m.title}
                    </Badge>
                ))}
                {subsystem.submodules.length > 3 && (
                    <span className="font-mono text-[9px] font-bold text-slate-400">+{subsystem.submodules.length - 3}</span>
                )}
            </div>

            <StatusBadge status={subsystem.status} />

            {/* Quick launch */}
            <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border transition-colors",
                interactive
                    ? "border-slate-900/10 text-slate-400 group-hover:border-cyan-500/40 group-hover:text-cyan-600 dark:border-white/10 dark:text-slate-500 dark:group-hover:text-cyan-300"
                    : "border-slate-900/5 text-slate-300 dark:border-white/5 dark:text-slate-600"
            )}>
                {isComing ? <Timer className="h-3.5 w-3.5" /> : interactive ? <ChevronRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
            </span>
        </div>
    );

    if (!interactive) {
        return (
            <HoverLift disabled className={className}>
                <div
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                    tabIndex={0}
                    aria-label={`${subsystem.title} (coming soon)`}
                    aria-disabled="true"
                >
                    {row}
                </div>
            </HoverLift>
        );
    }

    return (
        <HoverLift className={className}>
            <Link
                href={subsystem.href as string}
                onClick={onAccess}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                aria-label={`Open ${subsystem.title}`}
            >
                {row}
            </Link>
        </HoverLift>
    );
}
