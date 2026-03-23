// store/slices/productSlice.ts
import { Product } from "@/utils/typesDefinitions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductState {
    products: Product[];
}

const initialState: ProductState = {
    products: [],
};

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setProducts(state, action: PayloadAction<Product[]>) {
            state.products = action.payload;
        },
    },
});

// Selector to get all products
export const selectProducts = (state: { product: ProductState }) =>
    state.product.products;

export const { setProducts } = productSlice.actions;
export default productSlice.reducer;
