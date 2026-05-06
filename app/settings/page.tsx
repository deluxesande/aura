"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import BusinessSettingsForm from "@/components/BusinessSettings";
import BranchManagement from "@/components/BranchManagement";
import DataManagement from "@/components/DataManagement";
import IntegrationsSettings from "@/components/IntegrationsSettings";
import KraSettings from "@/components/KraSettings";
import Navbar from "@/components/Navbar";
import SubscriptionManagement from "@/components/SubscriptionManagement";
import UserManagement from "@/components/UserManagement";
import AuditLogs from "@/components/AuditLogs";
import DatabaseSettings from "@/components/DatabaseSettings";

import { AppState } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import { apiClient } from "@/utils/apiClient";

const SettingsPage: React.FC = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("workspace");

    const user = useSelector((state: AppState) => state.auth.user);
    const businessDetails = useSelector(
        (state: AppState) => state.businessData,
    );

    const userRole = user?.role || "user";

    useEffect(() => {
        if (user === null) {
            const fetchUser = async () => {
                try {
                    const res = await apiClient.get("/auth/user/profile");
                    if (res.data) {
                        dispatch(setUser(res.data.user));
                    }
                } catch (error) {}
            };
            fetchUser();
        }
    }, [user, dispatch]);

    const tabs = [
        { id: "workspace", label: "Workspace", roles: ["admin", "manager"] },
        { id: "billing", label: "Billing", roles: ["admin", "manager"] },
        { id: "team", label: "Team", roles: ["admin", "manager"] },
        { id: "payments", label: "Payments", roles: ["admin", "manager"] },
        { id: "audit", label: "Audit Logs", roles: ["admin"] },
    ];

    const filteredTabs = tabs.filter((tab) => tab.roles.includes(userRole));

    const renderTabContent = () => {
        switch (activeTab) {
            case "workspace":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                            <BusinessSettingsForm role={userRole} />
                            <KraSettings />
                        </div>
                        {userRole === "admin" && (
                            <DatabaseSettings
                                businessId={
                                    businessDetails.businessDetails?.id || ""
                                }
                                currentMode={
                                    businessDetails.businessDetails
                                        ?.tenantMode === "BYODB"
                                        ? "BYODB"
                                        : "SHARED"
                                }
                            />
                        )}
                        {userRole === "admin" && <DataManagement />}
                    </div>
                );

            case "billing":
                return <SubscriptionManagement />;

            case "team":
                return (
                    <div className="space-y-6">
                        <UserManagement />
                        <BranchManagement />
                    </div>
                );

            case "payments":
                return <IntegrationsSettings />;

            case "audit":
                return <AuditLogs />;

            default:
                return null;
        }
    };

    if (user === null || user === undefined) {
        return (
            <Navbar>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
                </div>
            </Navbar>
        );
    }

    if (userRole !== "admin" && userRole !== "manager") {
        toast.error("Access denied.");
        router.back();
        return null;
    }

    return (
        <Navbar>
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex bg-gray-100 p-1 rounded-xl self-start w-fit overflow-x-auto max-w-full scrollbar-hide">
                    {filteredTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="w-full">{renderTabContent()}</div>
            </div>
        </Navbar>
    );
};

export default SettingsPage;
