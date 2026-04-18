"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function SidePanel({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "max-w-2xl",
}: SidePanelProps) {
    // Prevent scrolling when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <div
            className={`fixed inset-0 z-[100] transition-all duration-300 ease-in-out ${
                isOpen
                    ? "bg-black/40 backdrop-blur-sm opacity-100"
                    : "bg-transparent opacity-0 pointer-events-none"
            }`}
            onClick={onClose}
        >
            <div
                className={`fixed right-0 top-0 h-full w-full ${maxWidth} bg-slate-50 shadow-2xl transition-transform duration-300 ease-in-out transform ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 md:p-6 bg-white border-b flex items-center justify-between shrink-0">
                        <h2 className="text-xl font-bold text-gray-900">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
