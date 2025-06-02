import { createSlice } from "@reduxjs/toolkit";

interface SideBarState {
    isOpen: boolean;
}

const initialState: SideBarState = {
    isOpen: true,
};

const sideBarSlice = createSlice({
    name: "sideBar",
    initialState,
    reducers: {
        toggleSideBarState: (state) => {
            state.isOpen = !state.isOpen;
        },
    },
});

export const { toggleSideBarState } = sideBarSlice.actions;
export default sideBarSlice.reducer;
