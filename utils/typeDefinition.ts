interface CategoryBox {
    category: string;
    itemCount: number;
    icon: React.ElementType;
    active?: boolean;
}

interface ProductCardProps {
    image: string;
    name: string;
    quantity: number;
    price: string;
    inStock: boolean;
}
