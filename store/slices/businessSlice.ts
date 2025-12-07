import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Business {
    id: string;
    name: string;
    logo?: string;
}

interface BusinessState {
    business: Business | null;
    loading: boolean;
}

const initialState: BusinessState = {
    business: null,
    loading: false,
};

const businessSlice = createSlice({
    name: "business",
    initialState,
    reducers: {
        setBusiness: (state, action: PayloadAction<Business>) => {
            state.business = action.payload;
            state.loading = false;
        },
        setBusinessLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        clearBusiness: (state) => {
            state.business = null;
            state.loading = false;
        },
    },
});

export const { setBusiness, setBusinessLoading, clearBusiness } =
    businessSlice.actions;
export default businessSlice.reducer;
