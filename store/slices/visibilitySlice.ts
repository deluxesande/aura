import { createSlice } from "@reduxjs/toolkit";

interface VisibilityState {
    isVisible: boolean;
}

const initialState: VisibilityState = {
    isVisible: false,
};

const visibilitySlice = createSlice({
    name: "visibility",
    initialState,
    reducers: {
        show: (state) => {
            state.isVisible = true;
        },
        hide: (state) => {
            state.isVisible = false;
        },
    },
});

export const { show, hide } = visibilitySlice.actions;
export default visibilitySlice.reducer;
