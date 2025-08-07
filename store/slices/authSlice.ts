import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    businessId: string | null;
    status: string;
    Business?: {
        id: string;
        name: string;
    } | null;
}

interface AuthState {
    isSignedIn: boolean;
    user: User | null;
    loading: boolean;
}

const initialState: AuthState = {
    isSignedIn: false,
    user: null,
    loading: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        signIn: (state) => {
            state.isSignedIn = true;
            state.loading = true;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.loading = false;
        },
        signOut: (state) => {
            state.isSignedIn = false;
            state.user = null;
            state.loading = false;
        },
        clearUser: (state) => {
            state.user = null;
            state.loading = false;
        },
    },
});

export const { signIn, setUser, signOut, clearUser } = authSlice.actions;
export default authSlice.reducer;
