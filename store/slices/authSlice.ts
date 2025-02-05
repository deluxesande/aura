import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    isSignedIn: boolean;
}

const initialState: AuthState = {
    isSignedIn: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        signIn: (state) => {
            state.isSignedIn = true;
        },
        signOut: (state) => {
            state.isSignedIn = false;
        },
    },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
