import { IProduct, ISelectOption } from "./types";

export const COLORS = {
    primary: '#1C252E',
    secondary: '#637381',
    border: '#919eab33',
    borderLight: 'rgba(145 158 171 / 20%)',
    borderMedium: 'rgba(145 158 171 / 40%)',
    borderHover: '#919eab29',
    borderDisabled: '#919eabcc',
    background: '#fff',
    backgroundLight: '#F4F6F8',
    success: '#00A76F',
    disabled: '#919EAB',
    shadow: '0 0 2px 0 rgba(145 158 171 / 20%), 0 12px 24px -4px rgba(145 158 171 / 12%)',
};

export const STATUS_OPTIONS: ISelectOption[] = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Tạm dừng' },
    { value: 'draft', label: 'Bản nháp' }
];

export const STOCK_OPTIONS: ISelectOption[] = [
    { value: 'instock', label: 'Còn hàng' },
    { value: 'lowstock', label: 'Sắp hết' },
    { value: 'outofstock', label: 'Hết hết' }
];

export const DemoData: IProduct[] = [
    { id: 1, product: "Urban Explorer Sneakers", category: "Accessories", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-29T09:36:00"), stock: 0, price: 83.74, status: "draft" },
    { id: 2, product: "Classic Leather Loafers", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-28T08:36:00"), stock: 72, price: 97.14, status: "active" },
    { id: 3, product: "Mountain Trekking Boots", category: "Apparel", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-27T07:36:00"), stock: 10, price: 68.71, status: "inactive" },
    { id: 4, product: "Elegance Stiletto Heels", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-26T06:36:00"), stock: 72, price: 85.21, status: "draft" },
    { id: 5, product: "Comfy Running Shoes", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-25T05:36:00"), stock: 25, price: 54.30, status: "active" },
    { id: 6, product: "Retro High-Top Kicks", category: "Accessories", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-24T04:36:00"), stock: 0, price: 120.00, status: "draft" },
    { id: 7, product: "Professional Oxford Shoes", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-23T10:20:00"), stock: 45, price: 110.50, status: "inactive" },
    { id: 8, product: "Summer Beach Sandals", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-22T14:15:00"), stock: 150, price: 29.99, status: "active" },
    { id: 9, product: "Winter Fur Boots", category: "Apparel", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-21T11:45:00"), stock: 5, price: 145.00, status: "draft" },
    { id: 10, product: "Canvas Slip-Ons", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-20T09:00:00"), stock: 88, price: 42.15, status: "active" },
    { id: 11, product: "Leather Combat Boots", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-19T16:30:00"), stock: 12, price: 159.00, status: "active" },
    { id: 12, product: "Performance Cross-Trainers", category: "Accessories", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-18T13:20:00"), stock: 0, price: 89.90, status: "draft" },
    { id: 13, product: "Luxury Velvet Slippers", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-17T15:10:00"), stock: 30, price: 199.99, status: "active" },
    { id: 14, product: "Lightweight Walking Shoes", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-16T08:40:00"), stock: 64, price: 65.00, status: "active" },
    { id: 15, product: "Formal Patent Leather", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-15T17:55:00"), stock: 18, price: 135.25, status: "draft" },
    { id: 16, product: "Athletic Cleats", category: "Accessories", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-14T10:10:00"), stock: 50, price: 78.45, status: "active" },
    { id: 17, product: "Casual Suede Chukka", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-13T12:00:00"), stock: 42, price: 92.00, status: "active" },
    { id: 18, product: "Waterproof Rain Boots", category: "Apparel", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-12T07:25:00"), stock: 0, price: 49.50, status: "draft" },
    { id: 19, product: "Breathable Mesh Flats", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-11T14:40:00"), stock: 120, price: 38.00, status: "active" },
    { id: 20, product: "Vintage Suede Sneakers", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-10T09:15:00"), stock: 33, price: 87.60, status: "active" },
    { id: 21, product: "Designer Platform Slides", category: "Accessories", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-09T11:20:00"), stock: 15, price: 250.00, status: "draft" },
    { id: 22, product: "All-Terrain Hiking Shoes", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-08T08:05:00"), stock: 22, price: 129.99, status: "active" },
    { id: 23, product: "Minimalist Ballet Flats", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-07T16:45:00"), stock: 55, price: 59.00, status: "active" },
    { id: 24, product: "Handcrafted Moccasins", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-06T10:30:00"), stock: 8, price: 140.00, status: "draft" },
    { id: 25, product: "Elite Cycling Shoes", category: "Accessories", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-05T13:10:00"), stock: 19, price: 185.50, status: "active" },
    { id: 26, product: "Industrial Safety Boots", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-04T07:50:00"), stock: 40, price: 115.00, status: "active" },
    { id: 27, product: "Gladiator Strappy Sandals", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-03T15:20:00"), stock: 0, price: 45.75, status: "draft" },
    { id: 28, product: "Classic Court Sneakers", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-02T11:00:00"), stock: 95, price: 70.00, status: "active" },
    { id: 29, product: "Evening Satin Pumps", category: "Accessories", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-12-01T18:30:00"), stock: 14, price: 168.00, status: "active" },
    { id: 30, product: "Wool Lined Clogs", category: "Shoes", image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp", createdAt: new Date("2025-11-30T09:40:00"), stock: 27, price: 55.20, status: "draft" },
];
