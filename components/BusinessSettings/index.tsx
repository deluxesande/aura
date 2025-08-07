import axios from "axios";
import { CloudUpload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface BusinessSettingsFormProps {
    role: string;
}

const BusinessSettingsForm: React.FC<BusinessSettingsFormProps> = ({
    role,
}) => {
    const [business, setBusiness] = useState<string>("");
    const [logoUrl, setLogoUrl] = useState<string>("");
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [businessId, setBusinessId] = useState<string>("");
    const [hasExistingBusiness, setHasExistingBusiness] =
        useState<boolean>(false);

    // Track original values to detect changes
    const [originalBusiness, setOriginalBusiness] = useState<string>("");
    const [originalLogoUrl, setOriginalLogoUrl] = useState<string>("");

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
                // Store the base64 string for API submission
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
                // For create, get the actual file from the input element
                const logoFile = (
                    document.getElementById("businessLogo") as HTMLInputElement
                ).files?.[0];

                const formData = new FormData();
                formData.append("name", business);
                if (logoFile) {
                    formData.append("logo", logoFile); // Send actual file
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
        const fetchBusiness = async () => {
            try {
                const response = await axios.get("/api/business");

                if (response.status == 200 && response.data.length > 0) {
                    const businessData = response.data[0];

                    setBusiness(businessData.name);
                    setLogoUrl(businessData.logo);
                    setBusinessId(businessData.id);
                    setHasExistingBusiness(true);

                    // Store original values for comparison
                    setOriginalBusiness(businessData.name);
                    setOriginalLogoUrl(businessData.logo);
                }
            } catch (error) {
                toast.error("Failed to fetch business data");
            }
        };

        fetchBusiness();
    }, []);

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Business Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Configure your business information and default settings for
                    invoices and documents.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                    <label
                        htmlFor="businessLogo"
                        className="block text-sm font-medium text-gray-900"
                    >
                        Business Logo
                    </label>

                    <div className="relative mt-2 w-full border-2 border-dashed border-gray-300 rounded-lg flex text-center items-center justify-center bg-slate-50 hover:border-green-400 transition-colors cursor-pointer">
                        {logoPreview || logoUrl ? (
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
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center space-y-2">
                                <CloudUpload
                                    size={25}
                                    className="stroke-green-500"
                                />
                                <p className="font-medium text-gray-600">
                                    Upload file
                                </p>
                                <p className="text-sm text-gray-400">
                                    PNG are Allowed.
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            id="businessLogo"
                            accept="image/png"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleLogoChange}
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
                    className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full mt-8"
                >
                    {hasExistingBusiness
                        ? "Update Business"
                        : "Create Business"}
                </button>
            </form>
        </section>
    );
};

export default BusinessSettingsForm;
