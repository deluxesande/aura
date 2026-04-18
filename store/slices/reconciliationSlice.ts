import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ReconciliationState {
    history: any[];
    loading: boolean;
    lastFetched: number | null;
}

const initialState: ReconciliationState = {
    history: [],
    loading: false,
    lastFetched: null,
};

const reconciliationSlice = createSlice({
    name: "reconciliation",
    initialState,
    reducers: {
        setReconciliationHistory: (state, action: PayloadAction<any[]>) => {
            state.history = action.payload;
            state.lastFetched = Date.now();
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        addReconciliation: (state, action: PayloadAction<any>) => {
            state.history = [action.payload, ...state.history];
        },
        clearReconciliationCache: (state) => {
            state.history = [];
            state.lastFetched = null;
        },
    },
});

export const {
    setReconciliationHistory,
    setLoading,
    addReconciliation,
    clearReconciliationCache,
} = reconciliationSlice.actions;

export default reconciliationSlice.reducer;
