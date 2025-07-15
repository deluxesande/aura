import { signOut, signOut as signOutAction } from "@/store/slices/authSlice";
import { useAuth, useClerk, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

const CustomUserButton = () => {
    const { user } = useUser();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const { signOut } = useClerk();

    const dispatch = useDispatch();

    const handleSignOut = async () => {
        if (isSignedIn) {
            await signOut();

            // Clear user state in Redux
            dispatch(signOutAction());
        }
    };

    const hasProfileImage = user?.hasImage || false;

    const profileImage = user?.hasImage
        ? user?.imageUrl
        : "https://www.svgrepo.com/show/535711/user.svg";

    return (
        <div className="flex items-center space-x-2">
            <Link href="/profile">
                <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full overflow-hidden cursor-pointer ${
                        hasProfileImage ? "transparent" : "bg-slate-100"
                    }`}
                >
                    <Image
                        src={profileImage}
                        width={30}
                        height={30}
                        alt={`${user?.firstName} Profile Image`}
                        className="rounded-full"
                    />
                </div>
            </Link>
            <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm truncate text-red-500 hover:text-red-700 transition-colors duration-200"
            >
                Sign Out
            </button>
        </div>
    );
};

export default CustomUserButton;
