export default function CategoryBox({
    category,
    itemCount,
    icon: Icon,
    active,
}: CategoryBox) {
    return (
        <div
            className={`px-6 py-4 rounded-lg flex items-center justify-center gap-4 cursor-pointer ${
                active ? "bg-[#deefe7]" : "bg-white"
            }`}
        >
            <div className="w-14 h-14 rounded-lg flex items-center justify-center">
                <Icon
                    size={45}
                    className={active ? "text-black" : "text-[#159A9C]"}
                />
            </div>
            <div>
                <p className="font-bold text-lg text-black">{category}</p>
                <p className="font-semibold text-sm text-black">
                    {itemCount} Items
                </p>
            </div>
        </div>
    );
}
