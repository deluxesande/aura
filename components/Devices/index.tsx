import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

interface Device {
    id: string;
    name: string;
    lastConnected: string;
    imageUrl: string;
    isActive: boolean;
    location: string;
}

const devices: Device[] = [
    {
        id: "1",
        name: "iPhone 12",
        lastConnected: "2025-02-12",
        imageUrl: "/images/iphone.png",
        isActive: true,
        location: "New York, USA",
    },
    {
        id: "2",
        name: "MacBook Pro",
        lastConnected: "2025-02-10",
        imageUrl: "/images/apple.png",
        isActive: false,
        location: "San Francisco, USA",
    },
    {
        id: "3",
        name: "Windows PC",
        lastConnected: "2025-02-10",
        imageUrl: "/images/window.png",
        isActive: false,
        location: "Los Angeles, USA",
    },
];

const Devices: React.FC = () => {
    const { user } = useUser();
    // const [devices, setDevices] = useState<Device[]>([]);

    // useEffect(() => {
    //     const fetchDevices = async () => {
    //         if (user) {
    //             const response = await fetch(
    //                 `/api/clerk/devices?userId=${user.id}`
    //             );

    //             console.log(response);
    //             const data = await response.json();
    //             setDevices(data.devices);
    //         }
    //     };

    //     fetchDevices();
    // }, [user]);

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
                                alt={device.name}
                                width={20}
                                height={20}
                                className="w-6 h-6 mr-4"
                            />
                            <div className="space-y-1">
                                <div className="flex items-center">
                                    <p className="text-sm font-medium text-gray-700">
                                        {device.name}
                                    </p>
                                    {device.isActive && (
                                        <span className="ml-2 px-2 py-[2px] text-[10px] font-semibold text-green-500 bg-green-50 border border-green-500 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Last Connected: {device.lastConnected}
                                </p>
                            </div>
                        </div>

                        <div className="ml-auto flex flex-col items-end space-x-1">
                            <p className="text-xs text-gray-600">
                                {device.location}
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
