import CategoryBox from "@/components/CategoryBox";
import Navbar from "@/components/Navbar";
import {
    Store,
    LibraryBig,
    PencilRuler,
    Paperclip,
    Popcorn,
} from "lucide-react";
<Popcorn />;

export default function Page() {
    const categories = [
        { category: "All", itemCount: 200, icon: Store, active: true },
        { category: "Books", itemCount: 200, icon: LibraryBig },
        { category: "Pens", itemCount: 200, icon: PencilRuler },
        { category: "Paper", itemCount: 200, icon: Paperclip },
        { category: "Snacks", itemCount: 200, icon: Popcorn },
    ];

    return (
        <Navbar>
            {/* Category buttons */}
            <div className="flex overflow-hidden justify-between gap-4 mt-4">
                {categories.map((category) => (
                    <CategoryBox
                        key={category.category}
                        category={category.category}
                        itemCount={category.itemCount}
                        icon={category.icon}
                        active={category.active}
                    />
                ))}
            </div>
        </Navbar>
    );
}
