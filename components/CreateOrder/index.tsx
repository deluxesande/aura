"use client";

import React from "react";
import { X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "@/store";
import { hide } from "@/store/slices/visibilitySlice";

interface CreateOrderProps {
    children: React.ReactNode;
}

const CreateOrder: React.FC<CreateOrderProps> = ({ children }) => {
    const dispatch = useDispatch();
    const isVisible = useSelector(
        (state: AppState) => state.visibility.isVisible
    );

    const handleClose = () => {
        dispatch(hide());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-[17rem] bg-white shadow-md z-20 p-4">
            <button
                className="absolute top-8 right-8 text-gray-600 hover:text-gray-800"
                onClick={handleClose}
            >
                <X size={24} />
            </button>
            {children}
        </div>
    );
};

export default CreateOrder;
