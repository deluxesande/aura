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
            <div className="bg-white p-6 rounded-lg shadow-lg w-5/6 lg:w-4/6 xl:w-3/6">
                <h1 className="text-2xl font-bold mb-6 text-gray-400">
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
                    <div className="space-x-0 space-y-4 lg:space-y-0 lg:space-x-4 flex flex-wrap lg:flex-nowrap justify-center items-center">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-grow w-full lg:w-1/2 btn btn-md btn-ghost text-white flex items-center bg-red-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-grow w-full lg:w-1/2 btn btn-md btn-ghost text-black flex items-center bg-green-400"
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
