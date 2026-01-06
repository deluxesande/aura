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
        mpesaShortCode?: string;
        mpesaConsumerKey?: string;
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
    loading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        signIn: (state) => {
            state.isSignedIn = true;
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isSignedIn = !!action.payload;
            state.loading = false;
        },
        signOut: (state) => {
            state.isSignedIn = false;
            state.user = null;
            state.loading = false;
        },
        clearUser: (state) => {
            state.user = null;
            state.isSignedIn = false;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { signIn, setUser, signOut, clearUser, setLoading } =
    authSlice.actions;
export default authSlice.reducer;
