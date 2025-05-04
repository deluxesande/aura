import Image from "next/image";

const MobileProductCard = ({
    image,
    name,
    quantity,
    price,
    inStock,
    onAddToCart,
}: {
    image: string;
    name: string;
    quantity: number;
    price: number;
    inStock: boolean;
    onAddToCart: () => void;
}) => {
    return (
        <div className="w-screen pr-12" onClick={onAddToCart}>
            <div className="w-full p-3 rounded-md bg-white shadow-sm border border-gray-200 flex items-center gap-4">
                {/* Image */}
                <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                    <Image
                        src={image}
                        alt={name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h2 className="text-base font-semibold line-clamp-1">
                            {name}
                        </h2>
                        <span className="text-sm text-gray-400">
                            {quantity}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-green-600 font-medium text-sm">
                            ${price}
                        </p>
                        <p
                            className={`text-sm font-medium ${
                                inStock ? "text-green-600" : "text-red-500"
                            }`}
                        >
                            {inStock ? "In stock" : "Out of stock"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileProductCard;
