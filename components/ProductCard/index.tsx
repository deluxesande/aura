import Image from "next/image";
import { ProductCardProps } from "@/utils/typeDefinition";

export default function ProductCard({
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
        <div
            className="bg-white shadow-md rounded-lg overflow-hidden w-56 cursor-pointer group transition-all hover:shadow-lg relative border border-gray-100"
            onClick={onAddToCart}
        >
            <div className="w-56 h-56 relative overflow-hidden bg-gray-50">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {isTemplate && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 z-10">
                        {variantsCount || variants?.length || 0} Variants
                    </div>
                )}
            </div>
            <div className="p-4 bg-white">
                <div className="flex justify-between items-start gap-2">
                    <p className="text-sm text-gray-900 font-bold truncate flex-1">
                        {name}
                    </p>
                    <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg whitespace-nowrap ${
                            displayQuantity <= 5
                                ? "bg-red-50 text-red-500"
                                : "bg-gray-50 text-gray-500"
                        }`}
                    >
                        {displayQuantity} PCS
                    </span>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-gray-900 text-sm">
                        {isTemplate ? `From Ksh ${minPrice}` : `Ksh ${price}`}
                    </span>
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                            inStock || (isTemplate && displayQuantity > 0)
                                ? "text-green-500"
                                : "text-red-400"
                        }`}
                    >
                        {inStock || (isTemplate && displayQuantity > 0)
                            ? "In Stock"
                            : "Sold Out"}
                    </span>
                </div>
            </div>
        </div>
    );
}
