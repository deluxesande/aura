import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Supplier } from "@/utils/typesDefinitions";

interface SupplierState {
    suppliers: Supplier[];
    loading: boolean;
}

const initialState: SupplierState = {
    suppliers: [],
    loading: false,
};

export const supplierSlice = createSlice({
    name: "supplier",
    initialState,
    reducers: {
        setSuppliers: (state, action: PayloadAction<Supplier[]>) => {
            state.suppliers = action.payload;
            state.loading = false;
        },
        addSupplier: (state, action: PayloadAction<Supplier>) => {
            state.suppliers.unshift(action.payload);
        },
        updateSupplier: (state, action: PayloadAction<Supplier>) => {
            const index = state.suppliers.findIndex(
                (supplier) => supplier.id === action.payload.id
            );
            if (index !== -1) {
                state.suppliers[index] = action.payload;
            }
        },
        removeSupplier: (state, action: PayloadAction<string>) => {
            state.suppliers = state.suppliers.filter(
                (supplier) => supplier.id !== action.payload
            );
        },
        setSupplierLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setSuppliers,
    addSupplier,
    updateSupplier,
    removeSupplier,
    setSupplierLoading,
} = supplierSlice.actions;

export default supplierSlice.reducer;
