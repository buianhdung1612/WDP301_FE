import { IBlogCategory, ISelectOption } from "./types";

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
];

export const DemoData: IBlogCategory[] = [
    {
        id: 1,
        title: "Công nghệ",
        image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp",
        parentName: "",
        view: 15420,
        createdAt: new Date('2024-01-15T08:30:00'),
        status: 'active',
    },
    {
        id: 2,
        title: "Trí tuệ nhân tạo",
        image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp",
        parentName: "Công nghệ",
        view: 8900,
        createdAt: new Date('2024-02-10T14:20:00'),
        status: 'active',
    },
    {
        id: 3,
        title: "Lập trình",
        image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp",
        parentName: "Công nghệ",
        view: 4500,
        createdAt: new Date('2024-03-05T10:00:00'),
        status: 'inactive',
    },
    {
        id: 4,
        title: "Kinh doanh",
        image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp",
        parentName: "",
        view: 12300,
        createdAt: new Date('2024-03-12T09:15:00'),
        status: 'active',
    },
    {
        id: 5,
        title: "Quản lý doanh nghiệp",
        image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp",
        parentName: "Kinh doanh",
        view: 3200,
        createdAt: new Date('2024-04-01T16:45:00'),
        status: 'active',
    },
    {
        id: 6,
        title: "Sức khỏe",
        image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp",
        parentName: "",
        view: 7800,
        createdAt: new Date('2024-04-10T11:30:00'),
        status: 'inactive',
    },
    {
        id: 7,
        title: "Dinh dưỡng",
        image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp",
        parentName: "Sức khỏe",
        view: 2100,
        createdAt: new Date('2024-05-20T08:00:00'),
        status: 'active',
    },
    {
        id: 8,
        title: "Tập luyện",
        image: "https://api-prod-minimal-v700.pages.dev/assets/images/m-product/product-1.webp",
        parentName: "Sức khỏe",
        view: 5400,
        createdAt: new Date('2024-06-01T13:00:00'),
        status: 'active',
    }
];
