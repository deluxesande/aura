import React from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (categoryName: string) => void;
}

const CreateCategoryModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [categoryName, setCategoryName] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(categoryName);
        setCategoryName("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed z-20 inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">
                    Create New Category
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="categoryName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Category Name
                        </label>
                        <input
                            id="categoryName"
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                            required
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 w-full sm:w-auto"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCategoryModal;
