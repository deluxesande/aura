import Navbar from "@/components/Navbar";
import React from "react";

export default function Page() {
    const handleSubmit = () => {
        console.log("Submitted");
    };

    return (
        <Navbar>
            <div className="flex w-full justify-between">
                <div className="px-6 py-4 rounded-lg gap-4 bg-white flex-1">
                    <h1 className="text-2xl font-bold mb-6 text-gray-400">
                        Create Product
                    </h1>

                    <form>
                        <div className="flex justify-between gap-4">
                            <div className="w-1/2">
                                {/* Product Name */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="productName">Name:</label>
                                    <input
                                        id="productName"
                                        type="text"
                                        className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                        required
                                    />
                                </div>

                                {/* Product Description */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="productDescription">
                                        Description:
                                    </label>
                                    <textarea
                                        id="productDescription"
                                        className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                        required
                                    />
                                </div>

                                {/* Product Price */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="productPrice">Price:</label>
                                    <input
                                        id="productPrice"
                                        type="number"
                                        className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                        required
                                    />
                                </div>

                                {/* Product Quantity */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="productQuantity">
                                        Quantity:
                                    </label>
                                    <input
                                        id="productQuantity"
                                        type="number"
                                        className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                        required
                                    />
                                </div>

                                {/* Product Category */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="productCategory">
                                        Category:
                                    </label>
                                    <select
                                        id="productCategory"
                                        className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                        required
                                    >
                                        <option value={"Select"}>
                                            Select Category
                                        </option>
                                        <option value={"Category 1"}>
                                            Category 1
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="w-1/2">
                                {/* Product Image */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="productImage">Image:</label>
                                    <input
                                        id="productImage"
                                        type="text"
                                        className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                        required
                                    />
                                </div>

                                {/* Product InStock */}
                                <div className="flex flex-row gap-4 my-4">
                                    <label htmlFor="productInStock">
                                        Instock:
                                    </label>
                                    <input
                                        id="productInStock"
                                        type="checkbox"
                                        className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full mt-8"
                        >
                            <span className="ml-2">Add Product</span>
                        </button>
                    </form>
                </div>
            </div>
        </Navbar>
    );
}
