import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer } from "@/utils/typesDefinitions";

interface CustomerState {
    customers: Customer[];
    loading: boolean;
}

const initialState: CustomerState = {
    customers: [],
    loading: false,
};

export const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        setCustomers: (state, action: PayloadAction<Customer[]>) => {
            state.customers = action.payload;
            state.loading = false;
        },
        addCustomer: (state, action: PayloadAction<Customer>) => {
            state.customers.unshift(action.payload);
        },
        updateCustomer: (state, action: PayloadAction<Customer>) => {
            const index = state.customers.findIndex(
                (customer) => customer.id === action.payload.id
            );
            if (index !== -1) {
                state.customers[index] = action.payload;
            }
        },
        removeCustomer: (state, action: PayloadAction<string>) => {
            state.customers = state.customers.filter(
                (customer) => customer.id !== action.payload
            );
        },
        setCustomerLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setCustomers,
    addCustomer,
    updateCustomer,
    removeCustomer,
    setCustomerLoading,
} = customerSlice.actions;

export default customerSlice.reducer;
