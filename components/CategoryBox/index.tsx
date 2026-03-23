import { CategoryBoxProps } from "@/utils/typeDefinition";

export default function CategoryBox({
    id,
    category,
    active,
    onCategoryClick,
}: CategoryBoxProps) {
    return (
        <div
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-4 cursor-pointer ${
                active ? "bg-green-500" : "bg-white"
            }`}
            onClick={() => onCategoryClick(id)}
        >
            <p
                className={`font-medium text-sm ${
                    active ? "text-white" : "text-gray-500"
                }`}
            >
                {category}
            </p>
        </div>
    );
}
