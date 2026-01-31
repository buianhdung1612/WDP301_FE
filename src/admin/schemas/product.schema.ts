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
    images: z.array(z.any()).min(2, "Vui lòng chọn tối thiểu 2 hình ảnh"),
    status: z.string().default("active"),
    category: z.array(z.string()).optional().default([]),
    attributes: z.array(z.string()).optional().default([]),
    variants: z.array(variantSchema).optional().default([]),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
