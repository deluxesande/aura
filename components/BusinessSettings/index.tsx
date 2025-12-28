import axios from "axios";
import { CloudUpload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { setBusiness as setBusinessInStore } from "@/store/slices/businessSlice";
import ImageCropperModal from "@/components/ImageCropperModal"; // Import the cropper
import { FloatingPortal } from "@floating-ui/react";

interface BusinessSettingsFormProps {
    role: string;
}

const BusinessSettingsForm: React.FC<BusinessSettingsFormProps> = ({
    role,
}) => {
    const [business, setBusiness] = useState<string>("");
    const [logoUrl, setLogoUrl] = useState<string>("");

    // Image State
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [logoFile, setLogoFile] = useState<File | null>(null); // To store the file for FormData
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

    const [businessId, setBusinessId] = useState<string>("");
    const [hasExistingBusiness, setHasExistingBusiness] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    // Track original values to detect changes
    const [originalBusiness, setOriginalBusiness] = useState<string>("");
    const [originalLogoUrl, setOriginalLogoUrl] = useState<string>("");

    // Get business data from Redux store
    const user = useSelector((state: AppState) => state.auth.user);
    const storedBusiness = useSelector(
        (state: AppState) => state.business.business
    );

    // 1. Handle File Select -> Open Cropper
    const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setTempImageSrc(objectUrl);
            setIsCropModalOpen(true);
            e.target.value = ""; // Reset input
        }
    };

    // 2. Handle Crop Complete -> Process Result
    const handleCropComplete = (croppedBlob: Blob) => {
        // A. Create File object for FormData (Create API)
        const croppedFile = new File([croppedBlob], "business-logo.jpg", {
            type: "image/jpeg",
        });
        setLogoFile(croppedFile);

        // B. Create Base64 string for Preview & JSON (Update API)
        const reader = new FileReader();
        reader.readAsDataURL(croppedBlob);
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
            setLogoUrl(reader.result as string);
        };
    };

    const createBusiness = async (formData: FormData) => {
        await axios.post("/api/business", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    };

    const updateBusiness = async (data: { name?: string; logo?: string }) => {
        await axios.put(`/api/business/${businessId}`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check for changes first before starting the promise
        if (hasExistingBusiness) {
            const hasNameChanged = business !== originalBusiness;
            const hasLogoChanged = logoPreview !== "";

            if (!hasNameChanged && !hasLogoChanged) {
                toast.info("No changes detected");
                return; // Exit early without showing promise toast
            }
        }

        const promise = async () => {
            if (hasExistingBusiness) {
                // Only send changed fields for update
                const hasNameChanged = business !== originalBusiness;
                const hasLogoChanged = logoPreview !== "";

                const updateData: { name?: string; logo?: string } = {};

                if (hasNameChanged) {
                    updateData.name = business;
                }
                if (hasLogoChanged) {
                    updateData.logo = logoPreview; // Send base64 string
                }

                await updateBusiness(updateData);
            } else {
                const formData = new FormData();
                formData.append("name", business);

                // Use the state logoFile instead of querying DOM
                if (logoFile) {
                    formData.append("logo", logoFile);
                }

                await createBusiness(formData);
            }
        };

        toast.promise(promise(), {
            loading: hasExistingBusiness
                ? "Updating business..."
                : "Creating business...",
            success: hasExistingBusiness
                ? "Business updated successfully!"
                : "Business created successfully!",
            error: hasExistingBusiness
                ? "Failed to update business"
                : "Failed to create business",
        });
    };

    useEffect(() => {
        let foundInStore = false;

        // 1. Check if business data exists in Redux store first
        if (storedBusiness?.id && storedBusiness?.name) {
            setBusiness(storedBusiness.name);
            setLogoUrl(storedBusiness.logo || "");
            setBusinessId(storedBusiness.id);
            setHasExistingBusiness(true);

            // Store original values for comparison
            setOriginalBusiness(storedBusiness.name);
            setOriginalLogoUrl(storedBusiness.logo || "");

            setIsLoading(false);
            foundInStore = true; // Mark that we found data
        }

        // 2. Handle API Fetching
        if (user?.businessId) {
            // Case A: User HAS a business ID -> Fetch it
            const fetchAndStoreBusiness = async () => {
                try {
                    const response = await axios.get("/api/business");

                    if (response.status === 200 && response.data.length > 0) {
                        const businessData = response.data[0];

                        setBusiness(businessData.name);
                        setLogoUrl(businessData.logo);
                        setBusinessId(businessData.id);
                        setHasExistingBusiness(true);

                        setOriginalBusiness(businessData.name);
                        setOriginalLogoUrl(businessData.logo);

                        dispatch(
                            setBusinessInStore({
                                id: businessData.id,
                                name: businessData.name,
                                logo: businessData.logo,
                            })
                        );
                    }
                } catch (error) {
                    if (
                        axios.isAxiosError(error) &&
                        error.response?.status !== 404
                    ) {
                        toast.error("Error fetching business data");
                    }
                } finally {
                    // This stops loading when the fetch is done
                    setIsLoading(false);
                }
            };

            fetchAndStoreBusiness();
        } else {
            // Case B: FIX - User does NOT have a business ID
            // If we didn't find data in the store either, we must stop loading here.
            if (!foundInStore) {
                setIsLoading(false);
            }
        }
    }, [
        storedBusiness?.id,
        storedBusiness?.name,
        storedBusiness?.logo,
        user?.businessId,
        dispatch,
    ]);

    return (
        <section className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Business Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Configure your business information and default settings for
                    invoices and documents.
                </p>
            </header>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                    <label
                        htmlFor="businessLogo"
                        className="block text-sm font-medium text-gray-900"
                    >
                        Business Logo
                    </label>

                    <div className="relative mt-2 w-full border-2 border-dashed border-gray-300 rounded-lg flex text-center items-center justify-center bg-slate-50 hover:border-green-400 transition-colors cursor-pointer group overflow-hidden">
                        {logoPreview || logoUrl ? (
                            <>
                                <Image
                                    src={logoPreview || logoUrl}
                                    alt="Business Logo"
                                    className="w-full h-60 object-cover rounded-lg"
                                    width={256}
                                    height={256}
                                    style={{
                                        objectFit: "cover",
                                        borderRadius: "0.5rem",
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                        Change Logo
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center space-y-2 py-10">
                                <CloudUpload
                                    size={25}
                                    className="stroke-green-500"
                                />
                                <p className="font-medium text-gray-600">
                                    Upload file
                                </p>
                                <p className="text-sm text-gray-400">
                                    PNG, JPG are Allowed.
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            id="businessLogo"
                            accept="image/png, image/jpeg, image/jpg"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleLogoFileSelect}
                        />
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                        {logoUrl || logoPreview
                            ? "Upload a new logo to replace the current one"
                            : "Upload a logo for your documents and invoices"}
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="businessName"
                        className="block text-sm font-medium text-gray-900"
                    >
                        Business Name
                    </label>
                    <input
                        type="text"
                        id="businessName"
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        required
                        className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your business name"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        This name will appear on all invoices and documents
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={role === "manager"}
                    className="btn btn-md btn-ghost flex items-center bg-green-500 text-white hover:bg-green-600 w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {hasExistingBusiness
                        ? "Update Business"
                        : "Create Business"}
                </button>
            </form>

            {/* Image Cropper Modal */}
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
        </section>
    );
};

export default BusinessSettingsForm;
