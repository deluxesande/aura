"use client";
import { AppState } from "@/store";
import {
    addInvitation,
    setInvitationsWithImages,
} from "@/store/slices/invitationsDataSlice";
import { setInvitations } from "@/store/slices/invitationSlice";
import { FloatingPortal } from "@floating-ui/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronDown, Loader2, Plus, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface User {
    id: string;
    email: string;
    role: string;
    status: "pending" | "accepted" | "declined" | "expired";
    businessId: string;
    invitedBy: string;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    clerkInvitationId: string;
    Business: {
        name: string;
    };
    inviter: {
        firstName: string;
        lastName: string;
    };
}

interface Invitation extends User {
    imageUrl?: string;
}

interface StoreUser {
    id: string;
    name: string;
    email: string;
    role: string;
    businessId: string;
    status: string;
    Business: {};
}

const CustomUserButton = () => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("user");
    const dispatch = useDispatch();

    const invitations = useSelector(
        (state: AppState) => state.invitations.invitations,
    ) as User[];

    const userInvitations = useSelector(
        (state: AppState) => state.invitationsData.invitationsWithImages,
    ) as Invitation[];

    const user = useSelector(
        (state: AppState) => state.auth.user,
    ) as StoreUser | null;

    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    const [isLoading, setIsLoading] = useState(userInvitations.length === 0);
    const [isSending, setIsSending] = useState(false);
    const hasFetched = useRef(false);

    const plan = businessDetails?.subscription?.plan || "STARTER";
    const staffCount = businessDetails?.usage?.staffCount || 0;

    const teamLimit =
        plan === "STARTER" ? 1 : plan === "STANDARD" ? 5 : Infinity;
    const canInviteMore = staffCount < teamLimit;

    useEffect(() => {
        if (
            user?.role?.toLowerCase() !== "admin" &&
            user?.role?.toLowerCase() !== "manager"
        ) {
            setIsLoading(false);
            return;
        }

        if (hasFetched.current) return;

        const fetchUsers = async () => {
            if (userInvitations.length === 0) setIsLoading(true);
            try {
                const response = await axios.get("/api/auth/invite/get");
                if (response.data.invitations) {
                    const rawInvitations = response.data.invitations;
                    dispatch(setInvitations(rawInvitations));

                    const imagePromises = rawInvitations.map(
                        async (inv: User) => {
                            try {
                                const imageResponse = await axios.get(
                                    "/api/auth/user/image",
                                    {
                                        params: { userId: inv.id },
                                    },
                                );
                                return {
                                    ...inv,
                                    imageUrl:
                                        imageResponse.data.imageUrl ||
                                        undefined,
                                } as Invitation;
                            } catch (error) {
                                return {
                                    ...inv,
                                    imageUrl: undefined,
                                } as Invitation;
                            }
                        },
                    );

                    const results = await Promise.allSettled(imagePromises);
                    const usersWithImages = results.map((result, index) => {
                        if (result.status === "fulfilled") return result.value;
                        return {
                            ...rawInvitations[index],
                            imageUrl: undefined,
                        } as Invitation;
                    });
                    dispatch(setInvitationsWithImages(usersWithImages));
                }
            } catch (error) {
                console.error("Fetch team error", error);
            } finally {
                setIsLoading(false);
                hasFetched.current = true;
            }
        };

        fetchUsers();
    }, [dispatch, user?.role, userInvitations.length]);

    if (plan === "STARTER") {
        return <div className="mr-8"></div>;
    }

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (businessDetails?.subscription?.status !== "ACTIVE") {
            toast.error(
                "Cannot invite users: Your subscription plan is not active.",
            );
            return;
        }

        if (!canInviteMore) {
            toast.error(
                `Team limit reached. Your ${plan} plan allows only ${teamLimit} member(s).`,
            );
            return;
        }

        if (!inviteEmail) {
            toast.error("Please enter an email address");
            return;
        }

        if (inviteRole === "admin") {
            toast.error("Cannot invite users with Admin role.");
            return;
        }

        setIsSending(true);

        const sendInvitation = async () => {
            const response = await axios.post("/api/auth/invite/post", {
                email: inviteEmail,
                role: inviteRole,
            });
            const newInvitation = response.data.invitation;
            dispatch(setInvitations([...invitations, newInvitation]));
            dispatch(addInvitation({ ...newInvitation, imageUrl: undefined }));
        };

        toast.promise(sendInvitation(), {
            loading: "Sending Invitation...",
            success: () => {
                setInviteEmail("");
                setInviteRole("user");
                setShowInviteModal(false);
                setIsSending(false);
                return "Invitation sent successfully.";
            },
            error: (err) => {
                setIsSending(false);
                return (
                    err.response?.data?.error || "Sending Invitation Failed."
                );
            },
        });
    };

    const handleOpenModal = () => {
        if (!canInviteMore) {
            toast.warning(
                `Team full: Your ${plan} plan is limited to ${teamLimit} member(s).`,
            );
            return;
        }
        setShowInviteModal(true);
    };

    const isAdminOrManager =
        user?.role?.toLowerCase() === "admin" ||
        user?.role?.toLowerCase() === "manager";

    if (!isAdminOrManager) return null;

    const acceptedUsers = userInvitations
        .filter((invitation) => invitation.status === "accepted")
        .slice(0, 3);

    const defaultImage = "https://placehold.co/100x100/f1f5f9/94a3b8?text=U";

    return (
        <>
            {/* --- TRIGGER AREA (Avatars + Add Button) --- */}
            <div className="flex items-center space-x-3 pr-6">
                {isLoading ? (
                    <div className="flex items-center -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-9 w-9 rounded-full border-2 border-white bg-slate-100 animate-pulse"
                            />
                        ))}
                    </div>
                ) : acceptedUsers.length === 0 ? (
                    <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-gray-400">
                            No team members
                        </p>
                        <button
                            onClick={handleOpenModal}
                            className={`h-9 w-9 rounded-full flex items-center justify-center border border-dashed border-gray-300 transition-all ${
                                canInviteMore
                                    ? "bg-white hover:border-green-500 hover:text-green-500 text-gray-400"
                                    : "bg-gray-50 cursor-not-allowed opacity-60"
                            }`}
                            title={
                                canInviteMore
                                    ? "Add team member"
                                    : "Limit reached"
                            }
                        >
                            {canInviteMore ? (
                                <Plus size={16} />
                            ) : (
                                <AlertCircle size={16} />
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <div className="flex items-center -space-x-3 mr-3">
                            {acceptedUsers.map((acceptedUser, index) => (
                                <div
                                    key={acceptedUser.id}
                                    className="h-9 w-9 rounded-full overflow-hidden border-2 border-white cursor-pointer hover:scale-105 transition-transform relative ring-1 ring-gray-100 shadow-sm"
                                    style={{
                                        zIndex: acceptedUsers.length - index,
                                    }}
                                    title={acceptedUser.email}
                                >
                                    <Image
                                        src={
                                            acceptedUser.imageUrl ||
                                            defaultImage
                                        }
                                        fill
                                        sizes="36px"
                                        alt={acceptedUser.email}
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleOpenModal}
                            className={`h-9 w-9 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-all transform hover:scale-105 active:scale-95 ${
                                canInviteMore
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                            style={{ zIndex: 0 }}
                            title={
                                canInviteMore
                                    ? "Add team member"
                                    : "Limit reached"
                            }
                        >
                            {canInviteMore ? (
                                <Plus size={18} strokeWidth={2.5} />
                            ) : (
                                <AlertCircle size={18} />
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* --- INVITE MODAL --- */}
            <AnimatePresence>
                {showInviteModal && (
                    <FloatingPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden relative"
                            >
                                {/* Background Line Pattern */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                                    <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                                    <svg
                                        className="absolute inset-0 w-full h-full"
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M0 100 C 20 0 50 0 100 100 Z"
                                            stroke="black"
                                            strokeWidth="0.5"
                                            className="opacity-20"
                                        />
                                    </svg>
                                </div>

                                {/* Modal Header */}
                                <div className="p-6 pb-0 relative z-10 text-center">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Invite Team Member
                                    </h3>

                                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                                        <Users size={12} />
                                        {staffCount} / {teamLimit} seats
                                        occupied
                                    </div>
                                </div>

                                {/* Modal Form */}
                                <div className="p-6 relative z-10">
                                    <form
                                        onSubmit={handleInviteUser}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={(e) =>
                                                        setInviteEmail(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="block w-full pl-4 pr-4 py-3 bg-slate-50 outline-none border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                                    placeholder="colleague@company.com"
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Role Permission
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={inviteRole}
                                                    onChange={(e) =>
                                                        setInviteRole(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="block w-full pl-4 pr-10 py-3 bg-slate-50 outline-none border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none cursor-pointer"
                                                >
                                                    <option value="user">
                                                        User (Basic Access)
                                                    </option>
                                                    <option value="manager">
                                                        Manager (Edit Access)
                                                    </option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
                                            </div>

                                            {/* Role Description Helper */}
                                            <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <p className="text-xs text-blue-700 leading-relaxed">
                                                    {inviteRole === "manager" &&
                                                        "Managers can view and edit data but cannot change billing or delete the business."}
                                                    {inviteRole === "user" &&
                                                        "Users can record transactions and view basic reports. Suitable for team members who need limited access."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowInviteModal(false)
                                                }
                                                className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                                disabled={isSending}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSending}
                                                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSending ? (
                                                    <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                                                ) : (
                                                    <>Send Invitation</>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    </FloatingPortal>
                )}
            </AnimatePresence>
        </>
    );
};

export default CustomUserButton;
