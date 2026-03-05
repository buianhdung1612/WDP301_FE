import { apiApp } from "../../api";

export const getBoardingCageDetail = (id: string) => {
  return apiApp.get(`/api/v1/client/cage/boarding-cages/${id}`);
};

export interface BoardingCageReviewPayload {
  fullName: string;
  rating: number;
  comment: string;
}

export const getBoardingCageReviews = (id: string) => {
  return apiApp.get(`/api/v1/client/cage/boarding-cages/${id}/reviews`);
};

export const createBoardingCageReview = (id: string, payload: BoardingCageReviewPayload) => {
  return apiApp.post(`/api/v1/client/cage/boarding-cages/${id}/reviews`, payload);
};
