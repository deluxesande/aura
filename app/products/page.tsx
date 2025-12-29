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
import { SignedIn, useUser } from "@clerk/nextjs";
import axios from "axios";
import {
    Book,
    Briefcase,
    FileText,
    Package,
    Pencil,
    PlusCircle,
    ShoppingCart,
    Store,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Image from "next/image";
import NoProductsFound from "@/components/NoProducts";

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
    const [loading, setLoading] = useState(true);
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
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [paymentType, setPaymentType] = useState("CASH");
    const { user } = useUser();
    const profileImage = user?.hasImage
        ? user?.imageUrl
        : "https://www.svgrepo.com/show/535711/user.svg";
    const hasFetched = useRef(false);

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
                // Show cart sidebar
                // dispatch(show());
            } else {
                toast.warning("Insufficient product quantity available.");
            }
        } else {
            toast.warning("Product cannot be added to the cart.");
        }
    };

    const handleOrder = async (
        paymentTypeOverride?: string,
        mpesaDetails?: any
    ) => {
        if (cartItems.length === 0) {
            toast.warning("Cart is empty. No order to process.");
            return;
        }

        setIsProcessingOrder(true);

        const promise = async () => {
            try {
                // Step 1: Create Invoice Items one by one
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

                // Filter out failed items
                const createdInvoiceItems = results
                    .filter((result) => result !== null)
                    .map((result) => ({ id: result.id }));

                if (createdInvoiceItems.length === cartItems.length) {
                    // Step 2: Create the Invoice
                    const totalAmount = cartItems.reduce(
                        (total, item) => total + item.price * item.cartQuantity,
                        0
                    );

                    const invoiceData = {
                        invoiceItems: createdInvoiceItems,
                        totalAmount: totalAmount,
                        paymentType: paymentTypeOverride || paymentType,
                        // Pass M-Pesa details if they exist (will be undefined for CASH)
                        mpesaDetails: mpesaDetails,
                    };

                    const response = await axios.post(
                        "/api/invoice/",
                        invoiceData
                    );

                    // Step 3: Clear Cart on Success
                    if (response.status === 201) {
                        dispatch(clearCart());
                    }

                    return response.data;
                } else {
                    throw new Error(
                        "Failed to create some invoice items. Please try again."
                    );
                }
            } finally {
                setIsProcessingOrder(false);
            }
        };

        toast.promise(promise(), {
            loading: "Processing order...",
            success: "Order Successful!",
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

        // Calculate amount again for safety
        const amount = parseFloat(
            cartItems
                .reduce(
                    (total, item) => total + item.price * item.cartQuantity,
                    0
                )
                .toFixed(2)
        );

        if (isInputVisible) {
            const formattedNumber = formatPhoneNumber(mpesaNumber);

            if (formattedNumber) {
                setIsProcessingOrder(true);

                const promise = async () => {
                    try {
                        // Step A: Trigger STK Push
                        const response = await axios.post(
                            "/api/safaricom/c2b/payment/lipa",
                            {
                                phoneNumber: formattedNumber,
                                amount: amount,
                                transactionType: "CustomerPayBillOnline",
                            }
                        );

                        if (response.status === 200) {
                            setPaymentType("MPESA");

                            // Step B: Capture the identifiers
                            const mpesaDetails = {
                                checkoutRequestId:
                                    response.data.data.CheckoutRequestID,
                                merchantRequestId:
                                    response.data.data.MerchantRequestID,
                                phoneNumber: formattedNumber,
                            };

                            // Step C: Create the Order immediately, passing the M-Pesa link
                            await handleOrder("MPESA", mpesaDetails);

                            return "Payment Request Sent";
                        }
                    } catch (error) {
                        throw Error("Failed to send payment request");
                    } finally {
                        setIsProcessingOrder(false);
                    }
                };

                toast.promise(promise(), {
                    loading: "Sending M-Pesa prompt...",
                    success: (msg) => msg || "Prompt Sent",
                    error: "Error sending prompt",
                });
            } else {
                toast.error("Invalid phone number format");
            }
        } else {
            setIsInputVisible(true);
            setButtonText("Pay with M-Pesa");
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
            setLoading(true);
            try {
                const response = await axios.get("/api/product");
                // Ensure productsData is an array
                if (Array.isArray(response.data)) {
                    setLocalProducts(response.data);
                    dispatch(setProducts(response.data));
                } else {
                    setLocalProducts([]);
                }
            } catch (error) {
                // console.error("Error fetching products:", error);
                setLocalProducts([]);
            } finally {
                setLoading(false);
                hasFetched.current = true;
            }
        };

        // Check if productsData is already available in the store
        if (productsData.length > 0) {
            setLocalProducts(productsData);
            setLoading(false);
        } else if (!hasFetched.current) {
            fetchProducts();
        } else {
            setLoading(false);
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
                        {loading ? (
                            <div className="w-full m-auto mt-20 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <NoProductsFound />
                        ) : (
                            Array.isArray(products) &&
                            products.map((product) => (
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
                            ))
                        )}
                    </div>
                </Navbar>
            </div>
            {/* Right Sidebar */}
            <CreateOrder>
                <div className="p-2 mt-2 text-black rounded-lg flex items-center gap-4 cursor-pointer">
                    <SignedIn>
                        <Link
                            className="w-full flex items-center space-x-2"
                            href="/profile"
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                                <Image
                                    src={profileImage}
                                    width={40}
                                    height={40}
                                    alt={`${user?.firstName} Profile Image`}
                                    className="object-cover"
                                />
                            </div>
                            <p className="text-sm font-medium whitespace-nowrap ml-2">
                                {user?.firstName} {user?.lastName}
                            </p>
                        </Link>
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
                                    disabled={isProcessingOrder}
                                />
                            )}
                            <button
                                type="submit"
                                disabled={isProcessingOrder}
                                // disabled={true}
                                className="px-4 py-2 mt-4 border border-green-400 text-green-400 w-full bg-white rounded-md"
                            >
                                {buttonText}
                            </button>
                        </form>
                        <button
                            disabled={isProcessingOrder}
                            className={`px-4 py-2 mt-4 bg-green-400 w-full text-white rounded-md ${
                                isProcessingOrder
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                            }`}
                            onClick={() => handleOrder()}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            </CreateOrder>
        </div>
    );
}
