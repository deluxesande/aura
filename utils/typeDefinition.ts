interface CategoryBox {
    category: string;
    itemCount: number;
    icon: React.ElementType;
    active?: boolean;
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
