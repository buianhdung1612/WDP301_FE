import { apiApp } from "../../api";

export const getBoardingCageDetail = (id: string) => {
  return apiApp.get(`/api/v1/client/cage/boarding-cages/${id}`);
};
