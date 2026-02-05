import { useQuery } from "@tanstack/react-query";
import { getMyPets } from "../api/pet.api";

export const useMyPets = () => {
    return useQuery({
        queryKey: ["my-pets"],
        queryFn: async () => {
            const response = await getMyPets();
            return response.data.data;
        },
        // Only fetch if we have a token? Usually handled by axios interceptor or global error handler
        // But good to keep in mind
        retry: 1
    });
};
