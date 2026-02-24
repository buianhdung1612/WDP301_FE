import { apiApp } from "../../api";

export interface Pet {
    _id: string;
    name: string;
    type: "dog" | "cat";
    breed?: string;
    weight?: number;
    age?: number;
    color?: string;
    gender?: "male" | "female" | "unknown";
    notes?: string;
    avatar?: string;
    healthStatus?: "accepted" | "rejected";
    status: string;
}

export interface PetPayload {
    name: string;
    type: "dog" | "cat";
    breed?: string;
    weight?: number;
    age?: number;
    color?: string;
    gender?: "male" | "female" | "unknown";
    healthStatus?: "accepted" | "rejected";
    notes?: string;
    avatar?: string;
}

export const getMyPets = () => {
    return apiApp.get("/api/v1/client/pet/my-pets");
};

export const createMyPet = (data: PetPayload) => {
    return apiApp.post("/api/v1/client/pet/my-pets", data);
};

export const updateMyPet = (id: string, data: Partial<PetPayload>) => {
    return apiApp.patch(`/api/v1/client/pet/my-pets/${id}`, data);
};
