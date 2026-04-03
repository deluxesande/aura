import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Expense } from "@/utils/typesDefinitions";

interface ExpenseState {
    expenses: Expense[];
    loading: boolean;
}

const initialState: ExpenseState = {
    expenses: [],
    loading: false,
};

export const expenseSlice = createSlice({
    name: "expense",
    initialState,
    reducers: {
        setExpenses: (state, action: PayloadAction<Expense[]>) => {
            state.expenses = action.payload;
            state.loading = false;
        },
        addExpense: (state, action: PayloadAction<Expense>) => {
            state.expenses.unshift(action.payload);
        },
        updateExpense: (state, action: PayloadAction<Expense>) => {
            const index = state.expenses.findIndex(
                (expense) => expense.id === action.payload.id
            );
            if (index !== -1) {
                state.expenses[index] = action.payload;
            }
        },
        removeExpense: (state, action: PayloadAction<string>) => {
            state.expenses = state.expenses.filter(
                (expense) => expense.id !== action.payload
            );
        },
        setExpenseLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setExpenses,
    addExpense,
    updateExpense,
    removeExpense,
    setExpenseLoading,
} = expenseSlice.actions;

export default expenseSlice.reducer;
