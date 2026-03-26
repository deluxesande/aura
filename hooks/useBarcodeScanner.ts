import { useEffect, useCallback, useRef } from "react";

export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
    const buffer = useRef<string>("");
    const lastKeyTime = useRef<number>(Date.now());

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Ignore keydowns if the user is actively typing inside an actual input/textarea
            if (
                ["INPUT", "TEXTAREA", "SELECT"].includes(
                    (e.target as HTMLElement).tagName,
                )
            ) {
                return;
            }

            const currentTime = Date.now();

            // If more than 50ms has passed since the last keypress,
            // it's likely a human typing, not a scanner. Reset the buffer.
            if (currentTime - lastKeyTime.current > 50) {
                buffer.current = "";
            }

            // Scanners usually append an 'Enter' key at the end of the barcode
            if (e.key === "Enter" && buffer.current.length > 3) {
                onScan(buffer.current);
                buffer.current = "";
            }
            // Only capture printable characters
            else if (e.key.length === 1) {
                buffer.current += e.key;
            }

            lastKeyTime.current = currentTime;
        },
        [onScan],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);
};
