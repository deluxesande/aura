import { createAsyncThunk } from "@reduxjs/toolkit";
import { setUser, signOut } from "../slices/authSlice";

export const fetchUser = createAsyncThunk(
    "auth/fetchUser",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetch("/api/auth/user/profile");

            if (!response.ok) {
                throw new Error("Session invalid");
            }

            const data = await response.json();

            const userPayload = data.user || data.data || data;

            if (!userPayload.role) {
                console.warn("User payload is missing 'role':", userPayload);
            }

            dispatch(setUser(userPayload));
            return userPayload;
        } catch (error) {
            console.error("Fetch user failed:", error);
            dispatch(signOut());
            return rejectWithValue("Failed to fetch user");
        }
    }
);
