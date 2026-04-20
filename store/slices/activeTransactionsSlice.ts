import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ActiveTransaction {
    invoiceId: string;
    customerName: string;
    amount: number;
    status: "PENDING" | "COMPLETED" | "FAILED";
    phoneNumber: string;
    createdAt: number;
}

interface TransactionsState {
    transactions: ActiveTransaction[];
}

const initialState: TransactionsState = {
    transactions: [],
};

const activeTransactionsSlice = createSlice({
    name: "activeTransactions",
    initialState,
    reducers: {
        addTransaction: (state, action: PayloadAction<ActiveTransaction>) => {
            state.transactions.unshift(action.payload);
        },
        updateTransactionStatus: (
            state,
            action: PayloadAction<{ id: string; status: ActiveTransaction["status"] }>
        ) => {
            const tx = state.transactions.find((t) => t.invoiceId === action.payload.id);
            if (tx) {
                tx.status = action.payload.status;
            }
        },
        removeTransaction: (state, action: PayloadAction<string>) => {
            state.transactions = state.transactions.filter(
                (t) => t.invoiceId !== action.payload
            );
        },
        clearCompleted: (state) => {
            state.transactions = state.transactions.filter(
                (t) => t.status === "PENDING"
            );
        },
    },
});

export const {
    addTransaction,
    updateTransactionStatus,
    removeTransaction,
    clearCompleted,
} = activeTransactionsSlice.actions;

export default activeTransactionsSlice.reducer;
