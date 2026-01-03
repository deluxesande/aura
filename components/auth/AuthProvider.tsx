"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { fetchUser } from "@/store/auth/authThunks";
import { signOut } from "@/store/slices/authSlice";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchUser())
            .unwrap()
            .catch(() => {
                dispatch(signOut());
            });
    }, [dispatch]);

    return <>{children}</>;
}
