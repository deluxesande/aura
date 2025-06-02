"use client";

import MobileProductList from "@/components/MobileProductList";
import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import { AppState } from "@/store";
import { setProducts } from "@/store/slices/productSlice";
import { Product } from "@/utils/typesDefinitions";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function Page() {
    const [products, setLocalProducts] = useState<Product[]>([]);
    const originalProducts = useSelector(
        (state: AppState) => state.product.products
    );
    const dispatch = useDispatch();

    const handleDelete = async (productId: string) => {
        const promise = async () => {
            try {
                await axios.delete(`/api/product/${productId}`);

                // Update the products state after deletion
                setLocalProducts((prevProducts) =>
                    prevProducts.filter((product) => product.id !== productId)
                );
                dispatch(
                    setProducts(
                        originalProducts.filter(
                            (product) => product.id !== productId
                        )
                    )
                );
            } catch (error) {
                throw new Error("Error deleting product");
            }
        };

        toast.promise(promise(), {
            loading: "Deleting product...",
            success: "Product deleted successfully",
            error: "Error deleting product",
        });
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("/api/product");
                // Ensure productsData is an array
                if (!Array.isArray(response.data)) {
                    setLocalProducts([]);
                } else {
                    setLocalProducts(response.data);
                }
            } catch (error) {
                // console.error("Error fetching products:", error);
            }
        };

        // Check if productsData is already available in the store
        if (originalProducts.length > 0) {
            setLocalProducts(originalProducts);
        } else {
            // Fetch products from the API
            fetchProducts();
        }
    }, [originalProducts]);

    return (
        <Navbar>
            <div className="hidden lg:block">
                <ProductList products={products} handleDelete={handleDelete} />
            </div>
            <div className="block lg:hidden">
                <MobileProductList
                    products={products}
                    handleDelete={handleDelete}
                />
            </div>
        </Navbar>
    );
}
