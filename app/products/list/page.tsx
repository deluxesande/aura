"use client";

import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import { Product } from "@/utils/typesDefinitions";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Page() {
    const [products, setProducts] = useState<Product[]>([]);

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
            <ProductList products={products} />
        </Navbar>
    );
}
