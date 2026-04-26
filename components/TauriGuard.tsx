"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const FORBIDDEN_LANDING_PAGES = [
    "/",
    "/features",
    "/pricing",
    "/blog",
    "/help",
    "/help-center",
    "/about",
    "/payment",
];

export default function TauriGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isTauri, setIsTauri] = useState(false);

    useEffect(() => {
        // Detect Tauri environment
        if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
            setIsTauri(true);
        }
    }, []);

    useEffect(() => {
        if (isTauri && pathname) {
            const isLandingPage = FORBIDDEN_LANDING_PAGES.some((page) => {
                if (page === "/") return pathname === "/";
                return pathname.startsWith(page);
            });

            if (isLandingPage) {
                // Redirect to dashboard if on a landing page in Tauri
                router.replace("/dashboard");
            }
        }
    }, [isTauri, pathname, router]);

    return <>{children}</>;
}
