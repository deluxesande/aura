export default function CategoryBox({
    id,
    category,
    icon: Icon,
    active,
    onCategoryClick,
}: CategoryBox) {
    return (
        <div
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-4 cursor-pointer ${
                active ? "bg-green-500" : "bg-white"
            }`}
            onClick={() => onCategoryClick(id)}
        >
            <Icon size={20} color={active ? "white" : "#6b7280"} />
            <p
                className={`font-medium text-lg ${
                    active ? "text-white" : "text-gray-500"
                }`}
            >
                {category}
            </p>
        </div>
    );
}
