"use client";
import BusinessSettingsForm from "@/components/BusinessSettings";
import DataManagement from "@/components/DataManagement";
import IntegrationsSettings from "@/components/IntegrationsSettings";
import Navbar from "@/components/Navbar";
import NotificationPreferencesForm from "@/components/NotificationPreferencesForm";
import UserManagement from "@/components/UserManagement";
import React from "react";

const SettingsPage: React.FC = () => {
    return (
        <Navbar>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col flex-wrap w-full">
                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <BusinessSettingsForm />
                                </div>
                            </div>
                        </div>
                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <NotificationPreferencesForm />
                                </div>
                            </div>
                        </div>
                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <IntegrationsSettings />
                                </div>
                            </div>
                        </div>
                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <UserManagement />
                                </div>
                            </div>
                        </div>
                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <DataManagement />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Navbar>
    );
};

export default SettingsPage;
