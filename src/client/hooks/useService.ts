import { useQuery } from "@tanstack/react-query";
import { getServices } from "../api/service.api";

export const useServices = (params?: any) => {
    return useQuery({
        queryKey: ["client-services", params],
        queryFn: () => getServices(params),
        select: (res: any) => res.data || [],
    });
};
