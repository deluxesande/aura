"use client";
import axios from "axios";
import { AppState } from "@/store";
import { Plus, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
    setInvitationsWithImages,
    addInvitation,
} from "@/store/slices/invitationsDataSlice";
import { setInvitations } from "@/store/slices/invitationSlice";
import { FloatingPortal } from "@floating-ui/react";

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

    // Redux Selectors
    const invitations = useSelector(
        (state: AppState) => state.invitations.invitations
    ) as User[];

    const userInvitations = useSelector(
        (state: AppState) => state.invitationsData.invitationsWithImages
    ) as Invitation[];

    const user = useSelector(
        (state: AppState) => state.auth.user
    ) as StoreUser | null;

    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails
    );

    const [isLoading, setIsLoading] = useState(userInvitations.length === 0);
    const hasFetched = useRef(false);

    // --- Subscription Limit Logic ---
    const plan = businessDetails?.subscription?.plan || "STARTER";
    const staffCount = businessDetails?.usage?.staffCount || 0;

    // Starter: 1 | Standard: 5 | Premium: Unlimited
    const teamLimit =
        plan === "STARTER" ? 1 : plan === "STANDARD" ? 5 : Infinity;
    const canInviteMore = staffCount < teamLimit;

    useEffect(() => {
        // Only Admin or Manager can fetch/manage team members
        if (
            user?.role?.toLowerCase() !== "admin" &&
            user?.role?.toLowerCase() !== "manager"
        ) {
            setIsLoading(false);
            return;
        }

        // Prevent redundant fetching if already successful
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
                                    }
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
                        }
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
        // Added userInvitations.length and user?.role to satisfy ESLint
    }, [dispatch, user?.role, userInvitations.length]);

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canInviteMore) {
            toast.error(
                `Team limit reached. Your ${plan} plan allows only ${teamLimit} member(s).`
            );
            return;
        }

        if (!inviteEmail) {
            toast.error("Please enter an email address");
            return;
        }

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
            loading: "Sending Invitation.",
            success: "Invitation sent successfully.",
            error: (err) =>
                err.response?.data?.error || "Sending Invitation Failed.",
        });

        setInviteEmail("");
        setInviteRole("user");
        setShowInviteModal(false);
    };

    const handleOpenModal = () => {
        if (!canInviteMore) {
            toast.warning(
                `Team full: Your ${plan} plan is limited to ${teamLimit} member(s). Upgrade to add more.`
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

    const defaultImage = "https://placehold.co/100x100/94a3b8/ffffff?text=U";

    return (
        <>
            <div className="flex items-center space-x-2 pr-10">
                {isLoading ? (
                    <div className="flex items-center -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 animate-pulse"
                            />
                        ))}
                    </div>
                ) : acceptedUsers.length === 0 ? (
                    <div className="flex items-center gap-2">
                        <p className="text-sm truncate text-gray-500">
                            No team members
                        </p>
                        <button
                            onClick={handleOpenModal}
                            className={`h-8 w-8 min-h-8 min-w-8 rounded-full flex items-center justify-center border-2 border-white cursor-pointer transition-colors ${
                                canInviteMore
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-gray-400 cursor-not-allowed"
                            }`}
                            title={
                                canInviteMore
                                    ? "Add team member"
                                    : "Limit reached"
                            }
                        >
                            {canInviteMore ? (
                                <Plus size={16} className="stroke-white" />
                            ) : (
                                <AlertCircle
                                    size={14}
                                    className="stroke-white"
                                />
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center -space-x-2">
                        {acceptedUsers.map((acceptedUser, index) => (
                            <div
                                key={acceptedUser.id}
                                className="h-8 w-8 rounded-full overflow-hidden border-2 border-white cursor-pointer hover:scale-110 transition-transform relative"
                                style={{ zIndex: acceptedUsers.length - index }}
                                title={acceptedUser.email}
                            >
                                <Image
                                    src={acceptedUser.imageUrl || defaultImage}
                                    fill
                                    sizes="32px"
                                    alt={acceptedUser.email}
                                    className="object-cover"
                                />
                            </div>
                        ))}

                        <button
                            onClick={handleOpenModal}
                            className={`h-8 w-8 rounded-full flex items-center justify-center border-2 border-white cursor-pointer transition-colors ${
                                canInviteMore
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-gray-400 cursor-not-allowed"
                            }`}
                            style={{ zIndex: 0 }}
                            title={
                                canInviteMore
                                    ? "Add team member"
                                    : "Limit reached"
                            }
                        >
                            {canInviteMore ? (
                                <Plus size={16} className="stroke-white" />
                            ) : (
                                <AlertCircle
                                    size={14}
                                    className="stroke-white"
                                />
                            )}
                        </button>
                    </div>
                )}
            </div>

            {showInviteModal && (
                <FloatingPortal>
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                                Invite New Team Member <br />
                                <span className="text-xs text-gray-400">
                                    ({staffCount} / {teamLimit} seats occupied)
                                </span>
                            </h3>

                            <form
                                onSubmit={handleInviteUser}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) =>
                                            setInviteEmail(e.target.value)
                                        }
                                        className="outline-none bg-slate-50 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) =>
                                            setInviteRole(e.target.value)
                                        }
                                        className="outline-none bg-slate-50 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowInviteModal(false)
                                        }
                                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 w-full sm:w-auto"
                                    >
                                        Send Invitation
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </FloatingPortal>
            )}
        </>
    );
};

export default CustomUserButton;
