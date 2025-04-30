import { CheckCheck, Trash2 } from "lucide-react";
import React from "react";
import NotificationCard from "../NotificationCard";

interface NotificationOverlayProps {
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    deleteAllNotifications: () => void;
    notifications: any;
}

export default function NotificationOverlay({
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    notifications,
}: NotificationOverlayProps) {
    return (
        <div className="fixed inset-0 top-[88px] h-fit lg:absolute lg:left-[-350px] lg:top-[70px] lg:min-w-[300px] bg-white lg:border lg:border-gray-300 rounded-lg shadow-lg p-4 whitespace-nowrap overflow-hidden text-ellipsis z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="flex space-x-2">
                    <CheckCheck
                        size={20}
                        className="cursor-pointer"
                        onClick={markAllAsRead}
                    />
                    <Trash2
                        size={20}
                        className=" cursor-pointer"
                        onClick={deleteAllNotifications}
                    />
                </div>
            </div>
            {notifications.length === 0 ? (
                <p className="text-stone-400 mb-4">No new notifications</p>
            ) : (
                notifications.map((notification: any) => (
                    <NotificationCard
                        key={notification.id}
                        isRead={notification.isRead}
                        notification={notification}
                        markAsRead={markAsRead}
                    />
                ))
            )}
        </div>
    );
}
