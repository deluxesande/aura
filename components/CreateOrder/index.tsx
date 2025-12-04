"use client";

import React from "react";
import { X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "@/store";
import { hide } from "@/store/slices/visibilitySlice";
import { FloatingPortal } from "@floating-ui/react";

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
        <FloatingPortal>
            <div
                className="fixed right-0 top-0 h-full w-[20rem] bg-white shadow-md p-4"
                style={{ zIndex: 9999 }}
            >
                <button
                    className="absolute top-8 right-8 text-gray-600 hover:text-gray-800"
                    onClick={handleClose}
                >
                    <X size={24} />
                </button>
                {children}
            </div>
        </FloatingPortal>
    );
};

export default CreateOrder;
