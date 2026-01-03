import { createAsyncThunk } from "@reduxjs/toolkit";
import { setUser, signOut } from "../slices/authSlice";

export const fetchUser = createAsyncThunk(
    "auth/fetchUser",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetch("/api/auth/user/profile");

            // Handle 401 specifically (Guest user)
            // This is NOT an error, it just means "no user logged in"
            if (response.status === 401) {
                dispatch(signOut());
                return rejectWithValue("Guest");
            }

            // if (!response.ok) {
            //     throw new Error(`Server error: ${response.statusText}`);
            // }

            const data = await response.json();
            const userPayload = data.user || data.data || data;

            // if (!userPayload.role) {
            //     console.warn("User payload is missing 'role':", userPayload);
            // }

            dispatch(setUser(userPayload));
            return userPayload;
        } catch (error: any) {
            // if (error.message !== "Guest") {
            //     console.error("Fetch user failed:", error);
            // }

            dispatch(signOut());
            return rejectWithValue(error.message || "Failed to fetch user");
        }
    }
);
