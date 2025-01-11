"use client";

import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import { Product } from "@/utils/typesDefinitions";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
    const [products, setProducts] = useState<Product[]>([]);

    const handleDelete = async (productId: string) => {
        const promise = async () => {
            try {
                await axios.delete(`/api/product/${productId}`);

                // Update the products state after deletion
                setProducts((prevProducts) =>
                    prevProducts.filter((product) => product.id !== productId)
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
                    setProducts([]);
                } else {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <Navbar>
            <ProductList products={products} handleDelete={handleDelete} />
        </Navbar>
    );
}
