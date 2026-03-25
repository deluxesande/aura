"use client";

import { AppState } from "@/store";
import {
    addInvitation,
    setInvitationsWithImages,
} from "@/store/slices/invitationsDataSlice";
import { setInvitations } from "@/store/slices/invitationSlice";
import { FloatingPortal } from "@floating-ui/react";
import { apiClient } from "@/utils/apiClient";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Plus, X } from "lucide-react";
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

interface Store {
    id: string;
    name: string;
    isActive?: boolean;
}

const CustomUserButton = () => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("user");
    const [inviteStoreId, setInviteStoreId] = useState("");
    const [storesData, setStoresData] = useState<Store[]>([]);
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
                const response = await apiClient.get("/auth/invite/get");
                if (response.data.invitations) {
                    const rawInvitations = response.data.invitations;
                    dispatch(setInvitations(rawInvitations));

                    const imagePromises = rawInvitations.map(
                        async (inv: User) => {
                            try {
                                const imageResponse = await apiClient.get(
                                    "/auth/user/image",
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
                            } catch {
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

    useEffect(() => {
        try {
            const cached = JSON.parse(
                localStorage.getItem("storesCache") || "[]",
            );
            if (Array.isArray(cached)) {
                setStoresData(cached);
                if (!inviteStoreId && cached.length > 0) {
                    setInviteStoreId(cached[0].id);
                }
            }
        } catch {
            setStoresData([]);
        }
    }, [showInviteModal, inviteStoreId]);

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

        if (!inviteStoreId) {
            toast.error("Please select a branch");
            return;
        }

        if (inviteRole === "admin") {
            toast.error("Cannot invite users with Admin role.");
            return;
        }

        setIsSending(true);

        const sendInvitation = async () => {
            const response = await apiClient.post("/auth/invite/post", {
                email: inviteEmail,
                role: inviteRole,
                storeId: inviteStoreId,
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
                setInviteStoreId(storesData[0]?.id || "");
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
                                <Plus
                                    size={18}
                                    strokeWidth={2.5}
                                    className="stroke-white"
                                />
                            ) : (
                                <AlertCircle size={18} />
                            )}
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showInviteModal && (
                    <FloatingPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-gray-100 overflow-hidden relative"
                            >
                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
                                    <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                                    <svg
                                        className="absolute inset-0 w-full h-full"
                                        viewBox="0 0 100 100"
                                        fill="none"
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

                                <div className="p-5 border-b border-gray-100 flex items-center justify-between relative z-10 bg-white/50 backdrop-blur-sm">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">
                                            Invite Team Member
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {staffCount} / {teamLimit} seats
                                            occupied
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setShowInviteModal(false)
                                        }
                                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form
                                    onSubmit={handleInviteUser}
                                    className="relative z-10"
                                >
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={inviteEmail}
                                                onChange={(e) =>
                                                    setInviteEmail(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                                placeholder="colleague@company.com"
                                                required
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Role Permission
                                            </label>
                                            <select
                                                value={inviteRole}
                                                onChange={(e) =>
                                                    setInviteRole(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm cursor-pointer"
                                            >
                                                <option value="user">
                                                    User (Basic Access)
                                                </option>
                                                <option value="manager">
                                                    Manager (Edit Access)
                                                </option>
                                            </select>
                                        </div>

                                        {inviteRole !== "admin" && (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                    Assign to Branch
                                                </label>
                                                <select
                                                    value={inviteStoreId}
                                                    onChange={(e) =>
                                                        setInviteStoreId(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm cursor-pointer"
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        Select a branch...
                                                    </option>
                                                    {storesData
                                                        ?.filter(
                                                            (s) =>
                                                                s.isActive !==
                                                                false,
                                                        )
                                                        .map((store) => (
                                                            <option
                                                                key={store.id}
                                                                value={store.id}
                                                            >
                                                                {store.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowInviteModal(false)
                                            }
                                            className="flex-1 py-2.5 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSending}
                                            className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSending ? (
                                                <Loader2 className="animate-spin h-4 w-4" />
                                            ) : (
                                                "Send Invitation"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    </FloatingPortal>
                )}
            </AnimatePresence>
        </>
    );
};

export default CustomUserButton;
