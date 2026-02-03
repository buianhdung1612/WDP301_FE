export interface IService {
    _id: string;
    name: string;
    slug: string;
    categoryId: string | { _id: string; name: string };
    description: string;
    duration: number;
    petTypes: string[];
    pricingType: 'fixed' | 'by-weight';
    basePrice?: number;
    priceList?: Array<{ label: string; value: number }>;
    status: 'active' | 'inactive';
    createdAt: Date;
}

export interface ISelectOption {
    value: string;
    label: string;
}
