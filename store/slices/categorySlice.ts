import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category } from "@/utils/typesDefinitions";

interface CategoryState {
    categories: Category[];
    loading: boolean;
}

const initialState: CategoryState = {
    categories: [],
    loading: false,
};

export const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setCategories: (state, action: PayloadAction<Category[]>) => {
            state.categories = action.payload;
            state.loading = false;
        },
        addCategory: (state, action: PayloadAction<Category>) => {
            state.categories.unshift(action.payload);
        },
        updateCategory: (state, action: PayloadAction<Category>) => {
            const index = state.categories.findIndex(
                (category) => category.id === action.payload.id
            );
            if (index !== -1) {
                state.categories[index] = action.payload;
            }
        },
        removeCategory: (state, action: PayloadAction<string>) => {
            state.categories = state.categories.filter(
                (category) => category.id !== action.payload
            );
        },
        setCategoryLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setCategories,
    addCategory,
    updateCategory,
    removeCategory,
    setCategoryLoading,
} = categorySlice.actions;

export default categorySlice.reducer;
