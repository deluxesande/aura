import { FloatingPortal } from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
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

    return (
        <AnimatePresence>
            {isOpen && (
                <FloatingPortal>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-lg w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden relative"
                        >
                            {/* --- Background Line Pattern --- */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                                <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                                <svg
                                    className="absolute inset-0 w-full h-full"
                                    viewBox="0 0 100 100"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M0 100 C 20 0 50 0 100 100 Z"
                                        stroke="black"
                                        strokeWidth="0.5"
                                        className="opacity-20"
                                    />
                                </svg>
                            </div>

                            {/* --- Modal Content --- */}
                            <div className="p-8 relative z-10">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                                    Create Category
                                </h1>
                                <p className="text-sm text-gray-500 text-center mb-8">
                                    Organize your products for better tracking.
                                </p>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label
                                            htmlFor="categoryName"
                                            className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                                        >
                                            Category Name
                                        </label>
                                        <input
                                            id="categoryName"
                                            type="text"
                                            value={categoryName}
                                            onChange={(e) =>
                                                setCategoryName(e.target.value)
                                            }
                                            className="block w-full pl-4 pr-4 py-3 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                                            placeholder="e.g., Electronics, Beverages..."
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-3 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all"
                                        >
                                            Create Category
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                </FloatingPortal>
            )}
        </AnimatePresence>
    );
};

export default CreateCategoryModal;
