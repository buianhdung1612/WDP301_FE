import { IBrand, ISelectOption } from "./types";

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

export const DemoData: IBrand[] = [
    {
        brandId: 1,
        name: "Royal Canin",
        description: "Thương hiệu thức ăn cho thú cưng hàng đầu thế giới",
        logoUrl: "https://example.com/brands/royal-canin-logo.png",
        altImage: "Royal Canin Logo",
        websiteUrl: "https://www.royalcanin.com",
        isActive: false,
        isDeleted: false,
        createdAt: "2026-01-16T08:08:46.224397",
        updatedAt: "2026-01-16T08:08:46.224397",
        createdBy: "system",
        updatedBy: "system"
    },
    {
        brandId: 2,
        name: "Pedigree",
        description: "Thức ăn cho chó với công thức dinh dưỡng cân bằng",
        logoUrl: "https://example.com/brands/pedigree-logo.png",
        altImage: "Pedigree Logo",
        websiteUrl: "https://www.pedigree.com",
        isActive: false,
        isDeleted: false,
        createdAt: "2026-01-16T08:08:46.238539",
        updatedAt: "2026-01-16T08:08:46.238539",
        createdBy: "system",
        updatedBy: "system"
    },
];
