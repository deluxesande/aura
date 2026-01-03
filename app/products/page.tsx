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
import { hide } from "@/store/slices/visibilitySlice";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import { Product } from "@/utils/typesDefinitions";
import { SignedIn, useUser } from "@clerk/nextjs";
import axios from "axios";
import {
    ChevronRight,
    Plus,
    ShoppingCart,
    User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface Category {
    id: string;
    name: string;
    description?: string;
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
    const { user } = useUser();

    const cartItems = useSelector((state: AppState) => state.cart.items);
    const productsData = useSelector(
        (state: AppState) => state.product.products
    );
    const [loading, setLoading] = useState(productsData.length === 0);

    const [categories, setCategories] = useState<Category[]>([
        { name: "All", description: "All products", id: "ALL" },
    ]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [buttonText, setButtonText] = useState("Mpesa");
    const [mpesaNumber, setMpesaNumber] = useState("");
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [paymentType, setPaymentType] = useState("CASH");
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
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [productToRestock, setProductToRestock] = useState<Product | null>(
        null
    );
    const [restockAmount, setRestockAmount] = useState("");
    const [isRestocking, setIsRestocking] = useState(false);

    const hasFetched = useRef(false);
    const productsRef = useRef(productsData);
    productsRef.current = productsData;

    const filteredProducts = useMemo(() => {
        if (selectedCategoryId === "ALL") {
            return productsData;
        }
        return productsData.filter(
            (product) => product.categoryId === selectedCategoryId
        );
    }, [selectedCategoryId, productsData]);

    useEffect(() => {
        if (hasFetched.current) return;

        const loadData = async () => {
            if (productsData.length === 0) {
                setLoading(true);
            }

            try {
                const [productsRes, customersRes, categoriesRes] =
                    await Promise.allSettled([
                        axios.get("/api/product"),
                        axios.get("/api/customer"),
                        axios.get("/api/category"),
                    ]);

                if (
                    productsRes.status === "fulfilled" &&
                    productsRes.value.data
                ) {
                    if (Array.isArray(productsRes.value.data)) {
                        dispatch(setProducts(productsRes.value.data));
                    }
                }

                if (customersRes.status === "fulfilled") {
                    setCustomers(customersRes.value.data);
                }

                if (categoriesRes.status === "fulfilled") {
                    const mappedCategories = categoriesRes.value.data.map(
                        (c: any) => ({
                            id: c.id,
                            name: c.name,
                            description: c.description || "",
                        })
                    );
                    setCategories((prev) => {
                        const existingIds = new Set(prev.map((p) => p.id));
                        const newCats = mappedCategories.filter(
                            (c: Category) => !existingIds.has(c.id)
                        );
                        return [...prev, ...newCats];
                    });
                }
            } catch (error) {
                console.error("Data load error", error);
            } finally {
                setLoading(false);
                hasFetched.current = true;
            }
        };

        loadData();
        // Safe to include productsData.length because hasFetched prevents loops
    }, [dispatch, productsData.length]);

    const handleClose = useCallback(() => {
        dispatch(hide());
    }, [dispatch]);

    const toggleActiveCategory = useCallback((categoryId: string) => {
        setSelectedCategoryId(categoryId);
    }, []);

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

            await axios.put(
                `/api/product/${productToRestock.id}`,
                updatedProduct
            );

            const updatedProductsList = productsData.map((p) =>
                p.id === productToRestock.id ? updatedProduct : p
            );
            dispatch(setProducts(updatedProductsList));

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

    const handleAddToCart = useCallback(
        (product: Product) => {
            const cartItem = cartItems.find((item) => item.id === product.id);
            const currentCartQty = cartItem?.cartQuantity || 0;

            if (product.quantity > 0) {
                if (product.quantity > currentCartQty) {
                    dispatch(addItem(product));
                } else {
                    toast.warning("Insufficient product quantity available.");
                }
            } else {
                toast.warning("Product cannot be added to the cart.");
            }
        },
        [cartItems, dispatch]
    );

    const handleOrder = async (
        paymentTypeOverride?: string,
        mpesaDetails?: any
    ) => {
        if (cartItems.length === 0) {
            toast.warning("Cart is empty.");
            return;
        }

        setIsProcessingOrder(true);

        try {
            const invoiceItemPromises = cartItems.map((item) =>
                axios
                    .post("/api/invoiceItem/", {
                        quantity: item.cartQuantity,
                        price: item.price * item.cartQuantity,
                        productId: item.id,
                    })
                    .then((res) => res.data)
                    .catch(() => null)
            );

            const results = await Promise.all(invoiceItemPromises);
            const createdInvoiceItems = results
                .filter((r) => r !== null)
                .map((r) => ({ id: r.id }));

            if (createdInvoiceItems.length !== cartItems.length) {
                throw new Error("Failed to create some items");
            }

            const totalAmount = cartItems.reduce(
                (acc, item) => acc + item.price * item.cartQuantity,
                0
            );

            const invoiceData = {
                invoiceItems: createdInvoiceItems,
                totalAmount: totalAmount,
                paymentType: paymentTypeOverride || paymentType,
                mpesaDetails: mpesaDetails,
                customerId: selectedCustomer?.id || null,
            };

            const response = await axios.post("/api/invoice/", invoiceData);

            if (response.status === 201) {
                dispatch(clearCart());
                setMpesaNumber("");
                setSelectedCustomer(null);
                setIsInputVisible(false);
                setButtonText("Mpesa");
                toast.success("Order Created Successfully!");
            }
            return response.data;
        } catch (e) {
            toast.error("Error creating order");
            console.error(e);
        } finally {
            const isStartingMpesaFlow =
                paymentTypeOverride === "MPESA" && !mpesaDetails;
            if (!isStartingMpesaFlow) {
                setIsProcessingOrder(false);
            }
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
            return customers.find(
                (c) => formatPhoneNumber(c.phoneNumber) === formatted
            );
        },
        [customers]
    );

    const handleMpesaNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>
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
            const res = await axios.post("/api/customer", {
                firstName: newCustomerDetails.firstName,
                lastName: newCustomerDetails.lastName,
                phoneNumber: formatted,
                email: newCustomerDetails.email || null,
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
                toast.success("Customer saved");
            }
        } catch (e) {
            toast.error("Failed to save customer");
        }
    };

    const handleMpesaPrompt = async (event: React.FormEvent) => {
        event.preventDefault();
        const amount = parseFloat(
            cartItems
                .reduce((t, i) => t + i.price * i.cartQuantity, 0)
                .toFixed(2)
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
            const invoice = await handleOrder("MPESA");
            if (invoice?.id) {
                const res = await axios.post(
                    "/api/safaricom/c2b/payment/lipa",
                    {
                        phoneNumber: formattedNumber,
                        amount: amount,
                        transactionType: "CustomerPayBillOnline",
                        invoiceId: invoice.id,
                    }
                );
                if (res.status === 200) {
                    setPaymentType("MPESA");
                    toast.success("Payment Request Sent!");
                }
            }
        } catch (error) {
            console.error("Mpesa Error", error);
            toast.error("Failed to prompt M-Pesa");
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
                    const currentProducts = productsRef.current;
                    const scannedProduct = currentProducts.find(
                        (p) =>
                            p.sku === buffer ||
                            p.sku?.toUpperCase() === buffer.toUpperCase()
                    );

                    if (scannedProduct) {
                        dispatch(addItem(scannedProduct));
                        toast.success(`Added ${scannedProduct.name}`);
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
    }, [dispatch]);

    const profileImage = user?.hasImage ? user?.imageUrl : "/images/user.png";
    const cartTotal = useMemo(
        () =>
            cartItems
                .reduce((acc, item) => acc + item.price * item.cartQuantity, 0)
                .toFixed(2),
        [cartItems]
    );

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Main Content */}
            <div
                className="flex-grow flex flex-col"
                style={{ width: "calc(100% - 10rem)" }}
            >
                <Navbar>
                    <div className="flex overflow-auto gap-6 mt-4 scrollbar-hide">
                        {categories.map((category) => (
                            <CategoryBox
                                key={category.id}
                                id={category.id}
                                category={category.name}
                                active={selectedCategoryId === category.id}
                                onCategoryClick={toggleActiveCategory}
                            />
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-10">
                        {loading ? (
                            <div className="w-full m-auto mt-20 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <NoProductsFound />
                        ) : (
                            filteredProducts.map((product) => (
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
                                    {/* Restock & Cart Overlay Buttons */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openRestockModal(product);
                                        }}
                                        className={`${
                                            product.quantity <= 5
                                                ? "block"
                                                : "hidden"
                                        } absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-green-100 hover:text-green-600 text-gray-400 transition-all border border-gray-100 z-10`}
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
                            <p className="font-bold text-xl">${cartTotal}</p>
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
                                                        })
                                                    );
                                                    setShowAddCustomerModal(
                                                        true
                                                    );
                                                    if (
                                                        typeof window !==
                                                            "undefined" &&
                                                        window.innerWidth < 1020
                                                    )
                                                        handleClose();
                                                }}
                                                className="mt-2 text-xs text-green-500 font-medium flex items-center gap-1 hover:underline hover:text-green-700"
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

            {/* Conditional Modals */}
            {showSelectCustomerModal && (
                <SelectCustomerModal
                    setShowSelectCustomerModal={setShowSelectCustomerModal}
                    customers={customers}
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
        </div>
    );
}
