"use client";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import ImageCropperModal from "@/components/ImageCropperModal";
import Navbar from "@/components/Navbar";
import { AppState } from "@/store";
import { setProducts } from "@/store/slices/productSlice";
import { generateSKU } from "@/utils/generateSKU";
import { Category, Product, ProductType } from "@/utils/typesDefinitions";
import { useUploadThing } from "@/utils/uploadthing";
import { FloatingPortal } from "@floating-ui/react";
import axios from "axios";
import {
    ArrowLeft,
    CloudUpload,
    Loader2,
    Plus,
    PlusCircle,
    RefreshCw,
    Save,
    Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const MAX_SIZE = 200 * 1024; // 200KB

export default function CreateProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [templates, setTemplates] = useState<Product[]>([]);

    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [productImage, setProductImage] = useState<File | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { startUpload } = useUploadThing("productImage");

    const [type, setType] = useState<ProductType>("SIMPLE");
    const [attributes, setAttributes] = useState<
        {
            name: string;
            value: string;
            price: string;
            quantity: string;
            sku: string;
        }[]
    >([]);

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        description: "",
        price: "",
        quantity: "",
        categoryId: "",
        inStock: false,
        parentId: "",
    });

    const originalProducts = useSelector(
        (state: AppState) => state.product.products,
    );
    const dispatch = useDispatch();

    const inputStyle =
        "w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2 transition-colors no-spinner";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    axios.get("/api/category"),
                    axios.get("/api/product"),
                ]);
                setCategories(catRes.data);
                setTemplates(
                    prodRes.data.filter((p: Product) => p.type === "TEMPLATE"),
                );
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));

        if (id === "parentId" && value) {
            const template = templates.find((t) => t.id === value);
            if (template) {
                setFormData((prev) => ({
                    ...prev,
                    parentId: value,
                    categoryId: template.categoryId,
                    name: template.name,
                    description: template.description,
                }));
            }
        }
    };

    const handleGenerateSKU = () => {
        const newSku = generateSKU(formData.name);
        setFormData((prev) => ({ ...prev, sku: newSku }));
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            toast.success("Barcode captured");
        }
    };

    const toggleStock = () => {
        setFormData((prev) => ({ ...prev, inStock: !prev.inStock }));
    };

    const addAttribute = () => {
        if (attributes.length >= 1) {
            toast.info("Batch adding variants is currently disabled to ensure reliable saving. Please add them one by one.");
            return;
        }
        setAttributes([
            ...attributes,
            { name: "", value: "", price: "", quantity: "", sku: "" },
        ]);
    };

    const removeAttribute = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const handleAttributeChange = (
        index: number,
        field: "name" | "value" | "price" | "quantity" | "sku",
        value: string,
    ) => {
        const newAttributes = [...attributes];
        newAttributes[index][field] = value;
        setAttributes(newAttributes);
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
            toast.error("Image size must be under 200KB");
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
        const croppedFile = new File([croppedBlob], "product-image.jpg", {
            type: "image/jpeg",
        });
        setProductImage(croppedFile);
    };

    const handleCreateNewCategory = async (categoryName: string) => {
        const promise = async () => {
            try {
                const response = await axios.post("/api/category", {
                    name: categoryName,
                });
                setCategories([...categories, response.data]);
            } catch (error) {
                throw error;
            }
        };

        toast.promise(promise(), {
            loading: "Creating category...",
            success: "Category created successfully",
            error: "Could not create category. Please try again.",
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        if (
            !formData.name ||
            !formData.categoryId ||
            (type === "SIMPLE" && (!formData.price || !formData.quantity)) ||
            (type === "VARIANT" && !formData.parentId)
        ) {
            toast.error("Please fill in all required fields");
            setIsLoading(false);
            return;
        }

        if (type === "VARIANT" && attributes.length === 0) {
            toast.error("Please add at least one variant");
            setIsLoading(false);
            return;
        }

        const createProductOperation = async () => {
            try {
                let imageUrl = "/images/default-product.png";

                if (productImage) {
                    const uploadRes = await startUpload([productImage]);
                    if (!uploadRes || !uploadRes[0]?.url) {
                        throw new Error("Image upload failed. Please try again.");
                    }
                    imageUrl = uploadRes[0].url;
                }

                if (type === "VARIANT") {
                    const payloads = attributes.map((v) => {
                        const finalSku =
                            v.sku || generateSKU(`${formData.name}-${v.value}`);
                        return {
                            ...formData,
                            price: v.price || formData.price || 0,
                            quantity: v.quantity || formData.quantity || 0,
                            sku: finalSku,
                            inStock: Number(v.quantity) > 0,
                            image: imageUrl,
                            type: "VARIANT",
                            attributes: [{ name: v.name, value: v.value }],
                        };
                    });

                    const response = await axios.post("/api/product", payloads);
                    const results = response.data;

                    dispatch(setProducts([...originalProducts, ...results]));
                    router.push("/products/list");
                    return results;
                } else {
                    let finalSku = formData.sku || generateSKU(formData.name);
                    const finalInStock =
                        type === "TEMPLATE"
                            ? false
                            : Number(formData.quantity) > 0
                              ? true
                              : formData.inStock;

                    const payload = {
                        ...formData,
                        sku: finalSku,
                        inStock: finalInStock,
                        image: imageUrl,
                        type,
                        attributes: [],
                    };

                    const response = await axios.post("/api/product", payload);
                    dispatch(setProducts([...originalProducts, response.data]));
                    router.push("/products/list");
                    return response.data;
                }
            } catch (error: any) {
                console.error(error);
                const errorMessage = error.response?.data?.error || "Something went wrong while saving. Please try again.";
                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        toast.promise(createProductOperation(), {
            loading:
                type === "VARIANT"
                    ? "Saving variant..."
                    : "Saving product...",
            success:
                type === "VARIANT"
                    ? "Variant saved successfully"
                    : "Product saved successfully",
            error: (err) => err?.message || "Could not save. Please check your connection.",
        });
    };

    return (
        <Navbar>
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/products/list"
                            className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Create Product
                            </h1>
                            <p className="text-sm text-gray-500">
                                Add a new item, template, or variants
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
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin stroke-white" />
                            ) : (
                                <Save className="w-4 h-4 stroke-white" />
                            )}
                            {isLoading ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Type Selection */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                                1. What are you creating?
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setType("SIMPLE")}
                                    className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                                        type === "SIMPLE"
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-100 bg-gray-50 hover:border-gray-200"
                                    }`}
                                >
                                    <p
                                        className={`text-sm font-bold ${type === "SIMPLE" ? "text-green-600" : "text-gray-700"}`}
                                    >
                                        Simple Product
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("TEMPLATE")}
                                    className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                                        type === "TEMPLATE"
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-100 bg-gray-50 hover:border-gray-200"
                                    }`}
                                >
                                    <p
                                        className={`text-sm font-bold ${type === "TEMPLATE" ? "text-green-600" : "text-gray-700"}`}
                                    >
                                        Template
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("VARIANT")}
                                    className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                                        type === "VARIANT"
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-100 bg-gray-50 hover:border-gray-200"
                                    }`}
                                >
                                    <p
                                        className={`text-sm font-bold ${type === "VARIANT" ? "text-green-600" : "text-gray-700"}`}
                                    >
                                        Variants
                                    </p>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                                2. General Information
                            </h2>
                            <div className="space-y-4">
                                {type === "VARIANT" && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Parent Template:
                                        </label>
                                        <select
                                            id="parentId"
                                            className={inputStyle}
                                            value={formData.parentId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">
                                                Select Parent Template
                                            </option>
                                            {templates.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                                    >
                                        Name:
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        className={inputStyle}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={
                                            type === "VARIANT" &&
                                            formData.parentId !== ""
                                        }
                                        placeholder={
                                            type === "TEMPLATE"
                                                ? "e.g. Cotton T-Shirt"
                                                : "Product Name"
                                        }
                                    />
                                </div>

                                {type !== "VARIANT" && (
                                    <div>
                                        <label
                                            htmlFor="sku"
                                            className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                                        >
                                            SKU / Barcode:
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    id="sku"
                                                    type="text"
                                                    className={`${inputStyle} px-4`}
                                                    value={formData.sku}
                                                    onChange={handleChange}
                                                    onKeyDown={
                                                        handleInputKeyDown
                                                    }
                                                    placeholder="Scan barcode or auto-generate"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleGenerateSKU}
                                                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                                    >
                                        Description:
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={2}
                                        className={inputStyle}
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        disabled={
                                            type === "VARIANT" &&
                                            formData.parentId !== ""
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {type === "VARIANT" && (
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                        3. Variants (Attributes)
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addAttribute}
                                        className="text-xs font-bold text-green-500 flex items-center gap-1 hover:text-green-600 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" /> Add Variant
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {attributes.map((attr, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-wrap gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100"
                                        >
                                            <div className="flex-1 min-w-[120px]">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                                                    Attribute (e.g. Color)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Color"
                                                    className={inputStyle}
                                                    value={attr.name}
                                                    onChange={(e) =>
                                                        handleAttributeChange(
                                                            index,
                                                            "name",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="flex-1 min-w-[120px]">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                                                    Value (e.g. Red)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Red"
                                                    className={inputStyle}
                                                    value={attr.value}
                                                    onChange={(e) =>
                                                        handleAttributeChange(
                                                            index,
                                                            "value",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                                                    Price
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="Ksh"
                                                    className={inputStyle}
                                                    value={attr.price}
                                                    onChange={(e) =>
                                                        handleAttributeChange(
                                                            index,
                                                            "price",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                                                    Qty
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className={inputStyle}
                                                    value={attr.quantity}
                                                    onChange={(e) =>
                                                        handleAttributeChange(
                                                            index,
                                                            "quantity",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeAttribute(index)
                                                }
                                                className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors mb-0.5"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {attributes.length === 0 && (
                                        <p className="text-xs text-gray-400 italic text-center py-4 rounded-lg border border-dashed border-gray-200">
                                            No variants added. Click &quot;Add
                                            Variant&quot; to create specific
                                            versions.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {type === "SIMPLE" && (
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                                    3. Pricing & Inventory
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            htmlFor="price"
                                            className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                                        >
                                            Price:
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
                                                className={`${inputStyle} pl-12 no-spinner`}
                                                value={formData.price}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="quantity"
                                            className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                                        >
                                            Quantity:
                                        </label>
                                        <input
                                            id="quantity"
                                            type="number"
                                            className={`${inputStyle} no-spinner`}
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        {/* Dynamic Info Card - Positioned below Price/Variant forms and above Status */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3 transition-all">
                            <div>
                                <h3 className="text-sm font-bold text-blue-800 mb-1">
                                    {type === "SIMPLE" &&
                                        "About Simple Products"}
                                    {type === "TEMPLATE" && "About Templates"}
                                    {type === "VARIANT" && "About Variants"}
                                </h3>
                                <p className="text-xs text-blue-600 leading-relaxed">
                                    {type === "SIMPLE" &&
                                        "A standard, standalone item sold as a single unit (e.g., a specific book or a hammer). It tracks its own price, SKU, and stock level."}
                                    {type === "TEMPLATE" &&
                                        "A parent container used to group items that come in different variations (like a T-Shirt). Templates do not have their own stock or price—they just hold your variants together."}
                                    {type === "VARIANT" &&
                                        "A specific version of a Template (e.g., a Red, Large T-Shirt). You must select a Parent Template first. Variants track their own specific price, barcode, and stock quantity."}
                                </p>
                            </div>
                        </div>

                        {/* Status */}
                        {type === "SIMPLE" && (
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

                        {/* Organization */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                                Organization
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="categoryId"
                                        className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                                    >
                                        Category:
                                    </label>
                                    <select
                                        id="categoryId"
                                        className={inputStyle}
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        required
                                        disabled={
                                            type === "VARIANT" &&
                                            formData.parentId !== ""
                                        }
                                    >
                                        <option value="" disabled>
                                            Select Category
                                        </option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="btn btn-sm btn-ghost w-full text-white flex items-center justify-center bg-green-500 hover:bg-green-600"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2 stroke-white" />
                                    Create New Category
                                </button>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                                Product Image
                            </h2>
                            <div className="relative w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors group bg-gray-50 overflow-hidden cursor-pointer">
                                <input
                                    id="productImage"
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
                                        <div className="p-3 bg-green-100 rounded-full shadow-sm mb-3">
                                            <CloudUpload className="w-6 h-6 stroke-green-500" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">
                                            Click to upload
                                        </span>
                                        <span className="text-xs mt-1">
                                            PNG
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <CreateCategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateNewCategory}
            />

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
        </Navbar>
    );
}
