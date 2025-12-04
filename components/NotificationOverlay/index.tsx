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
        <div className="min-w-[300px] max-w-[400px] mt-[20px] bg-white border border-gray-300 rounded-lg shadow-lg p-4 whitespace-nowrap overflow-hidden text-ellipsis">
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
