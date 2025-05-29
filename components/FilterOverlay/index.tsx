import { AppState } from "@/store";
import { Product } from "@/utils/typesDefinitions";
import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface FilterOverlayProps {
    setFilterPopUp: React.Dispatch<React.SetStateAction<boolean>>;
    filterPopUp: boolean;
    setFilteredProducts?: (products: any[]) => void;
    toggleFilterPopUp?: () => void;
}

const MAX_PRICE = 3000; // Maximum price for the range slider

export default function FilterOverlay({
    setFilterPopUp,
    filterPopUp,
    setFilteredProducts,
    toggleFilterPopUp,
}: FilterOverlayProps) {
    const [priceRange, setPriceRange] = useState<[number, number]>([
        0,
        MAX_PRICE,
    ]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const originalProducts = useSelector(
        (state: AppState) => state.product.products
    );

    const [categories, setCategories] = useState<
        { id: string; name: string }[]
    >([]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const applyFilters = () => {
        if (!setFilteredProducts || !toggleFilterPopUp) return;

        const filteredProducts = originalProducts.filter((product: Product) => {
            const inPriceRange =
                product.price >= priceRange[0] &&
                product.price <= priceRange[1];

            const inCategory =
                selectedCategories.length === 0 ||
                selectedCategories.includes(product.Category.name);

            return inPriceRange && inCategory;
        });

        setFilteredProducts(filteredProducts);
        toggleFilterPopUp();
    };

    const clearFilters = () => {
        if (!setFilteredProducts || !toggleFilterPopUp) return;

        setPriceRange([0, MAX_PRICE]);
        setSelectedCategories([]);
        setFilteredProducts(originalProducts);
        toggleFilterPopUp();
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("/api/category");
                setCategories(
                    response.data.map((category: any) => ({
                        id: category.id,
                        name: category.name,
                    }))
                );
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="fixed inset-0 top-[88px] h-fit lg:absolute lg:left-[-250px] lg:top-[70px] lg:w-[30px] lg:min-w-[300px] bg-white lg:border lg:border-gray-300 rounded-lg shadow-lg p-4 whitespace-nowrap overflow-hidden text-ellipsis z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <div
                    className="flex space-x-2"
                    onClick={() => setFilterPopUp(!filterPopUp)}
                >
                    <X size={20} className="cursor-pointer" />
                </div>
            </div>

            {/* Price Filter */}
            <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Price Range</h4>
                <div className="flex flex-col space-y-2">
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[0]}
                        onChange={(e) =>
                            setPriceRange([
                                Number(e.target.value),
                                priceRange[1],
                            ])
                        }
                        className="w-full appearance-none bg-green-100 h-2 rounded-full accent-green-500 outline-none"
                    />
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) =>
                            setPriceRange([
                                priceRange[0],
                                Number(e.target.value),
                            ])
                        }
                        className="w-full appearance-none bg-green-100 h-2 rounded-full accent-green-500 outline-none"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Min: ${priceRange[0]}</span>
                        <span>Max: ${priceRange[1]}</span>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Category</h4>
                <div className="flex flex-col space-y-2">
                    {categories.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                            No categories available.
                        </p>
                    ) : (
                        categories.map((category) => (
                            <label
                                key={category.id}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(
                                        category.name
                                    )}
                                    onChange={() =>
                                        handleCategoryChange(category.name)
                                    }
                                    className="form-checkbox h-4 w-4 text-green-500 border-green-300 focus:ring-green-500 rounded"
                                />
                                <span className="text-sm text-gray-700">
                                    {category.name}
                                </span>
                            </label>
                        ))
                    )}
                </div>
            </div>

            {/* Apply Filters Button */}
            <div className="mt-4 space-y-2">
                <button
                    onClick={clearFilters}
                    className="btn btn-md btn-ghost text-black flex items-center bg-slate-50 w-full"
                >
                    Clear Filters
                </button>
                <button
                    onClick={applyFilters}
                    className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}
