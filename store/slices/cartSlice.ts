import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/utils/typesDefinitions";

interface CartItem extends Product {
    cartQuantity: number;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<Product>) => {
            const existingProduct = state.items.find(
                (item) => item.id === action.payload.id
            );

            if (existingProduct) {
                existingProduct.cartQuantity += 1;
            } else {
                state.items.push({ ...action.payload, cartQuantity: 1 });
            }
        },
        removeItem: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            );
        },
        decrementItem: (state, action: PayloadAction<number>) => {
            const existingProduct = state.items.find(
                (item) => item.id === action.payload
            );

            if (existingProduct && existingProduct.cartQuantity > 1) {
                existingProduct.cartQuantity -= 1;
            } else {
                state.items = state.items.filter(
                    (item) => item.id !== action.payload
                );
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { addItem, removeItem, decrementItem, clearCart } =
    cartSlice.actions;
export default cartSlice.reducer;
