import { combineReducers } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import visibilityReducer from "./slices/visibilitySlice";
import authReducer from "./slices/authSlice";
import SideBarReducer from "./slices/sideBarSlice";
import invitationsReducer from "./slices/invitationSlice";
import businessReducer from "./slices/businessSlice";
import invitationsDataReducer from "./slices/invitationsDataSlice";
import invoiceReducer from "./slices/invoiceSlice";
import analyticsReducer from "./slices/analyticsSlice";
import businessDataReducer from "./slices/businessDataSlice";
import customerReducer from "./slices/customerSlice";
import supplierReducer from "./slices/supplierSlice";
import deliveryReducer from "./slices/deliverySlice";
import orderReducer from "./slices/orderSlice";
import expenseReducer from "./slices/expenseSlice";
import categoryReducer from "./slices/categorySlice";
import auditLogReducer from "./slices/auditLogSlice";
import reconciliationReducer from "./slices/reconciliationSlice";

const rootReducer = combineReducers({
    product: productReducer,
    cart: cartReducer,
    visibility: visibilityReducer,
    auth: authReducer,
    sidebar: SideBarReducer,
    invitations: invitationsReducer,
    business: businessReducer,
    invitationsData: invitationsDataReducer,
    invoice: invoiceReducer,
    analytics: analyticsReducer,
    businessData: businessDataReducer,
    customer: customerReducer,
    supplier: supplierReducer,
    delivery: deliveryReducer,
    order: orderReducer,
    expense: expenseReducer,
    category: categoryReducer,
    auditLog: auditLogReducer,
    reconciliation: reconciliationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
