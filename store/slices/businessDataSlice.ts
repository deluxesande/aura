import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type BusinessDetails = {
    id: string;
    name: string;
    subscription?: {
        plan: "STARTER" | "STANDARD" | "PREMIUM";
        status: string;
        currentPeriodStart: string;
        currentPeriodEnd: string;
    };
    usage: {
        transactionCount: number;
        staffCount: number;
        isLimitReached: boolean;
        canExportData: boolean;
        hasCustomBranding: boolean;
    };
};

interface BusinessDataState {
    businessDetails: BusinessDetails | null;
    loading: boolean;
}

const initialState: BusinessDataState = {
    businessDetails: null,
    loading: false,
};

export const businessDataSlice = createSlice({
    name: "businessData",
    initialState,
    reducers: {
        setBusinessDetails: (state, action: PayloadAction<BusinessDetails>) => {
            state.businessDetails = action.payload;
            state.loading = false;
        },
        setBusinessLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        clearBusinessData: (state) => {
            state.businessDetails = null;
        },
    },
});

export const { setBusinessDetails, setBusinessLoading, clearBusinessData } =
    businessDataSlice.actions;
export default businessDataSlice.reducer;
