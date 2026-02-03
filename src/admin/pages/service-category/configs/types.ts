export interface IServiceCategory {
    _id: string;
    name: string;
    slug: string;
    description: string;
    avatar: string;
    parentId: string;
    bookingTypes: string;
    petTypes: string[];
    status: 'active' | 'inactive';
    createdAt: Date;
}

export interface ISelectOption {
    value: string;
    label: string;
}
