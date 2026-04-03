import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Delivery } from "@/utils/typesDefinitions";

interface DeliveryState {
    deliveries: Delivery[];
    loading: boolean;
}

const initialState: DeliveryState = {
    deliveries: [],
    loading: false,
};

export const deliverySlice = createSlice({
    name: "delivery",
    initialState,
    reducers: {
        setDeliveries: (state, action: PayloadAction<Delivery[]>) => {
            state.deliveries = action.payload;
            state.loading = false;
        },
        addDelivery: (state, action: PayloadAction<Delivery>) => {
            state.deliveries.unshift(action.payload);
        },
        updateDelivery: (state, action: PayloadAction<Delivery>) => {
            const index = state.deliveries.findIndex(
                (delivery) => delivery.id === action.payload.id
            );
            if (index !== -1) {
                state.deliveries[index] = action.payload;
            }
        },
        removeDelivery: (state, action: PayloadAction<string>) => {
            state.deliveries = state.deliveries.filter(
                (delivery) => delivery.id !== action.payload
            );
        },
        setDeliveryLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setDeliveries,
    addDelivery,
    updateDelivery,
    removeDelivery,
    setDeliveryLoading,
} = deliverySlice.actions;

export default deliverySlice.reducer;
