"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "@/store";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { signIn } from "@/store/slices/authSlice";

const PUBLIC_ROUTES = new Set([
    "/",
    "/sign-in",
    "/sign-up",
    "/profile",
    "/features",
    "/integration",
    "/about",
    "/pricing",
    "/password-reset",
    "/verify",
    "/payment",
    "/payment/checking",
    "/blog",
    "/help-center",
    "/access-suspended",
    "/subscription-expired",
    "/download",
    "/careers",
    "/ai",
]);

const PUBLIC_PREFIXES = ["/auth/accept-invitation", "/blog", "/help-center"];

const ROLE_PERMISSIONS: Record<string, string[]> = {
    "/settings/team": ["admin", "manager"],
    "/settings": ["admin", "manager"],
    "/dashboard": ["admin", "manager"],
    "/invoices": ["admin", "manager", "user"],
    "/invoice": ["admin", "manager", "user"],
    "/products": ["admin", "manager", "user"],
    "/customers": ["admin", "manager", "user"],
    "/expenses": ["admin", "manager"],
    "/suppliers": ["admin", "manager"],
};

const SORTED_PROTECTED_ROUTES = Object.keys(ROLE_PERMISSIONS).sort(
    (a, b) => b.length - a.length,
);

export default function RoleGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const pathname = usePathname() || "";

    const { user, loading, isSignedIn } = useSelector(
        (state: AppState) => state.auth,
    );

    useEffect(() => {
        if (!loading && user && !isSignedIn) {
            dispatch(signIn());
        }
    }, [user, loading, isSignedIn, dispatch]);

    const isPublicRoute = useMemo(() => {
        if (PUBLIC_ROUTES.has(pathname)) return true;
        return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    }, [pathname]);

    const { isAuthorized, redirectPath } = useMemo(() => {
        if (isPublicRoute) return { isAuthorized: true, redirectPath: null };

        if (loading) return { isAuthorized: true, redirectPath: null };

        if (!user) return { isAuthorized: false, redirectPath: "/sign-in" };

        if (user.status === "inactive") {
            return { isAuthorized: false, redirectPath: "/access-suspended" };
        }

        const userRole = user.role?.toLowerCase() || "user";
        const matchedRoute = SORTED_PROTECTED_ROUTES.find((route) =>
            pathname.startsWith(route),
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
            if (redirectPath === "/access-suspended") {
                toast.error("Account access suspended.");
            } else if (user && redirectPath !== "/sign-in") {
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
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return <>{children}</>;
}
