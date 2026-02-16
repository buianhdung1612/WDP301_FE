import { z } from "zod";

export const settingGeneralSchema = z.object({
    websiteName: z.string().min(1, "Vui lòng nhập tên website"),
    logo: z.string().optional(),
    phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
    email: z.string().email("Email không hợp lệ"),
    address: z.string().min(1, "Vui lòng nhập địa chỉ"),
    copyright: z.string().optional(),
    defaultPassword: z.string().min(6, "Mật khẩu mặc định ít nhất 6 ký tự"),
    facebook: z.string().url("Link không hợp lệ").optional().or(z.literal("")),
    instagram: z.string().url("Link không hợp lệ").optional().or(z.literal("")),
    youtube: z.string().url("Link không hợp lệ").optional().or(z.literal("")),
    serviceColors: z.array(z.object({
        serviceId: z.string().min(1),
        color: z.string().min(1)
    })).optional(),
});

export type SettingGeneralFormValues = z.infer<typeof settingGeneralSchema>;
