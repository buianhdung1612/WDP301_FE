import axios from "axios";

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
    return axios.get("/api/v1/client/pet/my-pets");
};
