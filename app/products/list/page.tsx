"use client";

import MobileProductList from "@/components/MobileProductList";
import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import StockTransferModal from "@/components/modals/StockTransferModal";
import { AppState } from "@/store";
import { setProducts } from "@/store/slices/productSlice";
import { Product } from "@/utils/typesDefinitions";
import { apiClient } from "@/utils/apiClient";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

export default function Page() {
    const dispatch = useDispatch();

    const products = useSelector((state: AppState) => state.product.products);
    const [filteredProducts, setFilteredProducts] = useState(products);

    const [loading, setLoading] = useState(products.length === 0);

    // Transfer Modal State
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedTransferProduct, setSelectedTransferProduct] =
        useState<Product | null>(null);

    // Update filtered products when products change
    useEffect(() => {
        setFilteredProducts(products);
    }, [products]);

    // Prevent double-fetching in React Strict Mode
    const hasFetched = useRef(false);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await apiClient.get("/product");
            // Correctly access the nested data array from the backend pagination object
            const fetchedProducts = Array.isArray(response.data?.data)
                ? response.data.data
                : [];
            dispatch(setProducts(fetchedProducts));
        } catch (error) {
            console.error("Background update failed");
        }
    }, [dispatch]);

    const handleDelete = async (productId: string) => {
        const previousProducts = [...products];

        const optimisticList = products.filter(
            (product: Product) => product.id !== productId,
        );
        dispatch(setProducts(optimisticList));

        try {
            await apiClient.delete(`/product/${productId}`);
            toast.success("Product deleted successfully");
        } catch (error) {
            dispatch(setProducts(previousProducts));
            toast.error("Error deleting product, changes reverted");
        }
    };

    const handleTransferClick = (product: Product) => {
        setSelectedTransferProduct(product);
        setIsTransferModalOpen(true);
    };

    useEffect(() => {
        if (hasFetched.current) return;

        const loadInitial = async () => {
            if (products.length === 0) setLoading(true);
            await fetchProducts();
            setLoading(false);
            hasFetched.current = true;
        };

        loadInitial();
    }, [fetchProducts, products.length]);

    return (
        <Navbar setFilteredProducts={setFilteredProducts}>
            <div className="hidden lg:block">
                <ProductList
                    products={filteredProducts}
                    handleDelete={handleDelete}
                    onTransferClick={handleTransferClick}
                    loading={loading}
                />
            </div>
            <div className="block lg:hidden">
                <MobileProductList
                    products={filteredProducts}
                    handleDelete={handleDelete}
                    onTransferClick={handleTransferClick}
                    loading={loading}
                />
            </div>

            <AnimatePresence>
                {isTransferModalOpen && selectedTransferProduct && (
                    <StockTransferModal
                        isOpen={isTransferModalOpen}
                        onClose={() => setIsTransferModalOpen(false)}
                        product={selectedTransferProduct}
                        onSuccess={() => fetchProducts()}
                    />
                )}
            </AnimatePresence>
        </Navbar>
    );
}
