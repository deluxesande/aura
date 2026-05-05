"use client";

import ImageCropperModal from "@/components/ImageCropperModal";
import Navbar from "@/components/Navbar";
import QuicKRestockModal from "@/components/QuickRestockModal";
import { AppState } from "@/store";
import { setProducts } from "@/store/slices/productSlice";
import { generateSKU } from "@/utils/generateSKU";
import { Category, Product } from "@/utils/typesDefinitions";
import { FloatingPortal } from "@floating-ui/react";
import { apiClient } from "@/utils/apiClient";
import {
    ArrowLeft,
    Loader2,
    Plus,
    RefreshCw,
    Save,
    UploadCloud,
    Info,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const MAX_SIZE = 200 * 1024; // 200KB

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const dispatch = useDispatch();
    const originalProducts = useSelector(
        (state: AppState) => state.product.products,
    );
    const cachedProduct = useMemo(() => {
        return originalProducts.find((p) => p.id === id);
    }, [originalProducts, id]);

    const [categories, setCategories] = useState<Category[]>([]);

    const [imagePreview, setImagePreview] = useState<string | null>(
        cachedProduct?.image || null,
    );
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [restockAmount, setRestockAmount] = useState<string>("");

    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(!cachedProduct);

    const hasFetched = useRef(false);

    const initialFormState: Product = {
        id: "",
        name: "",
        description: "",
        price: 0,
        quantity: 0,
        categoryId: "",
        image: "",
        inStock: false,
        sku: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        Category: { id: "", name: "", products: [] },
        invoiceItems: [],
        type: "SIMPLE",
    };

    const [formData, setFormData] = useState<Product>(
        cachedProduct || initialFormState,
    );

    const [isRestocking, setIsRestocking] = useState(false);

    const isTemplate = formData.type === "TEMPLATE";

    useEffect(() => {
        if (!id || hasFetched.current) return;

        const fetchData = async () => {
            if (!cachedProduct) setIsDataLoading(true);

            try {
                const [productRes, categoriesRes] = await Promise.allSettled([
                    apiClient.get(`/product/${id}`),
                    apiClient.get("/category"),
                ]);

                if (productRes.status === "fulfilled") {
                    const freshProductData = productRes.value.data;

                    setFormData((prev) => ({ ...prev, ...freshProductData }));

                    if (
                        freshProductData.image &&
                        imagePreview === cachedProduct?.image
                    ) {
                        setImagePreview(freshProductData.image);
                    }

                    const updatedList = originalProducts.some(
                        (p) => p.id === freshProductData.id,
                    )
                        ? originalProducts.map((p) =>
                              p.id === freshProductData.id
                                  ? freshProductData
                                  : p,
                          )
                        : [...originalProducts, freshProductData];

                    dispatch(setProducts(updatedList));
                }

                if (categoriesRes.status === "fulfilled") {
                    setCategories(categoriesRes.value.data);
                }
            } catch (error) {
                console.error("Background fetch error", error);
                if (!cachedProduct)
                    toast.error("Error fetching product details");
            } finally {
                setIsDataLoading(false);
                hasFetched.current = true;
            }
        };

        fetchData();
    }, [id, dispatch, cachedProduct, imagePreview, originalProducts]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]:
                id === "price" || id === "quantity"
                    ? value === ""
                        ? 0
                        : parseInt(value, 10)
                    : value,
        }));
    };

    const handleGenerateSKU = () => {
        const newSku = generateSKU(formData.name);
        setFormData((prev) => ({ ...prev, sku: newSku }));
    };

    useEffect(() => {
        let buffer = "";
        let lastKeyTime = Date.now();

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
                return;
            }

            if (currentTime - lastKeyTime > 100) {
                buffer = "";
            }
            lastKeyTime = currentTime;

            if (e.key === "Enter") {
                if (buffer.length > 3) {
                    e.preventDefault();
                    setFormData((prev) => ({ ...prev, sku: buffer }));
                    toast.success("New barcode scanned successfully");
                    buffer = "";
                }
            } else if (e.key.length === 1) {
                buffer += e.key;
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, []);

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const toggleStock = () => {
        setFormData((prev) => ({ ...prev, inStock: !prev.inStock }));
    };

    const handleRestock = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const amountToAdd = parseInt(restockAmount, 10);
        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        setIsRestocking(true);
        try {
            const newQuantity = (formData.quantity || 0) + amountToAdd;
            const updatedProduct = {
                ...formData,
                quantity: newQuantity,
                inStock: true,
            };

            const response = await apiClient.put(
                `/product/${id}`,
                updatedProduct,
            );
            const savedProduct = response.data || updatedProduct;

            // Update local form state
            setFormData((prev) => ({ ...prev, ...savedProduct }));

            // Update Redux product list
            const updatedProductsList = originalProducts.map((p) =>
                p.id === id ? { ...p, ...savedProduct } : p,
            );
            dispatch(setProducts(updatedProductsList));

            toast.success(
                `${formData.name} restocked! New Qty: ${newQuantity}`,
            );
            setIsRestockModalOpen(false);
            setRestockAmount("");
        } catch (error) {
            toast.error("Failed to restock product");
        } finally {
            setIsRestocking(false);
        }
    };

    const handleImageFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "image/png") {
            toast.error("Only PNG images are allowed");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_SIZE) {
            toast.error("Image must be under 200KB");
            event.target.value = "";
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setTempImageSrc(objectUrl);
        setIsCropModalOpen(true);
        event.target.value = "";
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const previewUrl = URL.createObjectURL(croppedBlob);
        setImagePreview(previewUrl);

        const reader = new FileReader();
        reader.readAsDataURL(croppedBlob);
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData((prev) => ({
                ...prev,
                image: base64String,
            }));
        };
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const promise = async () => {
            try {
                const finalData = {
                    ...formData,
                    sku: formData.sku || generateSKU(formData.name),
                };

                const response = await apiClient.put(
                    `/product/${id}`,
                    finalData,
                );

                const updatedProducts = originalProducts.map((p) =>
                    p.id === id ? response.data : p,
                );
                dispatch(setProducts(updatedProducts));

                router.push("/products/list");
            } catch (error) {
                throw error;
            } finally {
                setIsLoading(false);
            }
        };

        toast.promise(promise(), {
            loading: "Saving changes...",
            success: "Product updated successfully!",
            error: "Failed to update product",
        });
    };

    return (
        <Navbar>
            <div className="max-w-5xl mx-auto px-4 py-8 relative">
                {isDataLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">        
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/products/list"
                            className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Edit Product
                                </h1>
                                {isTemplate && (
                                    <span className="bg-green-100 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                        TEMPLATE
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                {isTemplate
                                    ? "Update parent template details"
                                    : "Update product details and inventory"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={(e) => handleSubmit(e as any)}
                            disabled={isLoading || isDataLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin stroke-white" />
                            ) : (
                                <Save className="w-4 h-4 stroke-white" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">  
                                General Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Name:
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-400 border-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="sku"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        SKU / Barcode:
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                id="sku"
                                                type="text"
                                                className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-400 border-2 transition-colors"
                                                value={formData.sku || ""}
                                                onChange={handleChange}
                                                onKeyDown={handleInputKeyDown}
                                                placeholder="Scan new barcode to update"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGenerateSKU}
                                            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                                            title="Generate Random SKU"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Scan a new barcode to link it, or
                                        generate a new ID.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Description:
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-400 border-2"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {!isTemplate && (
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                                    Pricing & Inventory
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            htmlFor="price"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Base Price
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">
                                                    Ksh
                                                </span>
                                            </div>
                                            <input
                                                id="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-400 border-2 no-spinner"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label
                                                htmlFor="quantity"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Stock Quantity
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsRestockModalOpen(true)
                                                }
                                                className="text-xs flex items-center gap-1 text-green-500 hover:text-green-500 font-medium"
                                            >
                                                <Plus className="w-3 h-3 stroke-green-500" />
                                                Restock
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                id="quantity"
                                                type="number"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-400 border-2 no-spinner"
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isTemplate && (
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex gap-4">       
                                <div className="p-2 bg-blue-500 rounded-lg h-fit">
                                    <Info className="w-5 h-5 stroke-white" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-blue-800">
                                        Template Product
                                    </p>
                                    <p className="text-xs text-blue-600 leading-relaxed">
                                        Templates are used to group different
                                        versions of a product (variants). Price
                                        and stock are managed individually for
                                        each variant. Changes made here will
                                        apply to all variants linked to this
                                        template.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {!isTemplate && (
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                                    Status
                                </h2>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">
                                            In Stock
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Available for sale
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleStock}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                            formData.inStock
                                                ? "bg-green-500"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        <span
                                            className={`${
                                                formData.inStock
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">  
                                Organization
                            </h2>
                            <div>
                                <label
                                    htmlFor="categoryId"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Category
                                </label>
                                <select
                                    id="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>
                                        Select Category
                                    </option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">  
                                Product Image
                            </h2>
                            <div className="relative w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors group bg-gray-50 overflow-hidden cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/png"
                                    onChange={handleImageFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"    
                                />

                                {imagePreview ? (
                                    <>
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                                Change Image
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                            <UploadCloud className="w-6 h-6 text-green-500" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">
                                            Click to upload
                                        </span>
                                        <span className="text-xs mt-1">
                                            PNG, JPG
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                <FloatingPortal>
                    <ImageCropperModal
                        isOpen={isCropModalOpen}
                        imageSrc={tempImageSrc}
                        onClose={() => {
                            setIsCropModalOpen(false);
                            setTempImageSrc(null);
                        }}
                        onCropComplete={handleCropComplete}
                    />
                </FloatingPortal>

                {isRestockModalOpen && (
                    <QuicKRestockModal
                        productToRestock={formData}
                        setIsRestockModalOpen={setIsRestockModalOpen}
                        restockAmount={restockAmount}
                        setRestockAmount={setRestockAmount}
                        handleQuickRestockSubmit={handleRestock}
                        isRestocking={false}
                    />
                )}
            </div>
        </Navbar>
    );
}
