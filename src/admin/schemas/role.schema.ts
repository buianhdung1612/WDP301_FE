import { z } from "zod";

export const roleSchema = z.object({
    name: z.string().min(1, "Vui lòng nhập tên nhóm quyền"),
    description: z.string().optional(),
    isStaff: z.boolean(),
    skillSet: z.array(z.string()),
    permissions: z.array(z.string()),
    status: z.enum(["active", "inactive"]),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
