import { combineReducers } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import visibilityReducer from "./slices/visibilitySlice";

const rootReducer = combineReducers({
    product: productReducer,
    cart: cartReducer,
    visibility: visibilityReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
