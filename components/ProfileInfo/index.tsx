import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import ImageCropperModal from "@/components/ImageCropperModal"; // Import the cropper
import { FloatingPortal } from "@floating-ui/react";

const userSVG = (
    <svg
        width="58.18181818181818"
        height="58.18181818181818"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clip-path="url(#clip0_28986_197012)">
            <path
                d="M21.3353 21C23.0532 21.0001 24.7048 21.4975 25.9456 22.3887C27.1864 23.2798 27.9207 24.4958 27.9953 25.783L28.0019 27L28 29C28 29 26.2061 28.9572 25.5353 28.995L25.3353 29H6.66859C5.99582 29.0002 4.00207 29 4.00207 29L4 27H4.00192V26C4.00202 24.7115 4.66531 23.4728 5.85347 22.5422C7.04163 21.6116 8.66292 21.0609 10.3793 21.005L10.6686 21H21.3353Z"
                fill="#FFFFFF"
            ></path>
            <path
                d="M16 17.3334C19.1947 17.3334 22.1 18.2587 24.2373 19.5614C25.304 20.2147 26.216 20.9814 26.8747 21.8147C27.5227 22.6361 28 23.6174 28 24.6667C28 26.5 27.9978 26.5 27.4978 27.3147C26.7512 27.9147 24.9307 28.3121 23.884 28.5894C21.78 29.1454 18.972 29 16 29C13.028 29 10.22 29.1467 8.116 28.5894C7.06933 28.3121 5.24472 27.9147 4.49805 27.3147C4 26.5 4 26.5 4 24.6667C4 23.6174 4.47733 22.6361 5.12533 21.8147C5.784 20.9814 6.69467 20.2147 7.76267 19.5614C9.9 18.2587 12.8067 17.3334 16 17.3334ZM16 2.66675C17.7681 2.66675 19.4638 3.36913 20.714 4.61937C21.9643 5.86961 22.6667 7.5653 22.6667 9.33342C22.6667 11.1015 21.9643 12.7972 20.714 14.0475C19.4638 15.2977 17.7681 16.0001 16 16.0001C14.2319 16.0001 12.5362 15.2977 11.286 14.0475C10.0357 12.7972 9.33333 11.1015 9.33333 9.33342C9.33333 7.5653 10.0357 5.86961 11.286 4.61937C12.5362 3.36913 14.2319 2.66675 16 2.66675Z"
                fill="#FFFFFF"
            ></path>
        </g>
        <defs>
            <clipPath id="clip0_28986_197012">
                <rect
                    width="58.18181818181818"
                    height="58.18181818181818"
                    fill="#FFFFFF"
                ></rect>
            </clipPath>
        </defs>
    </svg>
);

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
        : (userSVG as unknown as string);

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
