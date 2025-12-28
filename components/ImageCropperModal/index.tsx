import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, ZoomIn, Check } from "lucide-react";
import { getCroppedImg } from "@/utils/canvasUtils";

interface ImageCropperModalProps {
    isOpen: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropperModal({
    isOpen,
    imageSrc,
    onClose,
    onCropComplete,
}: ImageCropperModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onCropCompleteCallback = useCallback(
        (_croppedArea: any, _croppedAreaPixels: any) => {
            setCroppedAreaPixels(_croppedAreaPixels);
        },
        []
    );

    const handleSave = async () => {
        if (imageSrc && croppedAreaPixels) {
            setIsLoading(true);
            try {
                const croppedImage = await getCroppedImg(
                    imageSrc,
                    croppedAreaPixels
                );
                if (croppedImage) {
                    onCropComplete(croppedImage);
                }
                onClose();
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Crop Image</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-gray-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // 1:1 Square aspect ratio
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteCallback}
                        onZoomChange={setZoom}
                    />
                </div>

                {/* Controls */}
                <div className="p-4 bg-white border-t border-gray-100 space-y-4">
                    <div className="flex items-center gap-4">
                        <ZoomIn className="text-gray-400 w-5 h-5" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                        >
                            {isLoading ? "Processing..." : <>Crop</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
