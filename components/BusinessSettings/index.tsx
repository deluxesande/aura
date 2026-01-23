import axios from "axios";
import { CloudUpload } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { setBusiness as setBusinessInStore } from "@/store/slices/businessSlice";
import ImageCropperModal from "@/components/ImageCropperModal";
import { FloatingPortal } from "@floating-ui/react";

interface BusinessSettingsFormProps {
    role: string;
}

const BusinessSettingsForm: React.FC<BusinessSettingsFormProps> = ({
    role,
}) => {
    const [business, setBusiness] = useState<string>("");
    const [logoUrl, setLogoUrl] = useState<string>("");

    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [address, setAddress] = useState<string>("");

    const [logoPreview, setLogoPreview] = useState<string>("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

    const [businessId, setBusinessId] = useState<string>("");
    const [hasExistingBusiness, setHasExistingBusiness] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    const [originalBusiness, setOriginalBusiness] = useState<string>("");
    const [originalLogoUrl, setOriginalLogoUrl] = useState<string>("");
    const [originalEmail, setOriginalEmail] = useState<string>("");
    const [originalPhone, setOriginalPhone] = useState<string>("");
    const [originalAddress, setOriginalAddress] = useState<string>("");

    const user = useSelector((state: AppState) => state.auth.user);
    const storedBusiness = useSelector(
        (state: AppState) => state.business.business,
    );

    // Ref to ensure we don't re-populate while user is typing
    const isPopulated = useRef(false);

    const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setTempImageSrc(objectUrl);
            setIsCropModalOpen(true);
            e.target.value = "";
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const croppedFile = new File([croppedBlob], "business-logo.jpg", {
            type: "image/jpeg",
        });
        setLogoFile(croppedFile);

        const reader = new FileReader();
        reader.readAsDataURL(croppedBlob);
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
            setLogoUrl(reader.result as string);
        };
    };

    const createBusiness = async (formData: FormData) => {
        await axios.post("/api/business", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    };

    const updateBusiness = async (data: {
        name?: string;
        logo?: string;
        email?: string;
        phone?: string;
        address?: string;
    }) => {
        await axios.put(`/api/business/${businessId}`, data, {
            headers: { "Content-Type": "application/json" },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (hasExistingBusiness) {
            const hasNameChanged = business !== originalBusiness;
            const hasLogoChanged = logoPreview !== "";
            const hasEmailChanged = email !== originalEmail;
            const hasPhoneChanged = phone !== originalPhone;
            const hasAddressChanged = address !== originalAddress;

            if (
                !hasNameChanged &&
                !hasLogoChanged &&
                !hasEmailChanged &&
                !hasPhoneChanged &&
                !hasAddressChanged
            ) {
                toast.info("No changes detected");
                return;
            }
        }

        const promise = async () => {
            if (hasExistingBusiness) {
                const updateData: any = {};
                if (business !== originalBusiness) updateData.name = business;
                if (logoPreview !== "") updateData.logo = logoPreview;
                if (email !== originalEmail) updateData.email = email;
                if (phone !== originalPhone) updateData.phone = phone;
                if (address !== originalAddress) updateData.address = address;

                await updateBusiness(updateData);
            } else {
                const formData = new FormData();
                formData.append("name", business);
                formData.append("email", email);
                formData.append("phone", phone);
                formData.append("address", address);
                if (logoFile) formData.append("logo", logoFile);

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

    const populateState = (data: any) => {
        setBusiness(data.name || "");
        setLogoUrl(data.logo || "");
        setBusinessId(data.id || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");

        setHasExistingBusiness(true);

        setOriginalBusiness(data.name || "");
        setOriginalLogoUrl(data.logo || "");
        setOriginalEmail(data.email || "");
        setOriginalPhone(data.phone || "");
        setOriginalAddress(data.address || "");

        // Mark as populated so we don't overwrite if the effect runs again
        isPopulated.current = true;
    };

    useEffect(() => {
        let foundInStore = false;

        // 1. Check Store first
        // FIX: Depend on storedBusiness.id, NOT the whole object
        if (storedBusiness?.id && storedBusiness?.id === user?.businessId) {
            populateState(storedBusiness);
            setIsLoading(false);
            foundInStore = true;
        }

        // 2. If not in store, fetch API
        if (user?.businessId && !foundInStore) {
            const fetchAndStoreBusiness = async () => {
                try {
                    const response = await axios.get("/api/business");
                    if (response.status === 200 && response.data.length > 0) {
                        const businessData = response.data[0];
                        populateState(businessData);

                        // FIX: Only dispatch if we actually fetched new data
                        dispatch(
                            setBusinessInStore({
                                id: businessData.id,
                                name: businessData.name,
                                logo: businessData.logo,
                            }),
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
                    setIsLoading(false);
                }
            };
            fetchAndStoreBusiness();
        } else {
            // Case where user has no business ID (new user)
            if (!user?.businessId) {
                setIsLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storedBusiness?.id, user?.businessId, dispatch]);

    return (
        <section className="relative bg-white p-6 rounded-lg shadow-md w-full">
            <header className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Business Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Configure your business information and default settings for
                    invoices and documents.
                </p>
            </header>

            <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900">
                            Public Information
                        </h3>
                        <p className="mt-1 text-sm text-blue-700">
                            These details will appear on all invoices and
                            receipts sent to your customers. Ensure they are
                            accurate for tax compliance.
                        </p>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* LEFT COLUMN */}
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <label className="block text-sm font-medium text-gray-900">
                            Business Logo
                        </label>
                        <div className="relative mt-2 w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex text-center items-center justify-center bg-slate-50 hover:border-green-400 transition-colors cursor-pointer group overflow-hidden">
                            {logoPreview || logoUrl ? (
                                <>
                                    <Image
                                        src={logoPreview || logoUrl}
                                        alt="Business Logo"
                                        fill
                                        className="rounded-lg object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                        <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                            Change Logo
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center space-y-2 p-4">
                                    <CloudUpload
                                        size={32}
                                        className="stroke-green-500"
                                    />
                                    <p className="font-medium text-gray-600">
                                        Upload file
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Square image (PNG, JPG)
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                onChange={handleLogoFileSelect}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {logoUrl || logoPreview
                                ? "Upload a new logo to replace the current one"
                                : "Upload a logo for your documents and invoices"}
                        </p>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="w-full md:w-2/3 space-y-5">
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
                                className="mt-1 outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-900"
                            >
                                Support Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                placeholder="billing@company.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-gray-900"
                            >
                                Physical Address
                            </label>
                            <input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="mt-1 outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 resize-none"
                                placeholder="Building Name, Street, City"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                This address will be displayed on your generated
                                invoices.
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={role === "manager"}
                    className="mt-6 btn btn-md btn-ghost flex items-center bg-green-500 text-white hover:bg-green-600 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {hasExistingBusiness
                        ? "Update Business"
                        : "Create Business"}
                </button>
                {/* <p className="mt-3 text-xs text-gray-500">
                    Only admins/manager can modify business settings.
                </p> */}
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
        </section>
    );
};

export default BusinessSettingsForm;
