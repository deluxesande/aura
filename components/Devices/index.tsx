import { useClerk, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Device {
    id: string;
    status: string;
    browser: string;
    browserVersion: string;
    os: string;
    lastActive: string;
    location: string;
    imageUrl: string;
}

const osImageMap: { [key: string]: string } = {
    Windows: "/images/window.png",
    "Mac OS": "/images/apple.png",
    Linux: "/images/linux.png",
    Android: "/images/android.png",
    iOS: "/images/iphone.png",
};

const Devices: React.FC = () => {
    const { user } = useUser();
    const [devices, setDevices] = useState<Device[]>([]);
    const { client } = useClerk();

    const handleRemoveDevice = async (sessionId: string) => {
        try {
            // End the session by ID
            const session = await client.sessions.find(
                (session: any) => session.id === sessionId
            );
            if (session) {
                await session.end();
            }

            // Update the local state to remove the device
            setDevices((prevDevices) =>
                prevDevices.filter((device) => device.id !== sessionId)
            );
            toast.success("Device removed successfully");
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    };

    useEffect(() => {
        const fetchDevices = async () => {
            if (!user) return;

            try {
                const sessions = await user.getSessions();

                const devicesList = sessions.map((session: any) => ({
                    id: session.id,
                    status: session.status,
                    browser: session.latestActivity.browserName,
                    browserVersion: session.latestActivity.browserVersion,
                    os: session.latestActivity.deviceType,
                    lastActive: format(new Date(session.lastActiveAt), "PPpp"),
                    location: `${session.latestActivity.city}, ${session.latestActivity.country}`,
                    imageUrl: session.latestActivity.isMobile
                        ? osImageMap["Android"]
                        : osImageMap[session.latestActivity.deviceType] ||
                          "/images/window.png",
                }));

                setDevices(devicesList);
            } catch (err) {
                if (err instanceof Error) {
                    toast.error(err.message);
                } else {
                    toast.error("An unknown error occurred");
                }
            }
        };

        fetchDevices();
    }, [user]);

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Connected Devices
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Here is a list of devices connected to your account.
                </p>
            </header>

            <div className="mt-6 space-y-4">
                {devices.map((device) => (
                    <div
                        key={device.id}
                        className="p-4 bg-gray-100 rounded-lg shadow-sm flex flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto">
                            <Image
                                src={device.imageUrl}
                                alt={device.browser}
                                width={20}
                                height={20}
                                className="w-6 h-6 mr-0 sm:mr-4 mb-2 sm:mb-0"
                            />
                            <div className="space-y-1 w-full sm:w-auto">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-gray-700">
                                            {device.browser}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {device.browserVersion}
                                        </p>
                                    </div>
                                    {device.status === "active" ? (
                                        <span className="mt-2 sm:mt-0 sm:ml-2 px-2 py-[2px] text-[10px] font-semibold text-green-500 bg-green-50 border border-green-500 rounded-full">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="mt-2 sm:mt-0 sm:ml-2 px-2 py-[2px] text-[10px] font-semibold text-yellow-500 bg-red-50 border border-yellow-500 rounded-full">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <p className="text-md text-gray-600">
                                    {device.location}
                                </p>
                            </div>
                        </div>

                        <div className="ml-0 sm:ml-auto flex flex-col items-start sm:items-end space-y-3 w-full sm:w-auto">
                            <p className="text-xs text-gray-600">
                                {device.lastActive}
                            </p>
                            <button
                                className="text-sm text-red-500"
                                onClick={() => handleRemoveDevice(device.id)}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Devices;
