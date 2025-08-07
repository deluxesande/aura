"use client";
import BusinessSettingsForm from "@/components/BusinessSettings";
import DataManagement from "@/components/DataManagement";
import IntegrationsSettings from "@/components/IntegrationsSettings";
import Navbar from "@/components/Navbar";
import NotificationPreferencesForm from "@/components/NotificationPreferencesForm";
import UserManagement from "@/components/UserManagement";
import { AppState } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";

const SettingsPage: React.FC = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state.auth.user);

    if (user === null) {
        const fetchUser = async () => {
            await axios.get("/api/auth/user/profile").then((res) => {
                if (res.data) {
                    dispatch(setUser(res.data.user));
                }
            });
        };
        fetchUser();
    }

    if (user === null || user === undefined) {
        return (
            <div className="text-center w-full h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            </div>
        );
    }

    if (user?.role !== "admin") {
        toast.error("You do not have permission to access this page.");
        router.back();
    }

    if (user.role === "admin") {
        return (
            <Navbar>
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex flex-col flex-wrap w-full">
                            <div className="w-full mb-6">
                                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg flex flex-col lg:flex-row  gap-6">
                                    <div className="w-full">
                                        <BusinessSettingsForm />
                                    </div>
                                    <div className="space-y-6 w-full">
                                        <div className="w-full">
                                            <NotificationPreferencesForm />
                                        </div>
                                        <div className="w-full">
                                            <IntegrationsSettings />
                                        </div>
                                        <div className="w-full">
                                            <DataManagement />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="w-full mb-6">
                                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                    <div className="w-full">
                                        <NotificationPreferencesForm />
                                    </div>
                                </div>
                            </div> */}
                            {/* <div className="w-full mb-6">
                                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                    <div className="w-full">
                                        <IntegrationsSettings />
                                    </div>
                                </div>
                            </div> */}
                            <div className="w-full mb-6">
                                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                    <div className="w-full">
                                        <UserManagement />
                                    </div>
                                </div>
                            </div>
                            {/* <div className="w-full mb-6">
                                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                    <div className="w-full">
                                        <DataManagement />
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </Navbar>
        );
    }
};

export default SettingsPage;
