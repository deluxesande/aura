"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

// 1. Keep exact matches here
const PUBLIC_ROUTES = new Set([
    "/",
    "/sign-in",
    "/sign-up",
    "/features",
    "/integrations",
    "/about",
    "/pricing",
    "/password-reset",
    "/verify",
    "/payment",
    "/payment/checking",
]);

// 2. Define routes that should be public regardless of what follows (e.g. tokens)
const PUBLIC_PREFIXES = ["/auth/accept-invitation"];

const ROLE_PERMISSIONS: Record<string, string[]> = {
    "/settings/team": ["admin", "manager"],
    "/settings": ["admin", "manager"],
    "/dashboard": ["admin"],
    "/invoices": ["admin", "manager", "user"],
    "/invoice": ["admin", "manager", "user"],
    "/products": ["admin", "manager", "user"],
    "/customers": ["admin", "manager", "user"],
};

const SORTED_PROTECTED_ROUTES = Object.keys(ROLE_PERMISSIONS).sort(
    (a, b) => b.length - a.length
);

export default function RoleGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname() || "";

    const { user, loading } = useSelector((state: AppState) => state.auth);

    const isPublicRoute = useMemo(() => {
        if (PUBLIC_ROUTES.has(pathname)) return true;
        return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    }, [pathname]);

    const { isAuthorized, redirectPath } = useMemo(() => {
        if (isPublicRoute) return { isAuthorized: true, redirectPath: null };

        if (loading) return { isAuthorized: true, redirectPath: null };

        if (!user) return { isAuthorized: false, redirectPath: "/sign-in" };

        const userRole = user.role?.toLowerCase() || "user";
        const matchedRoute = SORTED_PROTECTED_ROUTES.find((route) =>
            pathname.startsWith(route)
        );

        if (matchedRoute) {
            const allowedRoles = ROLE_PERMISSIONS[matchedRoute];
            if (!allowedRoles.includes(userRole)) {
                return { isAuthorized: false, redirectPath: "/products" };
            }
        }

        return { isAuthorized: true, redirectPath: null };
    }, [pathname, user, isPublicRoute, loading]);

    useEffect(() => {
        if (!loading && !isAuthorized && redirectPath) {
            if (user) {
                toast.error("Access Denied: You do not have permission.");
            } else if (pathname !== "/sign-in") {
                toast.error("Please sign in to access this page.");
            }
            router.replace(redirectPath);
        }
    }, [isAuthorized, redirectPath, router, user, pathname, loading]);

    if (isPublicRoute) return <>{children}</>;

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return <>{children}</>;
}
