"use client";

import CategoryBox from "@/components/CategoryBox";
import CreateOrder from "@/components/CreateOrder"; // Import the CreateOrder component
import CustomUserButton from "@/components/CustomUserButton";
import MobileProductCard from "@/components/MobileProductCard";
import Navbar from "@/components/Navbar";
import OrderCard from "@/components/OrderCard";
import ProductCard from "@/components/ProductCard";
import { AppState } from "@/store";
import { addItem, clearCart } from "@/store/slices/cartSlice";
import { setProducts } from "@/store/slices/productSlice";
import { show } from "@/store/slices/visibilitySlice";
import { Product } from "@/utils/typesDefinitions";
import { SignedIn } from "@clerk/nextjs";
import axios from "axios";
import {
    Book,
    Briefcase,
    FileText,
    Pencil,
    PlusCircle,
    ShoppingCart,
    Store,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface Category {
    id: string;
    name: string;
    description?: string;
    active?: boolean;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Function to dynamically assign icons based on category name
const getCategoryIcon = (
    categoryName: string
): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
    const iconMap: Record<
        string,
        React.ComponentType<React.SVGProps<SVGSVGElement>>
    > = {
        Stationery: Pencil,
        Books: Book,
        Shopping: ShoppingCart,
        Business: Briefcase,
        Documents: FileText,
    };

    // Return the icon if found, otherwise a default icon
    return iconMap[categoryName] || FileText; // Default icon
};

export default function Page() {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: AppState) => state.cart.items);
    const [products, setLocalProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([
        {
            name: "All",
            description: "All products",
            icon: Store,
            active: true,
            id: "",
        },
    ]);
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [buttonText, setButtonText] = useState("Mpesa");
    const [mpesaNumber, setMpesaNumber] = useState("");
    const productsData = useSelector(
        (state: AppState) => state.product.products
    );

    // Function to map API data to the `Category` interface
    const mapCategories = React.useCallback((apiData: any[]): Category[] => {
        return apiData.map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description || "",
            active: false,
            icon: getCategoryIcon(category.name),
        }));
    }, []);

    const toggleActiveCategory = (categoryId: string) => {
        setCategories((prevCategories) =>
            prevCategories.map((category) => ({
                ...category,
                active: category.id === categoryId, // Set active to true for the clicked category, false for others
            }))
        );
    };

    useEffect(() => {
        setFilteredProducts(() => {
            const activeCategory = categories.find(
                (category) => category.active
            );

            // If the active category is "All", return all products
            if (activeCategory?.name === "All") {
                return productsData;
            }

            // Otherwise, filter products by the active category's ID
            return productsData.filter(
                (product) => product.categoryId === activeCategory?.id
            );
        });
    }, [categories, productsData]);

    const handleAddToCart = (product: Product) => {
        const cartItem = cartItems.find((item) => item.id === product.id);
        if (product.quantity > 0) {
            if (
                product.quantity &&
                product.quantity > (cartItem?.cartQuantity || 0)
            ) {
                dispatch(addItem(product));
                dispatch(show());
            } else {
                toast.warning("Insufficient product quantity available.");
            }
        } else {
            toast.warning("Product cannot be added to the cart.");
        }
    };

    const handleOrder = async () => {
        /**
         * Create invoice items for each cart item
         *
         * This will create an invoice item for each cart item
         * and store the invoice item ID in an array.
         *
         * If all invoice items are created successfully, an invoice
         * will be created with the total amount based on the cart items.
         *
         * This approach reduces the number of API calls to create an invoice.
         */

        // Check if cartItems are empty
        if (cartItems.length === 0) {
            toast.warning("Cart is empty. No order to process.");
            return;
        }

        const promise = async () => {
            const invoiceItemPromises = cartItems.map(async (item) => {
                const data = {
                    quantity: item.cartQuantity,
                    price: item.price * item.cartQuantity,
                    productId: item.id,
                };

                try {
                    const response = await axios.post(
                        "/api/invoiceItem/",
                        data
                    );
                    return response.data;
                } catch (error) {
                    return null;
                }
            });

            const results = await Promise.all(invoiceItemPromises);

            const invoiceItems = results
                .filter((result) => result !== null) // Filter out any null results
                .map((result) => ({
                    id: result.id, // Use the invoice item ID returned from the API response
                }));

            if (invoiceItems.length === cartItems.length) {
                try {
                    // Calculate total amount based on cart items and quantities
                    // to reduce amount of API calls
                    const totalAmount = cartItems.reduce(
                        (total, item) => total + item.price * item.cartQuantity,
                        0
                    );
                    const invoiceData = {
                        invoiceItems: invoiceItems,
                        totalAmount: totalAmount,
                    };

                    const response = await axios.post(
                        "/api/invoice/",
                        invoiceData
                    );

                    // Update product quantities in the state
                    setLocalProducts((prevProducts) =>
                        prevProducts.map((product) => {
                            const cartItem = cartItems.find(
                                (item) => item.id === product.id
                            );
                            if (cartItem) {
                                return {
                                    ...product,
                                    quantity:
                                        product.quantity -
                                        cartItem.cartQuantity, // Reduce product quantity
                                    inStock:
                                        product.quantity -
                                            cartItem.cartQuantity >
                                        0
                                            ? true
                                            : false, // Update inStock based on new quantity
                                };
                            }
                            return product;
                        })
                    );

                    // Clear cart if invoice is created successfully
                    if (response.status == 201) {
                        dispatch(clearCart());
                    }

                    return response.data;
                } catch (error) {
                    toast.error("Error creating invoice:" + error);
                    throw error;
                }
            } else {
                throw new Error(
                    "Mismatch between cart items and invoice items"
                );
            }
        };

        toast.promise(promise(), {
            loading: "Processing order...",
            success: "Order has been successfully processed",
            error: "Error processing order",
        });
    };

    const formatPhoneNumber = (phoneNumber: string): string | null => {
        // Remove any non-digit characters
        phoneNumber = phoneNumber.replace(/\D/g, "");

        // Define regex patterns for different formats
        const regex07 = /^07\d{8}$/;
        const regex2547 = /^2547\d{8}$/;
        const regexPlus2547 = /^\+2547\d{8}$/;

        if (regex07.test(phoneNumber)) {
            return phoneNumber.replace(/^07/, "2547");
        } else if (regex2547.test(phoneNumber)) {
            return phoneNumber;
        } else if (regexPlus2547.test(phoneNumber)) {
            return phoneNumber.replace(/^\+/, "");
        }

        return null;
    };

    const handleMpesaPrompt = async (event: React.FormEvent) => {
        event.preventDefault();
        const amount = parseFloat(
            cartItems
                .reduce(
                    (total, item) => total + item.price * item.cartQuantity,
                    0
                )
                .toFixed(2)
        );

        // If the input is visible, prompt the user for payment
        if (isInputVisible) {
            const formattedNumber = formatPhoneNumber(mpesaNumber);
            if (formattedNumber) {
                // Initiate payment logic here with mpesaNumber
                const promise = async () => {
                    try {
                        console.log({
                            phoneNumber: formattedNumber,
                            amount,
                            transactionType: "CustomerPayBillOnline",
                        });
                        const response = await axios.post(
                            "/api/safaricom/c2b/payment/lipa",
                            {
                                phoneNumber: formattedNumber,
                                amount: amount,
                                transactionType: "CustomerPayBillOnline",
                            }
                        );
                        return response.data;
                    } catch (error) {
                        throw Error("Failed to prompt user for payment");
                    }
                };

                toast.promise(promise(), {
                    loading: "Prompting user...",
                    success: "User prompted successfully",
                    error: "Error prompting user",
                });
            } else {
                toast.error("Invalid phone number");
            }
        } else {
            setIsInputVisible(true);
            setButtonText("Prompt User");
        }
    };

    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("/api/category");
                const categoriesData = mapCategories(response.data);
                setCategories((prevCategories) => {
                    const mergedCategories = [
                        ...prevCategories,
                        ...categoriesData,
                    ];

                    // Filter out duplicates based on the `id` property
                    const uniqueCategories = mergedCategories.filter(
                        (category, index, self) =>
                            index ===
                            self.findIndex((c) => c.id === category.id)
                    );

                    return uniqueCategories;
                });
            } catch (error) {
                // console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, [mapCategories]);

    useEffect(() => {
        // Filter products
        setLocalProducts(filteredProducts);
    }, [filteredProducts]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("/api/product");
                // Ensure productsData is an array
                if (!Array.isArray(response.data)) {
                    setLocalProducts([]);
                } else {
                    setLocalProducts(response.data);
                    dispatch(setProducts(response.data));
                }
            } catch (error) {
                // console.error("Error fetching products:", error);
            }
        };

        // Check if productsData is already available in the store
        if (productsData.length > 0) {
            setLocalProducts(productsData);
        } else {
            // Fetch products from the API
            fetchProducts();
        }
    }, [dispatch, productsData]);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Main Content */}
            <div
                className="flex-grow flex flex-col"
                style={{ width: "calc(100% - 10rem)" }}
            >
                <Navbar setFilteredProducts={setFilteredProducts}>
                    {/* Category buttons */}
                    <div className="flex overflow-auto gap-6 mt-4 scrollbar-hide">
                        {categories.map((category) => (
                            <CategoryBox
                                key={category.id}
                                id={category.id}
                                category={category.name}
                                icon={category.icon}
                                active={category.active}
                                onCategoryClick={toggleActiveCategory}
                            />
                        ))}
                    </div>

                    {/* Products */}
                    <div className="flex flex-wrap gap-4 mt-10">
                        {products.length === 0 && (
                            <div className="w-full m-auto mt-20 flex flex-col items-center justify-center">
                                <h1 className="text-2xl font-bold mb-6 text-black">
                                    No Products
                                </h1>
                                <Link href="/products/create">
                                    <button className="btn btn-sm btn-ghost text-black flex items-center bg-green-400 w-full">
                                        <PlusCircle className="w-4 h-4" />
                                        Add Product
                                    </button>
                                </Link>
                            </div>
                        )}
                        {products?.map((product) => (
                            <div key={product.name}>
                                {/* Product Card for PC */}
                                <div className="hidden lg:block">
                                    <ProductCard
                                        image={product.image}
                                        name={product.name}
                                        quantity={product.quantity}
                                        price={product.price}
                                        inStock={product.inStock}
                                        onAddToCart={() =>
                                            handleAddToCart(product)
                                        }
                                    />
                                </div>

                                {/* Mobile Product Card */}
                                <div className="block lg:hidden">
                                    <MobileProductCard
                                        image={product.image}
                                        name={product.name}
                                        quantity={product.quantity}
                                        price={product.price}
                                        inStock={product.inStock}
                                        onAddToCart={() =>
                                            handleAddToCart(product)
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Navbar>
            </div>
            {/* Right Sidebar */}
            <CreateOrder>
                <div className="p-2 mt-2 text-black rounded-lg flex items-center gap-4 cursor-pointer">
                    <SignedIn>
                        <CustomUserButton />
                    </SignedIn>
                </div>

                <div className="mt-14 px-4 flex flex-col justify-between h-[85%]">
                    <div>
                        <p className="font-bold text-2xl">Create Order</p>

                        {/* Order Items */}
                        <div className="mt-10 flex flex-col gap-4">
                            {cartItems.map((item) => (
                                <OrderCard key={item.id} product={item} />
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div>
                        {/* Dotted line */}
                        <div className="border-b-2 border-dotted border-gray-400 my-4"></div>

                        {/* Values */}
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-xl">Total: </p>
                            <p className="font-bold text-xl">
                                $
                                {cartItems
                                    .reduce(
                                        (total, item) =>
                                            total +
                                            item.price * item.cartQuantity,
                                        0
                                    )
                                    .toFixed(2)}
                            </p>
                        </div>
                        <form onSubmit={handleMpesaPrompt}>
                            {isInputVisible && (
                                <input
                                    type="number"
                                    className="mt-4 w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-200 border-2 no-spinner"
                                    placeholder="Enter M-pesa number"
                                    value={mpesaNumber}
                                    onChange={(e) =>
                                        setMpesaNumber(e.target.value)
                                    }
                                />
                            )}
                            <button
                                type="submit"
                                className="px-4 py-2 mt-4 border border-green-400 text-green-400 w-full bg-white rounded-md"
                            >
                                {buttonText}
                            </button>
                        </form>
                        <button
                            className="px-4 py-2 mt-4 bg-green-400 w-full text-white rounded-md"
                            onClick={handleOrder}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </CreateOrder>
        </div>
    );
}
