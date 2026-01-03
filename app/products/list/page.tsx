"use client";

import MobileProductList from "@/components/MobileProductList";
import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import { AppState } from "@/store";
import { setProducts } from "@/store/slices/productSlice";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function Page() {
    const dispatch = useDispatch();

    const products = useSelector((state: AppState) => state.product.products);

    const [loading, setLoading] = useState(products.length === 0);

    // Prevent double-fetching in React Strict Mode
    const hasFetched = useRef(false);

    const handleDelete = async (productId: string) => {
        const previousProducts = [...products];

        const optimisticList = products.filter(
            (product) => product.id !== productId
        );
        dispatch(setProducts(optimisticList));

        try {
            await axios.delete(`/api/product/${productId}`);
            toast.success("Product deleted successfully");
        } catch (error) {
            dispatch(setProducts(previousProducts));
            toast.error("Error deleting product, changes reverted");
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;

        const fetchProducts = async () => {
            if (products.length === 0) setLoading(true);

            try {
                const response = await axios.get("/api/product");
                const fetchedProducts = Array.isArray(response.data)
                    ? response.data
                    : [];
                dispatch(setProducts(fetchedProducts));
            } catch (error) {
                console.error("Background update failed");
            } finally {
                setLoading(false);
                hasFetched.current = true;
            }
        };

        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]); // Removed 'products' dependency to prevent fetch loops

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
