// components/ToastProvider.tsx
import { ReactNode } from "react";
import { Toaster } from "sonner";

interface ToastProviderProps {
    children: ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
    return (
        <>
            <Toaster richColors closeButton position="bottom-center" />
            {children}
        </>
    );
};

export default ToastProvider;
