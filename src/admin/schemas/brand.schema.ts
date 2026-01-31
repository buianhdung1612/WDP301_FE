import { z } from "zod";

export const createBrandSchema = z.object({
    name: z
        .string()
        .min(1, "Tên thương hiệu không được để trống")
        .max(100),

    description: z.string().optional(),

    avatar: z.string().min(1, "Vui lòng chọn logo thương hiệu"),

    status: z.enum(["active", "inactive"]),
});

export type CreateBrandFormValues = z.infer<typeof createBrandSchema>;
