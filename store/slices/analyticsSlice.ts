import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AnalyticsStats {
    totalInvoices: number;
    totalRevenue: number;
    paidInvoices: number;
    profit: number;
    inventoryValue: number;
    totalProcurement: number;
    totalExpenses: number;
}

interface AnalyticsPercentageChanges {
    totalInvoices: number;
    totalRevenue: number;
    paidInvoices: number;
    profit: number;
}

export interface AnalyticsData {
    stats: AnalyticsStats;
    percentageChanges: AnalyticsPercentageChanges;
    mpesaBalance: number;
}

interface AnalyticsState {
    loading: boolean;
    data: AnalyticsData | null;
    timeRange: string;
    error: string | null;
}

const initialState: AnalyticsState = {
    loading: true,
    data: null,
    timeRange: "30d",
    error: null,
};

const analyticsSlice = createSlice({
    name: "analytics",
    initialState,
    reducers: {
        startFetching: (state) => {
            state.loading = true;
            state.error = null;
        },
        setAnalyticsData: (state, action: PayloadAction<AnalyticsData>) => {
            state.data = action.payload;
            state.loading = false;
        },
        setTimeRange: (state, action: PayloadAction<string>) => {
            state.timeRange = action.payload;
            state.loading = true;
        },
        setAnalyticsError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearAnalytics: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
            state.timeRange = "30d";
        },
    },
});

export const {
    startFetching,
    setAnalyticsData,
    setTimeRange,
    setAnalyticsError,
    clearAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
