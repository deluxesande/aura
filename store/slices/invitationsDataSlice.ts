import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

interface InvitationsDataState {
    invitationsWithImages: Invitation[];
    loading: boolean;
}

const initialState: InvitationsDataState = {
    invitationsWithImages: [],
    loading: false,
};

const invitationsDataSlice = createSlice({
    name: "invitationsData",
    initialState,
    reducers: {
        setInvitationsWithImages: (
            state,
            action: PayloadAction<Invitation[]>
        ) => {
            state.invitationsWithImages = action.payload;
            state.loading = false;
        },
        addInvitation: (state, action: PayloadAction<Invitation>) => {
            state.invitationsWithImages.push(action.payload);
        },
        updateInvitation: (
            state,
            action: PayloadAction<{
                id: string;
                updates: Partial<Invitation>;
            }>
        ) => {
            const index = state.invitationsWithImages.findIndex(
                (inv) => inv.id === action.payload.id
            );
            if (index !== -1) {
                state.invitationsWithImages[index] = {
                    ...state.invitationsWithImages[index],
                    ...action.payload.updates,
                };
            }
        },
        removeInvitation: (state, action: PayloadAction<string>) => {
            state.invitationsWithImages = state.invitationsWithImages.filter(
                (inv) => inv.id !== action.payload
            );
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setInvitationsWithImages,
    addInvitation,
    updateInvitation,
    removeInvitation,
    setLoading,
} = invitationsDataSlice.actions;
export default invitationsDataSlice.reducer;
