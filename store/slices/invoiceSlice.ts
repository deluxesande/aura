import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Invoice } from "@/utils/typesDefinitions";

interface InvoiceState {
    invoices: Invoice[];
}

const initialState: InvoiceState = {
    invoices: [],
};

export const invoiceSlice = createSlice({
    name: "invoice",
    initialState,
    reducers: {
        // Used to overwrite the list (e.g., fetching from API)
        setInvoices: (state, action: PayloadAction<Invoice[]>) => {
            state.invoices = action.payload;
        },
        // Used when creating a new invoice
        addInvoice: (state, action: PayloadAction<Invoice>) => {
            state.invoices.push(action.payload);
        },
        // Used when editing an invoice
        updateInvoice: (state, action: PayloadAction<Invoice>) => {
            const index = state.invoices.findIndex(
                (invoice) => invoice.id === action.payload.id
            );
            if (index !== -1) {
                state.invoices[index] = action.payload;
            }
        },
        // Used when deleting an invoice
        removeInvoice: (state, action: PayloadAction<string>) => {
            state.invoices = state.invoices.filter(
                (invoice) => invoice.id !== action.payload
            );
        },
    },
});

export const { setInvoices, addInvoice, updateInvoice, removeInvoice } =
    invoiceSlice.actions;

export default invoiceSlice.reducer;
