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
    const [loading, setLoading] = useState<boolean>(false);
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
                            (product: Product) => product.id !== productId
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
        const fetchProductsAndUpdateStore = async () => {
            try {
                const response = await axios.get("/api/product");
                const fetchedProducts = Array.isArray(response.data)
                    ? response.data
                    : [];

                // Update both local state and the Redux store with the latest data
                setLocalProducts(fetchedProducts);
                dispatch(setProducts(fetchedProducts));
            } catch (error) {
                // console.error("Error fetching products:", error);
                toast.error("Failed to fetch latest products.");
            } finally {
                // Ensure loading is turned off after the fetch completes
                setLoading(false);
            }
        };

        // Check if products are already in the Redux store
        if (originalProducts.length > 0) {
            // If yes, display them immediately from the store
            setLocalProducts(originalProducts);
            setLoading(false); // We have data, so we are not in an initial loading state
        } else {
            // If not, show the loading indicator while we fetch
            setLoading(true);
        }

        // Always fetch in the background to get the latest updates
        fetchProductsAndUpdateStore();
    }, [dispatch, originalProducts]);

    return (
        <Navbar>
            <div className="hidden lg:block">
                <ProductList
                    products={products}
                    handleDelete={handleDelete}
                    loading={loading}
                />
            </div>
            <div className="block lg:hidden">
                <MobileProductList
                    products={products}
                    handleDelete={handleDelete}
                    loading={loading}
                />
            </div>
        </Navbar>
    );
}
