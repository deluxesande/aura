import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { signOut as signOutAction } from "@/store/slices/authSlice";

const CustomUserButton = () => {
    const { user } = useUser();
    const { isSignedIn } = useAuth();

    const dispatch = useDispatch();

    const signOut = () => {
        if (isSignedIn) {
            dispatch(signOutAction());
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <button onClick={signOut}>
                <UserButton />
            </button>
            <span>{user?.firstName || user?.username}</span>
        </div>
    );
};

export default CustomUserButton;
