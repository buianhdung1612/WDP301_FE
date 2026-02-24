import { z } from "zod";

export const roleSchema = z.object({
    name: z.string().min(1, "Vui lòng nhập tên nhóm quyền"),
    description: z.string().optional(),
    isStaff: z.boolean(),
    serviceIds: z.array(z.string()),
    permissions: z.array(z.string()),
    departmentId: z.string().optional().nullable(),
    commissionRate: z.coerce.number().min(0).max(100).default(0),
    status: z.enum(["active", "inactive"]),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
