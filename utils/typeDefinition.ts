interface CategoryBox {
    id: string;
    category: string;
    icon: React.ElementType;
    active?: boolean;
    onCategoryClick: (categoryId: string) => void;
}

interface InfoCard {
    title: string;
    number: number;
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
