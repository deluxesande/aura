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
        <div className="w-screen pr-12 cursor-pointer" onClick={onAddToCart}>
            <div className="w-full p-3 rounded-md bg-white shadow-md border border-gray-200 flex items-center gap-4">
                {/* Image */}
                <div className="relative h-16 w-16 rounded-md">
                    <Image
                        src={image || "https://via.placeholder.com/150"}
                        alt={name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                    />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-lg text-black max-w-36 whitespace-nowrap truncate">
                            {name}
                        </p>
                        <span className="text-sm text-gray-400">
                            {quantity}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-green-600 font-light text-md">
                            ${price}
                        </p>
                        <p
                            className={`text-sm font-light ${
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
