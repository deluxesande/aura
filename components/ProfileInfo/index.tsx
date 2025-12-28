import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import ImageCropperModal from "@/components/ImageCropperModal"; // Import the cropper
import { FloatingPortal } from "@floating-ui/react";

const ProfileInfo: React.FC = () => {
    const { user } = useUser();
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    // Cropper State
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

    React.useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "John");
            setLastName(user.lastName || "Doe");
            setEmail(
                user.emailAddresses[0]?.emailAddress || "johndoe@gmail.com"
            );
        }
    }, [user]);

    const [status, setStatus] = useState("");
    const profileImage = user?.hasImage
        ? user?.imageUrl
        : "https://www.svgrepo.com/show/535711/user.svg";

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user) return;

        const promise = async () => {
            await user.update({
                firstName,
                lastName,
            });

            // If the update was successful, reload the user data
            await user.reload();
        };

        toast.promise(promise, {
            loading: "Saving...",
            success: "Profile updated successfully!",
            error: "Failed to update profile. Please try again.",
        });
    };

    const handleSendVerification = (event: React.FormEvent) => {
        event.preventDefault();
        // Add send verification logic here
        toast.success("Verification email sent");
    };

    // 1. Intercept File Selection -> Open Cropper
    const handleImageFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!user || !file) return;

        // Create a URL for the selected file
        const objectUrl = URL.createObjectURL(file);
        setTempImageSrc(objectUrl);
        setIsCropModalOpen(true);

        // Reset input so the same file can be selected again if needed
        event.target.value = "";
    };

    // 2. Handle Cropped Image -> Upload to Clerk
    const handleCropComplete = async (croppedBlob: Blob) => {
        if (!user) return;

        // Convert Blob to File
        const croppedFile = new File([croppedBlob], "profile-image.jpg", {
            type: "image/jpeg",
        });

        const promise = async () => {
            try {
                // Update the user's profile image in Clerk
                await user.setProfileImage({ file: croppedFile });
            } catch (error) {
                throw error;
            }
        };

        toast.promise(promise(), {
            loading: "Uploading image...",
            success: "Profile image updated successfully!",
            error: "Failed to upload profile image. Please try again.",
        });
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account&apos;s profile information and email
                    address.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="flex flex-col lg:flex-row items-center space-x-6">
                    <div className="flex lg:flex-col items-center mx-10">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full mb-4 overflow-hidden flex items-center justify-center relative ring-2 ring-gray-100">
                                <Image
                                    src={profileImage}
                                    width={90}
                                    height={90}
                                    alt={`${user?.firstName} Profile Image`}
                                    className="rounded-full object-cover w-full h-full"
                                />
                            </div>
                            <label
                                htmlFor="profileImage"
                                className="cursor-pointer btn btn-sm btn-ghost text-black flex items-center bg-green-400 px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
                            >
                                Upload Profile
                            </label>
                            {/* Input triggers the modal, not the upload directly */}
                            <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 mt-6 lg:mt-0 w-full">
                        <div className="flex flex-col md:flex-row w-full justify-evenly gap-4 items-center">
                            <div className="w-full">
                                <label
                                    htmlFor="firstname"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    First Name
                                </label>
                                <input
                                    id="firstname"
                                    name="firstname"
                                    type="text"
                                    className="mt-1 block w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    required
                                    autoFocus
                                    autoComplete="given-name"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="lastname"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Last Name
                                </label>
                                <input
                                    id="lastname"
                                    name="lastname"
                                    type="text"
                                    className="mt-1 block w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    required
                                    autoComplete="family-name"
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="mt-1 block w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2 cursor-not-allowed opacity-70"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled
                            />
                            {/* Existing verification logic hidden */}
                            <div className="hidden">
                                <p className="text-sm mt-2 text-gray-800">
                                    Your email address is unverified.
                                    <button
                                        form="send-verification"
                                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Click here to re-send the verification
                                        email.
                                    </button>
                                </p>
                                {status === "verification-link-sent" && (
                                    <p className="mt-2 font-medium text-sm text-green-600">
                                        A new verification link has been sent to
                                        your email address.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        type="submit"
                        className="w-full lg:w-auto btn btn-md btn-ghost text-black flex items-center bg-green-400 px-4 py-2 rounded-lg hover:bg-green-500"
                    >
                        Save
                    </button>
                    {status === "profile-updated" && (
                        <p className="text-sm text-gray-600 self-center">
                            Saved.
                        </p>
                    )}
                </div>
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

export default ProfileInfo;
