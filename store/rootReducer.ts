import { combineReducers } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import visibilityReducer from "./slices/visibilitySlice";
import authReducer from "./slices/authSlice";
import SideBarReducer from "./slices/sideBarSlice";
import invitationsReducer from "./slices/invitationSlice";

const rootReducer = combineReducers({
    product: productReducer,
    cart: cartReducer,
    visibility: visibilityReducer,
    auth: authReducer,
    sidebar: SideBarReducer,
    invitations: invitationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
