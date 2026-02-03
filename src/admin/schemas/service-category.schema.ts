import { z } from "zod";

export const serviceCategorySchema = z.object({
    name: z.string().min(1, "Tên danh mục không được để trống"),
    slug: z.string().optional(),
    parentId: z.string().optional(),
    description: z.string().optional(),
    avatar: z.string().optional(),
    bookingTypes: z.enum(["HOTEL", "STANDALONE", "BOTH"]),
    petTypes: z.array(z.string()),
    status: z.enum(["active", "inactive"]),
});

export type ServiceCategoryFormValues = z.infer<typeof serviceCategorySchema>;
