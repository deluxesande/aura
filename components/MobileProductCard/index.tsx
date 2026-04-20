import Image from "next/image";
import { ProductCardProps } from "@/utils/typeDefinition";

export default function MobileProductCard({
    image,
    name,
    quantity,
    price,
    inStock,
    onAddToCart,
    type,
    variantsCount,
    variants,
}: ProductCardProps & { variants?: any[] }) {
    const isTemplate = type === "TEMPLATE";

    // For templates, show the lowest price available among variants
    const minPrice =
        isTemplate && variants && variants.length > 0
            ? Math.min(...variants.map((v) => v.price))
            : price;

    const displayQuantity =
        isTemplate && variants
            ? variants.reduce((sum, v) => sum + v.quantity, 0)
            : quantity;

    return (
        <div className="w-screen pr-12 cursor-pointer" onClick={onAddToCart}>
            <div className="w-full p-3 rounded-lg bg-white shadow-md border border-gray-200 flex items-center gap-4">
                {/* Image */}
                <div className="relative h-16 w-16 rounded-lg">
                    <Image
                        src={image || "https://via.placeholder.com/150"}
                        alt={name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                    />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-lg text-black max-w-36 whitespace-nowrap truncate">
                            {name}
                        </p>
                        <span
                            className={`text-sm ${displayQuantity <= 5 ? "text-red-500" : "text-gray-400"}`}
                        >
                            {displayQuantity}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-green-500 font-light text-md">
                            {isTemplate ? `From $${minPrice}` : `$${price}`}
                        </p>
                        <p
                            className={`text-sm font-light ${
                                inStock || (isTemplate && displayQuantity > 0)
                                    ? "text-green-500"
                                    : "text-red-500"
                            }`}
                        >
                            {inStock || (isTemplate && displayQuantity > 0)
                                ? "In stock"
                                : "Out of stock"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
