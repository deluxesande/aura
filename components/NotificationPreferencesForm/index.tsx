import React, { useState } from "react";
import { toast } from "sonner";

interface NotificationPreferencesFormProps {
    role: string;
}

const NotificationPreferencesForm: React.FC<
    NotificationPreferencesFormProps
> = ({ role }) => {
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic
        toast.warning("Notification preferences logic not implemented!");
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Notification Preferences
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Here is where you set notification preferences for your
                    account.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={emailNotifications}
                        onChange={(e) =>
                            setEmailNotifications(e.target.checked)
                        }
                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                        htmlFor="emailNotifications"
                        className="ml-2 block text-sm text-gray-900"
                    >
                        Email Notifications
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                        htmlFor="smsNotifications"
                        className="ml-2 block text-sm text-gray-900"
                    >
                        SMS Notifications
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={role === "manager"}
                    className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full mt-8"
                >
                    Save
                </button>
            </form>
        </section>
    );
};

export default NotificationPreferencesForm;
