"use client";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import { useRouter, usePathname } from "next/navigation";

const SubscriptionChecker = () => {
    const router = useRouter();
    const pathname = usePathname();

    const subscription = useSelector(
        (state: AppState) => state.businessData.businessDetails?.subscription,
    );

    const subStatus = useMemo(() => {
        if (!subscription) return "LOADING";
        if (subscription.plan === "STARTER") return "SAFE";

        const now = Date.now();
        const endTime = new Date(subscription.currentPeriodEnd).getTime();

        if (endTime < now || subscription.status !== "ACTIVE") {
            return "EXPIRED";
        }

        return "ACTIVE";
    }, [subscription]);

    useEffect(() => {
        if (subStatus === "LOADING") return;

        const isExpiredPage = pathname === "/subscription-expired";
        if ((subStatus === "ACTIVE" || subStatus === "SAFE") && isExpiredPage) {
            router.push("/dashboard");
            return;
        }

        if (subStatus === "EXPIRED") {
            if (
                isExpiredPage ||
                pathname?.startsWith("/payment") ||
                pathname?.startsWith("/api")
            ) {
                return;
            }

            router.push("/subscription-expired");
        }
    }, [subStatus, pathname, router]);

    return null;
};

export default SubscriptionChecker;
