"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { AppState } from "@/store";

interface TourStep {
    target: string;
    title: string;
    description: string;
    badge?: string;
    side?: "right" | "left" | "top" | "bottom";
}

const steps: TourStep[] = [
    {
        target: '[data-tour="sidebar"]',
        title: "Navigation",
        badge: "Getting Started",
        description: "Everything you need to run your business is organized right here.",
        side: "right",
    },
    {
        target: '[data-tour="nav-overview"]',
        title: "Overview",
        badge: "Snapshot",
        description:
            "Your daily performance - revenue, orders and key metrics at a glance.",
        side: "right",
    },
    {
        target: '[data-tour="nav-sales & crm"]',
        title: "Sales & CRM",
        badge: "Sales",
        description:
            "Generate invoices, track payments, and manage your customer relationships.",
        side: "right",
    },
    {
        target: '[data-tour="nav-inventory"]',
        title: "Inventory Control",
        badge: "Stock",
        description:
            "Manage your product catalog and track live stock levels across branches.",
        side: "right",
    },
    {
        target: '[data-tour="nav-supply chain"]',
        title: "Supply Chain",
        badge: "Procurement",
        description:
            "Manage suppliers, place purchase orders, and track incoming stock.",
        side: "right",
    },
    {
        target: '[data-tour="nav-finance"]',
        title: "Financials",
        badge: "Finance",
        description:
            "Track business expenses and monitor your overall profitability.",
        side: "right",
    },
    {
        target: '[data-tour="nav-system"]',
        title: "System Settings",
        badge: "Control Panel",
        description:
            "Configure your business profile, manage team roles, and app preferences.",
        side: "right",
    },
    {
        target: '[data-tour="search-bar"]',
        title: "Universal Search",
        badge: "Pro Tip",
        description:
            "Instantly find products, customers, or invoices from anywhere.",
        side: "bottom",
    },
    {
        target: '[data-tour="create-order"]',
        title: "Quick Sale",
        badge: "Action",
        description: "Ready to sell? Create new orders in seconds.",
        side: "left",
    },
];

interface PopoverPosition {
    top: number;
    left: number;
}

function getPosition(el: Element, side: TourStep["side"]): PopoverPosition {
    const rect = el.getBoundingClientRect();
    const gap = 12;

    switch (side) {
        case "right":
            return { top: rect.top, left: rect.right + gap };
        case "left":
            return { top: rect.top, left: rect.left - 320 - gap };
        case "bottom":
            return { top: rect.bottom + gap, left: rect.left };
        case "top":
            return { top: rect.top - gap, left: rect.left };
        default:
            return { top: rect.bottom + gap, left: rect.left };
    }
}

function Highlight({ target }: { target: string }) {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const el = document.querySelector(target);
        if (!el) return;
        setRect(el.getBoundingClientRect());
    }, [target]); // ← re-runs every time target changes

    if (!rect) return null;

    const clipPath = `polygon(
        0% 0%, 100% 0%, 100% 100%, 0% 100%,
        0% ${rect.top - 4}px,
        ${rect.left - 4}px ${rect.top - 4}px,
        ${rect.left - 4}px ${rect.bottom + 4}px,
        ${rect.right + 4}px ${rect.bottom + 4}px,
        ${rect.right + 4}px ${rect.top - 4}px,
        0% ${rect.top - 4}px
    )`;

    return createPortal(
        <>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(2px)",
                    clipPath,
                    zIndex: 9997,
                    pointerEvents: "none",
                    transition: "clip-path 0.25s ease",
                }}
            />
            <div
                style={{
                    position: "fixed",
                    top: rect.top - 4,
                    left: rect.left - 4,
                    width: rect.width + 8,
                    height: rect.height + 8,
                    border: "2px solid #22c55e",
                    zIndex: 9998,
                    pointerEvents: "none",
                    transition: "all 0.25s ease",
                }}
            />
        </>,
        document.body,
    );
}

function Popover({
    step,
    index,
    total,
    onNext,
    onPrev,
    onClose,
}: {
    step: TourStep;
    index: number;
    total: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}) {
    const [pos, setPos] = useState<PopoverPosition | null>(null);

    useEffect(() => {
        const el = document.querySelector(step.target);
        if (!el) return;
        setPos(getPosition(el, step.side));
    }, [step]);

    if (!pos) return null;

    return createPortal(
        <div
            style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                zIndex: 99999,
                width: 300,
                transition: "all 0.2s ease",
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-5"
        >
            {/* Badge */}
            {step.badge && (
                <span
                    className="inline-block bg-green-100 text-green-500 text-xs font-bold 
          px-2 py-0.5 rounded-full uppercase tracking-wider mb-2"
                >
                    {step.badge}
                </span>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {step.title}
                </p>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-900 transition-colors ml-2"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {step.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                    {index + 1} / {total}
                </span>
                <div className="flex gap-2">
                    {index > 0 && (
                        <button
                            onClick={onPrev}
                            className="bg-white text-gray-700 border border-gray-300 rounded-lg 
                px-3 py-1.5 text-xs font-bold hover:bg-gray-50 transition-colors"
                        >
                            ← Back
                        </button>
                    )}
                    <button
                        onClick={onNext}
                        className="bg-green-500 text-white rounded-lg px-3 py-1.5 
              text-xs font-bold hover:bg-green-600 transition-colors"
                    >
                        {index === total - 1 ? "Get Started" : "Next →"}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default function WelcomeTour() {
    const { user, isLoaded } = useUser();
    const reduxUser = useSelector((state: AppState) => state.auth.user);
    const [active, setActive] = useState(false);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!isLoaded || !user) return;
        if (user.unsafeMetadata?.hasSeenTour === true) return;

        // Wait for redux user to load
        if (!reduxUser) return;

        // Don't start tour until business name has been properly set
        const businessName = reduxUser.Business?.name;
        if (!businessName || businessName === "My New Business") return;

        const timer = setTimeout(() => setActive(true), 800);
        return () => clearTimeout(timer);
    }, [isLoaded, user, reduxUser]);

    const endTour = useCallback(async () => {
        setActive(false);
        await user?.update({
            unsafeMetadata: { ...user.unsafeMetadata, hasSeenTour: true },
        });
    }, [user]);

    const onNext = useCallback(() => {
        if (index === steps.length - 1) endTour();
        else setIndex((i) => i + 1);
    }, [index, endTour]);

    const onPrev = useCallback(() => setIndex((i) => i - 1), []);

    if (!active) return null;

    const step = steps[index];

    return (
        <>
            <Highlight target={step.target} />
            <Popover
                step={step}
                index={index}
                total={steps.length}
                onNext={onNext}
                onPrev={onPrev}
                onClose={endTour}
            />
        </>
    );
}
