import { z } from "zod";

export const variantAttributeSchema = z.object({
    attrId: z.string(),
    attrType: z.string(),
    label: z.string(),
    value: z.string(),
});

export const variantSchema = z.object({
    id: z.string(),
    attributeValue: z.array(variantAttributeSchema),
    priceOld: z.string().or(z.number()).transform(v => String(v)),
    priceNew: z.string().or(z.number()).transform(v => String(v)),
    stock: z.string().or(z.number()).transform(v => String(v)),
    status: z.boolean().default(true),
});

export const createProductSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống"),
    description: z.string().optional().default(""),
    content: z.string().optional().default(""),
    position: z.string().optional().default(""),
    priceOld: z.string().or(z.number()).transform(v => String(v)),
    priceNew: z.string().or(z.number()).transform(v => String(v)),
    stock: z.string().or(z.number()).transform(v => String(v)),
    images: z.array(z.any()).min(1, "Vui lòng chọn tối thiểu 1 hình ảnh"),
    status: z.string().default("active"),
    category: z.array(z.string()).optional().default([]),
    brandId: z.string().optional().default(""),
    attributes: z.array(z.string()).optional().default([]),
    variants: z.array(variantSchema).optional().default([]),
    isFood: z.boolean().optional().default(false),
    expiryDate: z.string().optional().default(""),
}).refine((data) => {
    if (data.isFood && !data.expiryDate) return false;
    if (data.isFood && data.expiryDate) {
        const today = new Date().toISOString().split('T')[0];
        return data.expiryDate >= today;
    }
    return true;
}, {
    message: "Vui lòng chọn ngày hết hạn từ hôm nay trở đi",
    path: ["expiryDate"],
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
