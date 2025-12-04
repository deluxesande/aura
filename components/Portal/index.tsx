"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: React.ReactNode;
}

const Portal = ({ children }: PortalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Only render the portal on the client-side
    // This prevents hydration errors and "document is undefined" errors
    if (!mounted) {
        return null;
    }

    return createPortal(children, document.body);
};

export default Portal;
