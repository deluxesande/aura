import React from "react";
import { Mail } from "lucide-react";

interface NotificationCardProps {
    isRead: boolean;
    markAsRead: (id: number) => void;
    notification: any;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    isRead,
    notification,
    markAsRead,
}) => {
    return (
        <div
            className="flex items-center justify-between gap-8 bg-white border rounded-lg shadow-sm p-4 mb-2 cursor-pointer"
            onClick={() => markAsRead(notification.id)}
        >
            <div className="flex items-center">
                <Mail size={25} className="text-gray-600 mr-2" />
                <p className="text-black">Stock resupply order sent</p>
            </div>
            <div
                className={`badge badge-xs badge-info ${
                    isRead ? "bg-transparent" : "bg-amber-400"
                } rounded-full`}
            ></div>
        </div>
    );
};

export default NotificationCard;
