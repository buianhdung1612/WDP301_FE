import { z } from "zod";

export const serviceSchema = z.object({
    name: z.string().min(1, "Tên dịch vụ không được để trống"),
    slug: z.string().optional(),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
    description: z.string().optional(),
    duration: z.number().min(1, "Thời lượng phải lớn hơn 0"),
    petTypes: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một loại thú cưng"),
    pricingType: z.enum(["fixed", "by-weight"]),
    basePrice: z.number().optional(),
    priceList: z.array(z.object({
        label: z.string().optional(),
        value: z.number().optional()
    })).optional(),
    status: z.enum(["active", "inactive"]),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
