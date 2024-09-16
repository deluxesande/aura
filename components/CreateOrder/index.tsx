import React from "react";

interface CreateOrderProps {
    children: React.ReactNode;
}

const CreateOrder: React.FC<CreateOrderProps> = ({ children }) => {
    return (
        <div className="fixed right-0 top-0 h-full w-[17rem] bg-white shadow-md z-20 p-4">
            {children}
        </div>
    );
};

export default CreateOrder;
