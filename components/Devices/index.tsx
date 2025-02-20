import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
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
                    imageUrl:
                        osImageMap[session.os_name] || "/images/window.png",
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
                        className="p-4 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center"
                    >
                        <div className="flex items-center">
                            <Image
                                src={device.imageUrl}
                                alt={device.browser}
                                width={20}
                                height={20}
                                className="w-6 h-6 mr-4"
                            />
                            <div className="space-y-1">
                                <div className="flex items-center">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-gray-700">
                                            {device.browser}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {device.browserVersion}
                                        </p>
                                    </div>
                                    {device.status && (
                                        <span className="ml-2 px-2 py-[2px] text-[10px] font-semibold text-green-500 bg-green-50 border border-green-500 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-md text-gray-600">
                                    {device.location}
                                </p>
                            </div>
                        </div>

                        <div className="ml-auto flex flex-col items-end space-y-3">
                            <p className="text-xs text-gray-600">
                                {device.lastActive}
                            </p>
                            <button className="text-sm text-red-500">
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
