import React, { useState } from "react";
import { X } from "lucide-react"; // Import an icon for the close button

interface CreateOrderProps {
    children: React.ReactNode;
}

const CreateOrder: React.FC<CreateOrderProps> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
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
