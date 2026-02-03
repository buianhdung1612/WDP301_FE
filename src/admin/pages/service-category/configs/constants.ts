import { ISelectOption } from "./types";

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

export const BOOKING_TYPE_OPTIONS: ISelectOption[] = [
    { value: 'HOTEL', label: 'Khách sạn' },
    { value: 'STANDALONE', label: 'Dịch vụ lẻ' },
    { value: 'BOTH', label: 'Cả hai' },
];
