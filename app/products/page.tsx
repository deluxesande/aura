"use client";

import CategoryBox from "@/components/CategoryBox";
import CreateOrder from "@/components/CreateOrder";
import CustomerModal from "@/components/CustomerModal";
import MobileProductCard from "@/components/MobileProductCard";
import Navbar from "@/components/Navbar";
import NoProductsFound from "@/components/NoProducts";
import OrderCard from "@/components/OrderCard";
import ProductCard from "@/components/ProductCard";
import QuicKRestockModal from "@/components/QuickRestockModal";
import SelectCustomerModal from "@/components/SelectCustomerModal";
import { AppState } from "@/store";
import { addItem, clearCart } from "@/store/slices/cartSlice";
import { setProducts } from "@/store/slices/productSlice";
import {
    setCustomers,
    addCustomer as addCustomerToStore,
} from "@/store/slices/customerSlice";
import { setCategories as setCategoriesInStore } from "@/store/slices/categorySlice";
import { hide, show } from "@/store/slices/visibilitySlice";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import { Product, Customer, Category } from "@/utils/typesDefinitions";
import { SignedIn, useUser } from "@clerk/nextjs";
import { apiClient } from "@/utils/apiClient";
import {
    ChevronRight,
    Plus,
    ShoppingCart,
    User as UserIcon,
    ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import useSWR from "swr";
import { Search, Zap } from "lucide-react";

import { addTransaction } from "@/store/slices/activeTransactionsSlice";
import ActiveTransactionsTracker from "@/components/ActiveTransactionsTracker";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function Page() {
    const dispatch = useDispatch();
    const { user, isLoaded } = useUser();

    const cartItems = useSelector((state: AppState) => state.cart.items);
    const productsData = useSelector(
        (state: AppState) => state.product.products,
    );
    const customers = useSelector(
        (state: AppState) => state.customer.customers,
    );
    const reduxCategories = useSelector(
        (state: AppState) => state.category.categories,
    );

    // --- SWR DATA FETCHING ---
    const { data: swrProducts, mutate: mutateProducts, isLoading: isProductsLoading } = useSWR(
        "/product",
        fetcher,
        {
            revalidateOnFocus: false,
        },
    );
    const { data: swrCustomers } = useSWR("/customer", fetcher);
    const { data: swrCategories } = useSWR("/category", fetcher);

    useEffect(() => {
        if (swrProducts) dispatch(setProducts(swrProducts));
    }, [swrProducts, dispatch]);

    useEffect(() => {
        if (swrCustomers) dispatch(setCustomers(swrCustomers));
    }, [swrCustomers, dispatch]);

    useEffect(() => {
        if (swrCategories) dispatch(setCategoriesInStore(swrCategories));
    }, [swrCategories, dispatch]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isProductsLoading) {
            setLoading(false);
        }
    }, [isProductsLoading]);

    const categories = useMemo(() => {
        const base = [
            { name: "All", description: "All products", id: "ALL" } as Category,
        ];
        return [...base, ...reduxCategories];
    }, [reduxCategories]);

    const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState(""); // --- PRODUCT SEARCH ---
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [buttonText, setButtonText] = useState("Mpesa");
    const [mpesaNumber, setMpesaNumber] = useState("");
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [paymentType, setPaymentType] = useState("CASH");

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
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
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [productToRestock, setProductToRestock] = useState<Product | null>(
        null,
    );
    const [restockAmount, setRestockAmount] = useState("");
    const [isRestocking, setIsRestocking] = useState(false);

    // Folder Navigation State
    const [activeFolderTemplate, setActiveFolderTemplate] =
        useState<Product | null>(null);

    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [displayLimit, setDisplayLimit] = useState(20);

    const productsRef = useRef(productsData);
    productsRef.current = productsData;

    const business = useSelector(
        (state: AppState) => state.businessData.businessDetails,
    );

    const handleClose = useCallback(() => {
        dispatch(hide());
    }, [dispatch]);

    const toggleActiveCategory(category.id) = useCallback((categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setActiveFolderTemplate(null);
        setSearchQuery(""); // Clear search when switching categories
    }, []);

    // Optimized filtering combining Search + Category
    useEffect(() => {
        let result = productsData.filter((p) => p.type !== "VARIANT");

        if (selectedCategoryId !== "ALL") {
            result = result.filter((p) => p.categoryId === selectedCategoryId);
        }

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.sku?.toLowerCase().includes(query),
            );
        }

        setFilteredProducts(result);
    }, [productsData, selectedCategoryId, searchQuery]);

    const openRestockModal = useCallback((product: Product) => {
        setProductToRestock(product);
        setRestockAmount("");
        setIsRestockModalOpen(true);
    }, []);

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
            const newQuantity = (productToRestock.quantity || 0) + amountToAdd;
            const updatedProduct = {
                ...productToRestock,
                quantity: newQuantity,
                inStock: true,
            };

            await apiClient.put(
                `/product/${productToRestock.id}`,
                updatedProduct,
            );

            // Re-fetch via mutate for SWR consistency
            mutateProducts();

            toast.success(`${productToRestock.name} restocked!`);
            setIsRestockModalOpen(false);
        } catch (error) {
            toast.error("Failed to restock product");
        } finally {
            setIsRestocking(false);
        }
    };

    const handleAddToCart = useCallback(
        (product: Product, silent = false) => {
            if (product.type === "TEMPLATE") {
                setActiveFolderTemplate(product);
                return;
            }

            const cartItem = cartItems.find((item) => item.id === product.id);
            const currentCartQty = cartItem?.cartQuantity || 0;

            if (product.quantity > 0) {
                if (product.quantity > currentCartQty) {
                    dispatch(addItem(product));
                    if (!silent) toast.success(`Added ${product.name} to cart`);

                    if (
                        typeof window !== "undefined" &&
                        window.innerWidth >= 768
                    ) {
                        dispatch(show());
                    }
                } else {
                    toast.warning("Insufficient product quantity available.");
                }
            } else {
                toast.warning("Product cannot be added to the cart.");
            }
        },
        [cartItems, dispatch],
    );

    const handleOrder = async (
        paymentTypeOverride?: string,
        mpesaDetails?: any,
        isExpress = false,
        shouldHandleLoading = true,
    ) => {
        if (cartItems.length === 0) {
            toast.warning("Cart is empty.");
            return;
        }

        if (shouldHandleLoading) setIsProcessingOrder(true);

        try {
            const totalAmount = cartItems.reduce(
                (acc, item) => acc + item.price * item.cartQuantity,
                0,
            );

            const payload = {
                cartItems: cartItems.map((item) => ({
                    productId: item.id,
                    quantity: item.cartQuantity,
                    price: item.price * item.cartQuantity,
                })),
                totalAmount: totalAmount,
                paymentType: paymentTypeOverride || paymentType,
                mpesaDetails: mpesaDetails,
                customerId: selectedCustomer?.id || null,
                createdBy: user?.id,
            };

            const response = await apiClient.post(
                "/invoice/create-batch",
                payload,
            );

            if (response.status === 201) {
                dispatch(clearCart());
                setMpesaNumber("");
                setSelectedCustomer(null);
                setIsInputVisible(false);
                setButtonText("Mpesa");
                toast.success(
                    isExpress ? "Sale Logged!" : "Order Created Successfully!",
                );

                // Optimistically update stock in local SWR cache
                mutateProducts();

                return response.data;
            }
        } catch (e: any) {
            const errorMsg = e.response?.data?.error || "Error creating order";
            toast.error(errorMsg);
            console.error(e);
            return null;
        } finally {
            if (shouldHandleLoading) setIsProcessingOrder(false);
        }
    };

    const handleSelectCustomer = useCallback((customer: Customer) => {
        setSelectedCustomer(customer);
        setMpesaNumber(customer.phoneNumber);
        setIsInputVisible(true);
        setButtonText("Pay with M-Pesa");
        setShowSelectCustomerModal(false);
    }, []);

    const findCustomerByNumber = useCallback(
        (num: string) => {
            const formatted = formatPhoneNumber(num);
            if (!formatted) return undefined;
            return (swrCustomers || customers).find(
                (c: Customer) => formatPhoneNumber(c.phoneNumber) === formatted,
            );
        },
        [customers, swrCustomers],
    );

    const handleMpesaNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const val = e.target.value;
        setMpesaNumber(val);
        const matchedCustomer = findCustomerByNumber(val);
        setSelectedCustomer(matchedCustomer || null);
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

        try {
            const promise = async () => {
                const res = await apiClient.post("/customer", {
                    firstName: newCustomerDetails.firstName,
                    lastName: newCustomerDetails.lastName,
                    phoneNumber: formatted,
                    email: newCustomerDetails.email || null,
                });

                if (res.status === 201 || res.status === 200) {
                    dispatch(addCustomerToStore(res.data));
                    handleSelectCustomer(res.data);
                    setShowAddCustomerModal(false);
                    setShowSelectCustomerModal(false);
                    setNewCustomerDetails({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phoneNumber: "",
                    });
                    toast.success("Customer saved");
                }
            };

            toast.promise(promise(), {
                loading: "Saving Customer...",
                success: "Customer saved",
                error: (e) => {
                    return e.response?.data?.error || "Failed to save customer";
                },
            });
        } catch (e: any) {
            const backendError =
                e.response?.data?.error || "Failed to save customer";

            toast.error(backendError);
        }
    };

    const handleMpesaPrompt = async (event: React.FormEvent) => {
        event.preventDefault();

        const isMpesaConfigured =
            business?.mpesaShortCode &&
            business?.mpesaConsumerKey === "***********";

        if (!isMpesaConfigured) {
            toast.error(
                "M-Pesa payments are not configured for this business.",
            );
            return;
        }

        const amount = parseFloat(
            cartItems
                .reduce((t, i) => t + i.price * i.cartQuantity, 0)
                .toFixed(2),
        );

        if (!isInputVisible) {
            setIsInputVisible(true);
            setButtonText("Prompt M-Pesa");
            return;
        }

        const formattedNumber = formatPhoneNumber(mpesaNumber);
        if (!formattedNumber) {
            toast.error("Invalid phone number");
            return;
        }

        setIsProcessingOrder(true);
        try {
            // "Pay & Next" - Handle order creation first
            const invoice = await handleOrder("MPESA", null, false, false);

            if (invoice?.id) {
                // Add to background tracker
                dispatch(
                    addTransaction({
                        invoiceId: invoice.id,
                        customerName: selectedCustomer
                            ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                            : "Guest Customer",
                        amount: amount,
                        status: "PENDING",
                        phoneNumber: formattedNumber,
                        createdAt: Date.now(),
                    }),
                );

                // Background STK Push
                apiClient
                    .post("/safaricom/c2b/payment/lipa", {
                        phoneNumber: formattedNumber,
                        amount: amount,
                        transactionType: "CustomerPayBillOnline",
                        invoiceId: invoice.id,
                    })
                    .then(() => {
                        toast.success(`STK Push sent to ${formattedNumber}`);
                    })
                    .catch((err) => {
                        toast.error(
                            `STK Push failed for invoice ${invoice.id}`,
                        );
                    });

                // Clear UI immediately to serve next customer
                dispatch(clearCart());
                setMpesaNumber("");
                setSelectedCustomer(null);
                setIsInputVisible(false);
                setButtonText("Mpesa");
            }
        } catch (error: any) {
            const message =
                error.response?.data?.error || "Payment initiation failed";
            toast.error(message);
        } finally {
            setIsProcessingOrder(false);
        }
    };

    useEffect(() => {
        let buffer = "";
        let lastKeyTime = Date.now();

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
                return;

            const currentTime = Date.now();
            if (currentTime - lastKeyTime > 100) buffer = "";
            lastKeyTime = currentTime;

            if (e.key === "Enter") {
                if (buffer.length > 2) {
                    e.preventDefault();

                    const scannedProduct = productsRef.current.find((p) => {
                        if (p.type === "TEMPLATE" && p.variants) {
                            const variantMatch = p.variants.find(
                                (v) =>
                                    v.sku === buffer ||
                                    v.sku?.toUpperCase() ===
                                        buffer.toUpperCase(),
                            );
                            if (variantMatch) return true;
                        }
                        return (
                            p.sku === buffer ||
                            p.sku?.toUpperCase() === buffer.toUpperCase()
                        );
                    });

                    let productToAdd = scannedProduct;

                    if (
                        scannedProduct?.type === "TEMPLATE" &&
                        scannedProduct.variants
                    ) {
                        productToAdd =
                            scannedProduct.variants.find(
                                (v) =>
                                    v.sku === buffer ||
                                    v.sku?.toUpperCase() ===
                                        buffer.toUpperCase(),
                            ) || scannedProduct;
                    }

                    if (productToAdd && productToAdd.type !== "TEMPLATE") {
                        // Silent add for scanner speed
                        handleAddToCart(productToAdd, true);
                        toast.success(`Scanned: ${productToAdd.name}`, {
                            duration: 1000,
                        });

                        if (window.innerWidth >= 768) {
                            dispatch(show());
                        }
                    } else if (
                        productToAdd &&
                        productToAdd.type === "TEMPLATE"
                    ) {
                        setActiveFolderTemplate(productToAdd);
                    } else {
                        toast.error(`Product not found: ${buffer}`);
                    }
                    buffer = "";
                }
            } else if (e.key.length === 1) {
                buffer += e.key;
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [dispatch, handleAddToCart]);

    const profileImage = user?.hasImage ? user?.imageUrl : "/images/user.png";
    const cartTotal = useMemo(
        () =>
            cartItems
                .reduce((acc, item) => acc + item.price * item.cartQuantity, 0)
                .toFixed(2),
        [cartItems],
    );

    const reduxUser = useSelector((state: AppState) => state.auth.user);

    useEffect(() => {
        if (!isLoaded || !user) return;
        if (user.unsafeMetadata?.hasSeenTour === true) return;

        const businessName = reduxUser?.Business?.name;
        if (!businessName || businessName === "My New Business") return;

        dispatch(show());
    }, [isLoaded, user, reduxUser, dispatch]);

    // Determine what to display in the main grid
    const allDisplayItems = activeFolderTemplate
        ? activeFolderTemplate.variants || []
        : filteredProducts;

    const displayItems = allDisplayItems.slice(0, displayLimit);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Main Content */}
            <div
                className="flex-grow flex flex-col"
                style={{ width: "calc(100% - 10rem)" }}
            >
                <Navbar
                    setFilteredProducts={setFilteredProducts}
                    onSearchQueryChange={setSearchQuery}
                >
                    {/* --- OPTIMIZED DISCOVERY HEADER --- */}
                    <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
                        {!activeFolderTemplate && (
                            <div className="flex overflow-auto gap-3 scrollbar-hide w-full">
                                {categories.map((category) => (
                                    <CategoryBox
                                        key={category.id}
                                        id={category.id}
                                        category={category.name}
                                        active={
                                            selectedCategoryId === category.id
                                        }
                                        onCategoryClick={() => toggleActiveCategory(category.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {activeFolderTemplate && (
                        <div className="flex items-center gap-4 mt-4 bg-white p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={() => setActiveFolderTemplate(null)}
                                className="p-2 bg-white rounded-lg shadow-sm hover:bg-green-100 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {activeFolderTemplate.name}
                                </h2>
                                <p className="text-xs font-medium">
                                    Select options to add to cart
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 mt-6 content-start overflow-y-auto flex-1">
                        {loading ? (
                            <div className="w-full m-auto mt-20 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            </div>
                        ) : displayItems.length === 0 ? (
                            <NoProductsFound />
                        ) : (
                            displayItems.map((product: any) => {
                                const displayName =
                                    product.type === "VARIANT" &&
                                    product.attributeValues
                                        ? `${product.name} - ${product.attributeValues.map((av: any) => av.attributeOption.value).join(" / ")}`
                                        : product.name;

                                return (
                                    <div
                                        key={product.id}
                                        className="relative group"
                                    >
                                        <div className="hidden lg:block">
                                            <ProductCard
                                                image={product.image}
                                                name={displayName}
                                                quantity={product.quantity}
                                                price={product.price}
                                                inStock={product.inStock}
                                                type={product.type}
                                                variants={product.variants}
                                                onAddToCart={() =>
                                                    handleAddToCart(product)
                                                }
                                            />
                                        </div>
                                        <div className="block lg:hidden">
                                            <MobileProductCard
                                                image={product.image}
                                                name={displayName}
                                                quantity={product.quantity}
                                                price={product.price}
                                                inStock={product.inStock}
                                                type={product.type}
                                                variants={product.variants}
                                                onAddToCart={() =>
                                                    handleAddToCart(product)
                                                }
                                            />
                                        </div>

                                        {product.type === "TEMPLATE" && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
                                                Variants
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openRestockModal(product);
                                            }}
                                            className={`${
                                                product.quantity <= 5 &&
                                                product.type !== "TEMPLATE"
                                                    ? "flex"
                                                    : "hidden"
                                            } absolute top-1 right-1 md:top-2 md:right-2 items-center justify-center bg-white/95 backdrop-blur-sm p-1.5 md:p-2 rounded-full shadow-sm border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all z-10`}
                                            title="Quick Restock (Low Stock)"
                                        >
                                            <Plus
                                                size={14}
                                                className="md:w-4 md:h-4"
                                            />
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(product);
                                            }}
                                            className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-green-100 hover:text-green-500 text-gray-400 transition-all border border-gray-100 z-10"
                                            title={
                                                product.type === "TEMPLATE"
                                                    ? "View Options"
                                                    : "Add to Cart"
                                            }
                                        >
                                            {product.type === "TEMPLATE" ? (
                                                <Plus size={16} />
                                            ) : (
                                                <ShoppingCart size={16} />
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {/* --- LOAD MORE BUTTON --- */}
                    {!loading && allDisplayItems.length > displayLimit && (
                        <div className="py-8 flex justify-center w-full">
                            <button
                                onClick={() =>
                                    setDisplayLimit((prev) => prev + 20)
                                }
                                className="px-8 py-3 bg-white border-2 border-green-500 text-green-500 font-bold rounded-xl hover:bg-green-50 transition-all active:scale-95 shadow-sm"
                            >
                                Load More Products
                            </button>
                        </div>
                    )}
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
                                        alt="Profile"
                                        className="object-cover"
                                    />
                                </div>
                                <p className="text-sm font-medium whitespace-nowrap ml-2">
                                    {user?.firstName} {user?.lastName}
                                </p>
                            </Link>
                        </SignedIn>
                    </div>

                    <div className="px-4 mt-6 flex items-center justify-between">
                        <p className="font-bold text-2xl">Cart</p>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg font-bold">
                            {cartItems.reduce((a, b) => a + b.cartQuantity, 0)}{" "}
                            Items
                        </span>
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
                            <p className="font-bold text-xl text-green-500">
                                Ksh {cartTotal}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setShowSelectCustomerModal(true);
                                if (
                                    typeof window !== "undefined" &&
                                    window.innerWidth < 1020
                                )
                                    handleClose();
                            }}
                            className="w-full mb-3 flex items-center justify-between p-3 border border-gray-100 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-full ${
                                        selectedCustomer
                                            ? "bg-green-100 text-green-500"
                                            : "bg-white text-gray-400"
                                    }`}
                                >
                                    <UserIcon
                                        size={18}
                                        className={
                                            selectedCustomer
                                                ? "stroke-green-500"
                                                : "stroke-gray-400"
                                        }
                                    />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-gray-500 font-medium">
                                        Customer
                                    </p>
                                    <p className="font-bold text-sm text-gray-700">
                                        {selectedCustomer
                                            ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                                            : "Guest Customer"}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </button>

                        <form onSubmit={handleMpesaPrompt}>
                            {isInputVisible && (
                                <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 rounded-lg outline-none bg-gray-50 focus:ring-2 focus:ring-green-500/20 focus:bg-white border border-gray-200 no-spinner transition-all font-medium"
                                        placeholder="Enter M-pesa number"
                                        value={mpesaNumber}
                                        onChange={handleMpesaNumberChange}
                                        disabled={isProcessingOrder}
                                    />
                                    {!selectedCustomer &&
                                        mpesaNumber.length >= 10 &&
                                        !findCustomerByNumber(mpesaNumber) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewCustomerDetails(
                                                        (prev) => ({
                                                            ...prev,
                                                            phoneNumber:
                                                                mpesaNumber,
                                                        }),
                                                    );
                                                    setShowAddCustomerModal(
                                                        true,
                                                    );
                                                    if (
                                                        typeof window !==
                                                            "undefined" &&
                                                        window.innerWidth < 1020
                                                    )
                                                        handleClose();
                                                }}
                                                className="mt-2 text-[10px] text-green-500 font-bold uppercase tracking-tight flex items-center gap-1 hover:underline"
                                            >
                                                Add as new customer?
                                            </button>
                                        )}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={
                                    isProcessingOrder || cartItems.length === 0
                                }
                                className={`px-4 py-3 border border-green-500 text-green-500 w-full bg-white rounded-lg hover:bg-green-50 transition-all ${isProcessingOrder ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {buttonText}
                            </button>
                        </form>

                        <button
                            disabled={
                                isProcessingOrder || cartItems.length === 0
                            }
                            className={`px-4 py-3 mt-3 bg-green-500 w-full text-white rounded-lg hover:bg-green-600 transition-all ${
                                isProcessingOrder
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                            }`}
                            onClick={() =>
                                handleOrder("CASH", null, !selectedCustomer)
                            }
                        >
                            Checkout (Cash)
                        </button>
                    </div>
                </div>
            </CreateOrder>

            {/* Conditional Modals */}
            {showSelectCustomerModal && (
                <SelectCustomerModal
                    setShowSelectCustomerModal={setShowSelectCustomerModal}
                    customers={swrCustomers || customers}
                    customerSearchQuery={customerSearchQuery}
                    setCustomerSearchQuery={setCustomerSearchQuery}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    handleSelectCustomer={handleSelectCustomer}
                    handleGuestCheckout={() => {
                        setSelectedCustomer(null);
                        setMpesaNumber("");
                        setIsInputVisible(false);
                        setButtonText("Mpesa");
                        setShowSelectCustomerModal(false);
                    }}
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

            <ActiveTransactionsTracker />
        </div>
    );
}
