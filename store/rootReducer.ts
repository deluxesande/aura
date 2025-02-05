import { combineReducers } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import visibilityReducer from "./slices/visibilitySlice";
import authReducer from "./slices/authSlice";

const rootReducer = combineReducers({
    product: productReducer,
    cart: cartReducer,
    visibility: visibilityReducer,
    auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
