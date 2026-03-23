import { ProductType } from "./typesDefinitions";

export interface CategoryBoxProps {
    id: string;
    category: string;
    active?: boolean;
    onCategoryClick: (categoryId: string) => void;
}

export interface InfoCard {
    title: string;
    number: number | string;
    icon: React.ElementType;
}

export interface ProductCardProps {
    image: string;
    name: string;
    quantity: number;
    price: number;
    inStock: boolean;
    onAddToCart: () => void;
    type?: ProductType;
    variantsCount?: number;
}
