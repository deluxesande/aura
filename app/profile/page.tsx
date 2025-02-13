"use client";
import React from "react";
import UpdateProfileInformationForm from "@/components/ProfileInfo";
import UpdatePasswordForm from "@/components/UpdatePasswordForm";
import DeleteUserForm from "@/components/DeleteUserForm";
import Devices from "@/components/Devices";

const ProfilePage: React.FC = () => {
    return (
        <div className="py-12 min-h-screen">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex flex-wrap mx-4">
                    <div className="w-full md:w-1/2 px-4 mb-6">
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                            <div className="max-w-xl">
                                <UpdateProfileInformationForm />
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 px-4 mb-6">
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                            <div className="max-w-xl">
                                <UpdatePasswordForm />
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 px-4 mb-6">
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                            <div className="max-w-xl">
                                <DeleteUserForm />
                            </div>
                        </div>
                    </div>

                    {/* Add another section if needed */}
                    <div className="w-full md:w-1/2 px-4 mb-6">
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                            <div className="max-w-xl">
                                <Devices />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
