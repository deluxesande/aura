import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuditLogState {
    logs: any[];
    loading: boolean;
    lastFetched: number | null;
}

const initialState: AuditLogState = {
    logs: [],
    loading: false,
    lastFetched: null,
};

const auditLogSlice = createSlice({
    name: "auditLog",
    initialState,
    reducers: {
        setAuditLogs: (state, action: PayloadAction<any[]>) => {
            state.logs = action.payload;
            state.lastFetched = Date.now();
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        clearAuditCache: (state) => {
            state.logs = [];
            state.lastFetched = null;
        },
    },
});

export const { setAuditLogs, setLoading, clearAuditCache } = auditLogSlice.actions;
export default auditLogSlice.reducer;
