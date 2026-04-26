"use client";

export const isTauri = () => {
    return typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;
};

export const FORBIDDEN_LANDING_PAGES = [
    "/",
    "/features",
    "/pricing",
    "/blog",
    "/help",
    "/help-center",
    "/about",
    "/payment",
];
