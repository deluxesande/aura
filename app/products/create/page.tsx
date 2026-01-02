"use client";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import ImageCropperModal from "@/components/ImageCropperModal";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Category } from "@/utils/typesDefinitions";
import { generateSKU } from "@/utils/generateSKU";
import axios from "axios";
import {
    CloudUpload,
    PlusCircle,
    ArrowLeft,
    Save,
    Loader2,
    Info,
    ScanBarcode,
    RefreshCw,
    Package,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import { useDispatch } from "react-redux";
import { setProducts } from "@/store/slices/productSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FloatingPortal } from "@floating-ui/react";

export default function CreateProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);

    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [productImage, setProductImage] = useState<File | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        description: "",
        price: "",
        quantity: "",
        categoryId: "",
        inStock: false,
    });

    const originalProducts = useSelector(
        (state: AppState) => state.product.products
    );
    const dispatch = useDispatch();

    const inputStyle =
        "w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2 transition-colors";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("/api/category");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleGenerateSKU = () => {
        const newSku = generateSKU(formData.name);
        setFormData((prev) => ({ ...prev, sku: newSku }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const toggleStock = () => {
        setFormData((prev) => ({ ...prev, inStock: !prev.inStock }));
    };

    const handleImageFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setTempImageSrc(objectUrl);
            setIsCropModalOpen(true);
            event.target.value = "";
        }
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
            success: "Category created.",
            error: "Error creating category.",
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        let finalSku = formData.sku;
        if (!finalSku) {
            finalSku = generateSKU(formData.name);
        }

        if (
            !formData.name ||
            !formData.description ||
            !formData.price ||
            !formData.quantity ||
            !formData.categoryId ||
            !productImage
        ) {
            toast.error("Please fill in all required fields");
            setIsLoading(false);
            return;
        }

        const finalInStock =
            Number(formData.quantity) > 0 ? true : formData.inStock;

        const submitData = new FormData();
        submitData.append("name", formData.name);
        submitData.append("sku", finalSku);
        submitData.append("description", formData.description);
        submitData.append("price", formData.price);
        submitData.append("quantity", formData.quantity);
        submitData.append("categoryId", formData.categoryId);
        submitData.append("inStock", finalInStock.toString());

        if (productImage) {
            submitData.append("file", productImage);
        }

        const promise = async () => {
            try {
                const response = await axios.post("/api/product", submitData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                dispatch(setProducts([...originalProducts, response.data]));
                router.push("/products/list");
            } catch (error) {
                throw error;
            } finally {
                setIsLoading(false);
            }
        };

        toast.promise(promise(), {
            loading: "Creating product...",
            success: "Product added to inventory.",
            error: "Error adding product.",
        });
    };

    useEffect(() => {
        let buffer = "";
        let lastKeyTime = Date.now();

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();
            const target = e.target as HTMLElement;

            // Safety Check: If the user is manually typing in an input field
            // (other than the SKU field), do not hijack their keystrokes.
            if (
                (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
                target.id !== "sku"
            ) {
                return;
            }

            // Timeout Reset: If it's been more than 100ms since the last key,
            // it's likely a new input or a slow human typing. Reset the buffer.
            if (currentTime - lastKeyTime > 100) {
                buffer = "";
            }
            lastKeyTime = currentTime;

            // Handle "Enter": Scanners end with Enter.
            if (e.key === "Enter") {
                // If we have a buffer with sufficient length, treat it as a scan
                if (buffer.length > 3) {
                    e.preventDefault();
                    setFormData((prev) => ({ ...prev, sku: buffer }));
                    toast.success("Product scanned successfully");
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
    }, []); // Empty dependency array means this runs once on mount

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
                                Add a new item to your inventory
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
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin stroke-white" />
                            ) : (
                                <Save className="w-4 h-4 stroke-white" />
                            )}
                            Save Product
                        </button>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
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
                                        className={inputStyle}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* SKU / Barcode Field */}
                                <div>
                                    <label
                                        htmlFor="sku"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        SKU / Barcode:
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <ScanBarcode className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                id="sku"
                                                type="text"
                                                className={`${inputStyle} pl-10`}
                                                value={formData.sku}
                                                onChange={handleChange}
                                                onKeyDown={handleKeyDown}
                                                autoFocus
                                                placeholder="Scan barcode or auto-generate"
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
                                        Scan a physical product now or click the
                                        button to generate an ID.
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
                                        rows={1}
                                        className={inputStyle}
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                Pricing & Inventory
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="price"
                                        className="block text-sm font-medium text-gray-700 mb-1"
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
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Quantity:
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Package className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            id="quantity"
                                            type="number"
                                            className={`${inputStyle} pl-10 no-spinner`}
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-green-50 p-5 rounded-xl shadow-sm border border-green-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-5 h-5 text-green-600" />
                                <h2 className="text-sm font-bold text-green-800 uppercase tracking-wider">
                                    Instructions
                                </h2>
                            </div>
                            <p className="text-sm text-green-700 mb-4 leading-relaxed">
                                To create a new product, fill in the required
                                fields. Upload a clear image and indicate if the
                                item is in stock.
                            </p>
                            <div className="text-xs font-medium text-green-800 bg-white/60 p-3 rounded-lg border border-green-200">
                                <strong>Tip:</strong> If you have no categories,
                                click the &quot;Create New Category&quot; button
                                below.
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Status */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
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

                        {/* Organization */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                                Organization
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="categoryId"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Category:
                                    </label>
                                    <select
                                        id="categoryId"
                                        className={inputStyle}
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        required
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
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                                Product Image
                            </h2>
                            <div className="relative w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 transition-colors group bg-gray-50 overflow-hidden cursor-pointer">
                                <input
                                    id="productImage"
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleImageFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    required={!productImage}
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
                                            <CloudUpload className="w-6 h-6 stroke-green-500" />
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
