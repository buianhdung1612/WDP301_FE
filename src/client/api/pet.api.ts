import { apiApp } from "../../api";

export interface Pet {
    _id: string;
    name: string;
    type: string;
    breed: string;
    weight: number;
    age: number;
    color: string;
    gender: string;
    notes?: string;
    avatar?: string;
    status: string;
}

export const getMyPets = () => {
    return apiApp.get("/api/v1/client/pet/my-pets");
};
