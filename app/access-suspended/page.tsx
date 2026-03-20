"use client";

import Navbar from "@/components/Navbar";
import { AppState } from "@/store";
import { signOut as signOutAction } from "@/store/slices/authSlice";
import { useClerk } from "@clerk/nextjs";
import { Mail, Phone, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AccessSuspendedPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { signOut } = useClerk();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const { user, loading } = useSelector((state: AppState) => state.auth);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/sign-in");
            } else if (user.status === "active") {
                router.replace("/settings");
            }
        }
    }, [user, loading, router]);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await signOut();
        dispatch(signOutAction());
        router.replace("/");
    };
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 animate-pulse text-sm font-medium">
                    Verifying access...
                </p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <Navbar>
            <div className="h-full w-full flex flex-col items-center justify-center ">
                <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-red-100 overflow-hidden p-8 text-center animate-in fade-in zoom-in duration-300">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10 stroke-red-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-black text-gray-900 mb-2">
                        Account Deactivated
                    </h1>

                    {/* Description */}
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your account status is currently{" "}
                        <strong>Inactive</strong>.
                        <br />
                        This usually happens when permissions are updated by the
                        business owner.
                    </p>

                    {/* Action Area */}
                    <div className="space-y-4">
                        <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Suggested Actions
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 stroke-green-500" />
                                    <span>Contact Business Owner</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 stroke-green-500" />
                                    <span>Check your email for updates</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="w-full py-3.5 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            {isSigningOut ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-white" />
                            ) : (
                                <>Sign Out</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Navbar>
    );
}
