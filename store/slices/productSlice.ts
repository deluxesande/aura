// store/slices/productSlice.ts
import { Category, InvoiceItem } from "@/utils/typesDefinitions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductState {
    products: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        sku: string;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        Category: Category;
        invoiceItems: InvoiceItem[];
        image: string;
        inStock: boolean;
    }>;
}

const initialState: ProductState = {
    products: [],
};

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setProducts(state, action: PayloadAction<ProductState["products"]>) {
            state.products = action.payload;
        },
    },
});

// Selector to get all products
export const selectProducts = (state: { product: ProductState }) =>
    state.product.products;

export const { setProducts } = productSlice.actions;
export default productSlice.reducer;
