import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Invitation {
    id: string;
    email: string;
    status: string;
    createdAt: string;
    inviter?: {
        firstName: string;
        lastName: string;
    };
    Business?: {
        name: string;
    };
}

interface InvitationsState {
    invitations: Invitation[];
    loading: boolean;
    error: string | null;
}

const initialState: InvitationsState = {
    invitations: [],
    loading: false,
    error: null,
};

const invitationsSlice = createSlice({
    name: "invitations",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setInvitations: (state, action: PayloadAction<Invitation[]>) => {
            state.invitations = action.payload;
            state.loading = false;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const { setLoading, setInvitations, setError, clearError } =
    invitationsSlice.actions;
export default invitationsSlice.reducer;
