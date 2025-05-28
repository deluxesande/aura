"use client";
import React from "react";
import UpdateProfileInformationForm from "@/components/ProfileInfo";
import UpdatePasswordForm from "@/components/UpdatePasswordForm";
import DeleteUserForm from "@/components/DeleteUserForm";
import Devices from "@/components/Devices";
import Navbar from "@/components/Navbar";
import ConnectedAccounts from "@/components/ConnectedAccounts";

const ProfilePage: React.FC = () => {
    return (
        <Navbar>
            <div className="py-12 ">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col flex-wrap w-full">
                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <UpdateProfileInformationForm />
                                </div>
                            </div>
                        </div>

                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <ConnectedAccounts />
                                </div>
                            </div>
                        </div>

                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <UpdatePasswordForm />
                                </div>
                            </div>
                        </div>

                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <Devices />
                                </div>
                            </div>
                        </div>

                        <div className="w-full mb-6">
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="w-full">
                                    <DeleteUserForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Navbar>
    );
};

export default ProfilePage;
