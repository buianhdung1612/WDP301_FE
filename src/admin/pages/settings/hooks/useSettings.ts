import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getSettingGeneral, updateSettingGeneral,
    getSettingShipping, updateSettingShipping,
    getSettingPayment, updateSettingPayment,
    getSettingLoginSocial, updateSettingLoginSocial,
    getSettingAppPassword, updateSettingAppPassword
} from "../../../api/setting.api";
import { toast } from "react-toastify";

/** Generic Setting Hook Factory */
const createSettingHook = (key: string, getFn: any) => {
    return () => useQuery({
        queryKey: [key],
        queryFn: async () => {
            const res = await getFn();
            return res.data;
        }
    });
};

const createUpdateSettingHook = (key: string, updateFn: any) => {
    return () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (data: any) => updateFn(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [key] });
                toast.success("Cập nhật cài đặt thành công!");
            },
            onError: () => {
                toast.error("Cập nhật cài đặt thất bại!");
            }
        });
    };
};

export const useSettingGeneral = createSettingHook("setting-general", getSettingGeneral);
export const useUpdateSettingGeneral = createUpdateSettingHook("setting-general", updateSettingGeneral);

export const useSettingShipping = createSettingHook("setting-shipping", getSettingShipping);
export const useUpdateSettingShipping = createUpdateSettingHook("setting-shipping", updateSettingShipping);

export const useSettingPayment = createSettingHook("setting-payment", getSettingPayment);
export const useUpdateSettingPayment = createUpdateSettingHook("setting-payment", updateSettingPayment);

export const useSettingLoginSocial = createSettingHook("setting-social", getSettingLoginSocial);
export const useUpdateSettingLoginSocial = createUpdateSettingHook("setting-social", updateSettingLoginSocial);

export const useSettingAppPassword = createSettingHook("setting-app-password", getSettingAppPassword);
export const useUpdateSettingAppPassword = createUpdateSettingHook("setting-app-password", updateSettingAppPassword);
