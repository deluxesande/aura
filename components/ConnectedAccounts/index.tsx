import React from "react";
import Image from "next/image";
import { AlertCircle, Dot } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface SocialAccount {
    id: string;
    provider: string;
    emailAddress: string;
    icon: string; // Add an icon property
}

const SocialAccountsIconMap: { [key: string]: string } = {
    google: "https://www.svgrepo.com/show/475656/google-color.svg",
};

const ConnectedAccounts: React.FC = () => {
    const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
    const { user } = useUser();

    React.useEffect(() => {
        if (user?.externalAccounts) {
            setAccounts(
                user.externalAccounts.map((account) => ({
                    id: account.id,
                    provider: account.provider,
                    emailAddress: account.emailAddress || "",
                    icon:
                        SocialAccountsIconMap[account.provider] ||
                        "https://www.svgrepo.com/show/475656/google-color.svg",
                }))
            );
        }
    }, [user]); // Runs only when `user` changes

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Connected Accounts
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your connected social accounts.
                </p>
            </header>

            <div className="mt-6 space-y-4">
                {accounts.length > 0 ? (
                    accounts.map((account) => (
                        <div
                            key={account.id}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg bg-gray-50 space-y-4 sm:space-y-0"
                        >
                            <div className="flex flex-row items-center gap-2">
                                <Image
                                    src={account.icon}
                                    alt={`${account.provider} Icon`}
                                    className="w-6 h-6"
                                    width={24}
                                    height={24}
                                />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                                    <p className="text-md font-medium text-gray-900 capitalize">
                                        {account.provider}
                                    </p>
                                    <Dot
                                        className="hidden md:block"
                                        size={28}
                                        color="#9ca3af"
                                    />
                                    <p className="text-sm font-light text-gray-600">
                                        {account.emailAddress ||
                                            "No email linked"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center py-2 px-4 border rounded-lg bg-gray-50 space-x-2">
                        <AlertCircle className="w-5 h-5" color="#ef4444" />
                        <p className="text-lg font-light text-red-500">
                            No accounts linked
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ConnectedAccounts;
