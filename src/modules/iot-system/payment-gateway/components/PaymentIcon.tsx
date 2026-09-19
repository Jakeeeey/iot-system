"use client";

import React from "react";
import {
    Wallet,
    Send,
    QrCode,
    Receipt,
    PlusCircle,
    Minus,
    ShieldCheck,
    Clock,
    CheckCircle,
    Check,
    Shield,
    Copy,
    PiggyBank,
    CreditCard,
    Download,
    User,
    ArrowRight,
    ArrowUp,
    X,
    Share2,
    Gauge,
    Bell,
    RefreshCw,
    Zap,
    Droplets,
    Wifi,
    Landmark,
    Radio,
    Key,
    Lock,
    ShoppingCart,
    ShoppingBag,
    Globe,
    Store,
    Megaphone,
    Smartphone,
    Scale,
    Camera,
    GitFork,
    AlertTriangle,
    Eye,
    EyeOff,
    Paperclip,
    Fingerprint,
    HelpCircle,
    Search,
    SlidersHorizontal,
    Activity,
    BatteryCharging,
    CheckCircle2,
    type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
    // Wallet & Currency
    account_balance_wallet: Wallet,
    wallet: Wallet,
    payments: Wallet,
    savings: PiggyBank,
    credit_card: CreditCard,
    currency_exchange: RefreshCw,

    // Transfers & Actions
    send: Send,
    send_money: Send,
    qr_code_scanner: QrCode,
    qr_code_2: QrCode,
    receipt_long: Receipt,
    receipt: Receipt,
    add_circle: PlusCircle,
    add_link: PlusCircle,
    horizontal_rule: Minus,
    arrow_forward: ArrowRight,
    arrow_upward: ArrowUp,
    download: Download,
    file_download: Download,
    share: Share2,
    sync: RefreshCw,
    system_update: RefreshCw,

    // Security & Status
    verified_user: ShieldCheck,
    verified: CheckCircle2,
    shield: Shield,
    security: Shield,
    check_circle: CheckCircle,
    check: Check,
    lock: Lock,
    key: Key,
    fingerprint: Fingerprint,
    how_to_reg: Fingerprint,
    warning: AlertTriangle,

    // Utilities & Hardware
    schedule: Clock,
    timer: Clock,
    content_copy: Copy,
    account_circle: User,
    person: User,
    contacts: User,
    close: X,
    speed: Gauge,
    notifications_active: Bell,
    electric_bolt: Zap,
    water_drop: Droplets,
    wifi: Wifi,
    account_balance: Landmark,
    contactless: Radio,
    shopping_cart: ShoppingCart,
    shopping_bag: ShoppingBag,
    shopping_cart_checkout: ShoppingCart,
    public: Globe,
    point_of_sale: Store,
    store: Store,
    speaker_phone: Megaphone,
    volume_up: Megaphone,
    devices: Smartphone,
    gavel: Scale,
    photo_camera: Camera,
    call_split: GitFork,
    visibility: Eye,
    visibility_off: EyeOff,
    attachment: Paperclip,
    filter_list: SlidersHorizontal,
    search: Search,
    sensors: Activity,
    battery_charging_full: BatteryCharging,
    assignment_turned_in: CheckCircle,
    help: HelpCircle,
};

interface PaymentIconProps {
    name: string;
    className?: string;
    size?: number;
}

export function PaymentIcon({ name, className = "w-5 h-5", size }: PaymentIconProps) {
    const IconComponent = ICON_MAP[name];
    if (IconComponent) {
        return <IconComponent className={`shrink-0 inline-block ${className}`} size={size} />;
    }

    // Fallback if an unknown name is passed: render a Material Symbol with font-family
    return (
        <span
            className={`material-symbols-outlined select-none inline-block leading-none shrink-0 ${className}`}
            style={size ? { fontSize: `${size}px` } : undefined}
        >
            {name}
        </span>
    );
}
