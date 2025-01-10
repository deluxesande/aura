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
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl mb-4">Create New Category</h2>
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
                            className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                            required
                        />
                    </div>
                    <div className="space-y-4">
                        <button
                            type="submit"
                            className="w-full btn btn-md btn-ghost text-black flex items-center bg-green-400"
                        >
                            Create
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full btn btn-md btn-ghost text-white flex items-center bg-red-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCategoryModal;
