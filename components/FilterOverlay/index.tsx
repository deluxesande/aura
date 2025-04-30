import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface FilterOverlayProps {
    setFilterPopUp: React.Dispatch<React.SetStateAction<boolean>>;
    filterPopUp: boolean;
}

export default function FilterOverlay({
    setFilterPopUp,
    filterPopUp,
}: FilterOverlayProps) {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
                        className="w-full"
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
                        className="w-full"
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
                    {categories.map((category) => (
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
                                className="form-checkbox"
                            />
                            <span className="text-sm text-gray-600">
                                {category.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* <p className="text-stone-400 mb-4">No filters</p> */}
        </div>
    );
}
