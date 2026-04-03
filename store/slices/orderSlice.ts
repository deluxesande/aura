import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseOrder } from "@/utils/typesDefinitions";

interface OrderState {
    orders: PurchaseOrder[];
    loading: boolean;
}

const initialState: OrderState = {
    orders: [],
    loading: false,
};

export const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setOrders: (state, action: PayloadAction<PurchaseOrder[]>) => {
            state.orders = action.payload;
            state.loading = false;
        },
        addOrder: (state, action: PayloadAction<PurchaseOrder>) => {
            state.orders.unshift(action.payload);
        },
        updateOrder: (state, action: PayloadAction<PurchaseOrder>) => {
            const index = state.orders.findIndex(
                (order) => order.id === action.payload.id
            );
            if (index !== -1) {
                state.orders[index] = action.payload;
            }
        },
        removeOrder: (state, action: PayloadAction<string>) => {
            state.orders = state.orders.filter(
                (order) => order.id !== action.payload
            );
        },
        setOrderLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setOrders,
    addOrder,
    updateOrder,
    removeOrder,
    setOrderLoading,
} = orderSlice.actions;

export default orderSlice.reducer;
