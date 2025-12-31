"use client";

import CategoryBox from "@/components/CategoryBox";
import CreateOrder from "@/components/CreateOrder";
import CustomerModal from "@/components/CustomerModal";
import MobileProductCard from "@/components/MobileProductCard";
import Navbar from "@/components/Navbar";
import NoProductsFound from "@/components/NoProducts";
import OrderCard from "@/components/OrderCard";
import ProductCard from "@/components/ProductCard";
import SelectCustomerModal from "@/components/SelectCustomerModal";
import { AppState } from "@/store";
import { addItem, clearCart } from "@/store/slices/cartSlice";
import { setProducts } from "@/store/slices/productSlice";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import { Product } from "@/utils/typesDefinitions";
import { SignedIn, useUser } from "@clerk/nextjs";
import axios from "axios";
import {
    ChevronRight,
    User as UserIcon,
    Plus,
    X,
    Loader2,
    ShoppingCart,
} from "lucide-react"; // Added Icons
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { hide } from "@/store/slices/visibilitySlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import QuicKRestockModal from "@/components/QuickRestockModal";

interface Category {
    id: string;
    name: string;
    description?: string;
    active?: boolean;
}

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
}

export default function Page() {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: AppState) => state.cart.items);
    const [products, setLocalProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([
        {
            name: "All",
            description: "All products",
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
    const profileImage = user?.hasImage ? user?.imageUrl : "/images/user.png";

    const hasFetched = useRef(false);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null
    );

    const [showSelectCustomerModal, setShowSelectCustomerModal] =
        useState(false);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");

    const [newCustomerDetails, setNewCustomerDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    });

    // --- Restock Modal State ---
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [productToRestock, setProductToRestock] = useState<Product | null>(
        null
    );
    const [restockAmount, setRestockAmount] = useState("");
    const [isRestocking, setIsRestocking] = useState(false);

    const mapCategories = React.useCallback((apiData: any[]): Category[] => {
        return apiData.map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description || "",
            active: false,
        }));
    }, []);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    const toggleActiveCategory = (categoryId: string) => {
        setCategories((prevCategories) =>
            prevCategories.map((category) => ({
                ...category,
                active: category.id === categoryId,
            }))
        );
    };

    const handleClose = () => {
        dispatch(hide());
    };

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get("/api/customer");
                setCustomers(response.data);
            } catch (error) {
                console.error("Error fetching customers", error);
            }
        };
        fetchCustomers();
    }, []);

    useEffect(() => {
        setFilteredProducts(() => {
            const activeCategory = categories.find(
                (category) => category.active
            );
            if (activeCategory?.name === "All") {
                return productsData;
            }
            return productsData.filter(
                (product) => product.categoryId === activeCategory?.id
            );
        });
    }, [categories, productsData]);

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
        setLocalProducts(filteredProducts);
    }, [filteredProducts]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/api/product");
                if (Array.isArray(response.data)) {
                    setLocalProducts(response.data);
                    dispatch(setProducts(response.data));
                } else {
                    setLocalProducts([]);
                }
            } catch (error) {
                setLocalProducts([]);
            } finally {
                setLoading(false);
                hasFetched.current = true;
            }
        };

        if (productsData.length > 0) {
            setLocalProducts(productsData);
            setLoading(false);
        } else if (!hasFetched.current) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [dispatch, productsData]);

    const openRestockModal = (product: Product) => {
        setProductToRestock(product);
        setRestockAmount("");
        setIsRestockModalOpen(true);
    };

    const handleQuickRestockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productToRestock) return;

        const amountToAdd = parseInt(restockAmount, 10);
        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        setIsRestocking(true);
        try {
            // Calculate new total
            const newQuantity = (productToRestock.quantity || 0) + amountToAdd;
            const updatedProduct = {
                ...productToRestock,
                quantity: newQuantity,
                inStock: true,
            };

            // Call API
            await axios.put(
                `/api/product/${productToRestock.id}`,
                updatedProduct
            );

            // Update Redux Store
            const updatedProductsList = productsData.map((p) =>
                p.id === productToRestock.id ? updatedProduct : p
            );
            dispatch(setProducts(updatedProductsList));

            // Update Local State (if needed, though redux sync usually handles this via useEffect)
            setLocalProducts((prev) =>
                prev.map((p) =>
                    p.id === productToRestock.id ? updatedProduct : p
                )
            );

            toast.success(
                `${productToRestock.name} restocked! New Qty: ${newQuantity}`
            );
            setIsRestockModalOpen(false);
        } catch (error) {
            toast.error("Failed to restock product");
        } finally {
            setIsRestocking(false);
        }
    };

    const handleAddToCart = (product: Product) => {
        const cartItem = cartItems.find((item) => item.id === product.id);
        if (product.quantity > 0) {
            if (
                product.quantity &&
                product.quantity > (cartItem?.cartQuantity || 0)
            ) {
                dispatch(addItem(product));
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

        const orderLogic = async () => {
            try {
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

                const createdInvoiceItems = results
                    .filter((result) => result !== null)
                    .map((result) => ({ id: result.id }));

                if (createdInvoiceItems.length === cartItems.length) {
                    const totalAmount = cartItems.reduce(
                        (total, item) => total + item.price * item.cartQuantity,
                        0
                    );

                    const invoiceData = {
                        invoiceItems: createdInvoiceItems,
                        totalAmount: totalAmount,
                        paymentType: paymentTypeOverride || paymentType,
                        mpesaDetails: mpesaDetails,
                        customerId: selectedCustomer?.id || null,
                    };

                    const response = await axios.post(
                        "/api/invoice/",
                        invoiceData
                    );

                    if (response.status === 201) {
                        dispatch(clearCart());
                        setMpesaNumber("");
                        setSelectedCustomer(null);
                        setIsInputVisible(false);
                        setButtonText("Mpesa");
                    }

                    return response.data;
                } else {
                    throw new Error("Failed to create some invoice items.");
                }
            } finally {
                // If this is NOT the first step of an M-Pesa flow (i.e. it is Cash or final step), turn off loading
                // If paymentTypeOverride is "MPESA" AND mpesaDetails is null, it means we are just starting the flow -> Keep Loading on
                // Otherwise -> Turn Loading off
                const isStartingMpesaFlow =
                    paymentTypeOverride === "MPESA" && !mpesaDetails;

                if (!isStartingMpesaFlow) {
                    setIsProcessingOrder(false);
                }
            }
        };

        const orderPromise = orderLogic();

        toast.promise(orderPromise, {
            loading: "Creating Order...",
            success: "Order Created Successfully!",
            error: "Error creating order",
        });

        return await orderPromise;
    };

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setMpesaNumber(customer.phoneNumber);
        setIsInputVisible(true);
        setButtonText("Pay with M-Pesa");
        setShowSelectCustomerModal(false);
    };

    const handleGuestCheckout = () => {
        setSelectedCustomer(null);
        setMpesaNumber("");
        setIsInputVisible(false);
        setButtonText("Mpesa");
        setShowSelectCustomerModal(false);
    };

    const findCustomerByNumber = (num: string) => {
        const formatted = formatPhoneNumber(num);
        if (!formatted) return undefined;
        return customers.find(
            (c) => formatPhoneNumber(c.phoneNumber) === formatted
        );
    };

    const handleMpesaNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const val = e.target.value;
        setMpesaNumber(val);

        const matchedCustomer = findCustomerByNumber(val);

        if (matchedCustomer) {
            setSelectedCustomer(matchedCustomer);
        } else {
            setSelectedCustomer(null);
        }
    };

    const handleSaveNewCustomer = async () => {
        if (!newCustomerDetails.firstName || !newCustomerDetails.lastName) {
            toast.warning("Name fields are required.");
            return;
        }

        const formatted = formatPhoneNumber(newCustomerDetails.phoneNumber);
        if (!formatted) {
            toast.error("Invalid Phone Number");
            return;
        }

        const emailToSave =
            newCustomerDetails.email.trim() === ""
                ? null
                : newCustomerDetails.email;

        try {
            const promise = async () => {
                const res = await axios.post("/api/customer", {
                    firstName: newCustomerDetails.firstName,
                    lastName: newCustomerDetails.lastName,
                    phoneNumber: formatted,
                    email: emailToSave,
                });

                if (res.status === 201 || res.status === 200) {
                    setCustomers((prev) => [...prev, res.data]);

                    handleSelectCustomer(res.data);

                    setShowAddCustomerModal(false);
                    setShowSelectCustomerModal(false);

                    setNewCustomerDetails({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phoneNumber: "",
                    });
                }
            };

            await toast.promise(promise(), {
                loading: "Saving customer...",
                success: "Customer saved successfully",
                error: "Failed to save customer",
            });
        } catch (e) {
            toast.error("Failed to save customer");
        }
    };

    const handlePromptAddCustomer = () => {
        setNewCustomerDetails((prev) => ({
            ...prev,
            phoneNumber: mpesaNumber,
        }));
        setShowAddCustomerModal(true);
        if (typeof window !== "undefined" && window.innerWidth < 1020) {
            handleClose();
        }
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

        if (isInputVisible) {
            const formattedNumber = formatPhoneNumber(mpesaNumber);

            if (formattedNumber) {
                setIsProcessingOrder(true);
                try {
                    // STEP 1: Create Invoice First (Status: PENDING)
                    // We pass "MPESA" as type, but no details yet.
                    const invoice = await handleOrder("MPESA");

                    if (invoice && invoice.id) {
                        // STEP 2: Trigger STK Push with the Invoice ID
                        const stkPromise = async () => {
                            const response = await axios.post(
                                "/api/safaricom/c2b/payment/lipa",
                                {
                                    phoneNumber: formattedNumber,
                                    amount: amount,
                                    transactionType: "CustomerPayBillOnline",
                                    invoiceId: invoice.id,
                                }
                            );

                            if (response.status === 200) {
                                setPaymentType("MPESA");
                                return "Payment Request Sent";
                            }
                        };

                        await toast.promise(stkPromise(), {
                            loading: "Sending M-Pesa prompt...",
                            success: "Prompt Sent! Check your phone.",
                            error: "Failed to send prompt",
                        });
                    }
                } catch (error) {
                    console.error("Mpesa Flow Error:", error);
                    // No need for extra toast here, handleOrder or stkPromise handles it
                } finally {
                    setIsProcessingOrder(false);
                }
            } else {
                toast.error("Invalid phone number format");
            }
        } else {
            setIsInputVisible(true);
            setButtonText("Prompt M-Pesa");
        }
    };

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
                                <div
                                    key={product.id}
                                    className="relative group"
                                >
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

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openRestockModal(product);
                                        }}
                                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-green-100 hover:text-green-600 text-gray-400 transition-all border border-gray-100 z-10"
                                        title="Quick Restock"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                        className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-green-100 hover:text-green-600 text-gray-400 transition-all border border-gray-100 z-10"
                                        title="Add to Cart"
                                    >
                                        <ShoppingCart size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </Navbar>
            </div>

            <CreateOrder>
                <div className="flex flex-col h-full">
                    <div className="p-2 mt-2 text-black rounded-lg flex items-center gap-4 cursor-pointer flex-shrink-0">
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

                    <div className="px-4 mt-6">
                        <p className="font-bold text-2xl">Create Order</p>
                    </div>

                    <div className="mt-4 flex-grow overflow-y-auto px-4 pb-4">
                        <div className="flex flex-col gap-4">
                            {cartItems.map((item) => (
                                <OrderCard key={item.id} product={item} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto bg-white p-4 border-t border-gray-100 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-4">
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

                        {/* Customer Trigger Button */}
                        <button
                            onClick={() => {
                                setShowSelectCustomerModal(true);
                                // Only close if screen width is less than 768px (Mobile/Tablet)
                                if (
                                    typeof window !== "undefined" &&
                                    window.innerWidth < 1020
                                ) {
                                    handleClose();
                                }
                            }}
                            className="w-full mb-3 flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-full ${
                                        selectedCustomer
                                            ? "bg-green-100 text-green-600"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    <UserIcon size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-gray-500">
                                        Customer
                                    </p>
                                    <p className="font-medium text-sm">
                                        {selectedCustomer
                                            ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                                            : "Guest Customer"}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </button>

                        {/* Payment Forms */}
                        <form onSubmit={handleMpesaPrompt}>
                            {isInputVisible && (
                                <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-200 border-2 no-spinner"
                                        placeholder="Enter M-pesa number"
                                        value={mpesaNumber}
                                        onChange={handleMpesaNumberChange}
                                        disabled={isProcessingOrder}
                                    />

                                    {/* --- ADD NEW CUSTOMER PROMPT --- */}
                                    {!selectedCustomer &&
                                        mpesaNumber.length >= 10 &&
                                        !findCustomerByNumber(mpesaNumber) && (
                                            <button
                                                type="button"
                                                onClick={
                                                    handlePromptAddCustomer
                                                }
                                                className="mt-2 text-xs text-green-500 font-medium flex items-center gap-1 hover:underline hover:text-green-700 transition-colors"
                                            >
                                                Add this number as new customer?
                                            </button>
                                        )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isProcessingOrder}
                                className="px-4 py-2 border border-green-400 text-green-400 w-full bg-white rounded-md hover:bg-green-50 transition-colors"
                            >
                                {buttonText}
                            </button>
                        </form>

                        <button
                            disabled={isProcessingOrder}
                            className={`px-4 py-2 mt-3 bg-green-400 w-full text-white rounded-md ${
                                isProcessingOrder
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer hover:bg-green-200 transition-colors"
                            }`}
                            onClick={() => handleOrder()}
                        >
                            Checkout (Cash)
                        </button>
                    </div>
                </div>
            </CreateOrder>

            {showSelectCustomerModal && (
                <SelectCustomerModal
                    setShowSelectCustomerModal={setShowSelectCustomerModal}
                    customers={customers}
                    customerSearchQuery={customerSearchQuery}
                    setCustomerSearchQuery={setCustomerSearchQuery}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    handleSelectCustomer={handleSelectCustomer}
                    handleGuestCheckout={handleGuestCheckout}
                    showAddCustomerModal={showAddCustomerModal}
                    setShowAddCustomerModal={setShowAddCustomerModal}
                />
            )}

            {showAddCustomerModal && (
                <CustomerModal
                    showAddCustomerModal={showAddCustomerModal}
                    setShowAddCustomerModal={setShowAddCustomerModal}
                    newCustomerDetails={newCustomerDetails}
                    setNewCustomerDetails={setNewCustomerDetails}
                    handleSaveNewCustomer={handleSaveNewCustomer}
                />
            )}

            {/* --- RESTOCK MODAL --- */}
            {isRestockModalOpen && productToRestock && (
                <QuicKRestockModal
                    productToRestock={productToRestock}
                    setIsRestockModalOpen={setIsRestockModalOpen}
                    restockAmount={restockAmount}
                    setRestockAmount={setRestockAmount}
                    handleQuickRestockSubmit={handleQuickRestockSubmit}
                    isRestocking={isRestocking}
                />
            )}
        </div>
    );
}
