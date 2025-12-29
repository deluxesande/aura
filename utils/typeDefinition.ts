interface CategoryBox {
    id: string;
    category: string;
    active?: boolean;
    onCategoryClick: (categoryId: string) => void;
}

interface InfoCard {
    title: string;
    number: number | string;
    icon: React.ElementType;
}

interface ProductCardProps {
    image: string;
    name: string;
    quantity: number;
    price: number;
    inStock: boolean;
    onAddToCart: () => void;
}
