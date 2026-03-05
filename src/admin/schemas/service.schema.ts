import { z } from "zod";

const baseServiceSchema = z.object({
    name: z.string().min(1, "Tên dịch vụ không được để trống"),
    slug: z.string().optional(),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
    description: z.string().optional(),
    procedure: z.string().optional(),
    duration: z.number().min(1, "Thời lượng dự kiến phải lớn hơn 0"),
    minDuration: z.number().min(1, "Thời lượng tối thiểu phải lớn hơn 0"),
    maxDuration: z.number().min(1, "Thời lượng tối đa phải lớn hơn 0"),
    petTypes: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một loại thú cưng"),
    pricingType: z.enum(["fixed", "by-weight"]),
    basePrice: z.number().optional(),
    priceList: z.array(z.object({
        label: z.string().optional(),
        value: z.number().optional()
    })),
    status: z.enum(["active", "inactive"]),
    images: z.array(z.string()).optional(),
});

export type ServiceFormValues = z.infer<typeof baseServiceSchema>;

export const serviceSchema = baseServiceSchema
    .refine((data) => data.minDuration <= data.duration, {
        message: "Thời lượng tối thiểu không được lớn hơn thời lượng dự kiến",
        path: ["minDuration"],
    })
    .refine((data) => data.duration <= data.maxDuration, {
        message: "Thời lượng dự kiến không được lớn hơn thời lượng tối đa",
        path: ["maxDuration"],
    });
