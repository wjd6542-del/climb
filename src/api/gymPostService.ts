import api from "@/lib/api";

export interface GymPostListParams {
  take?: number;
  keyword?: string;
  [key: string]: unknown;
}

export interface GymPostPageListParams {
  gym_id?: number | string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export const gymPostService = {
  list: <T = any>(params: GymPostListParams = {}) =>
    api.post<T>("/api/gymPost/list", params).then((r) => r.data),

  pageList: <T = any>(params: GymPostPageListParams) =>
    api.post<T>("/api/gymPost/pageList", params).then((r) => r.data),

  get: <T = any>(id: number) =>
    api.post<T>(`/api/gymPost/${id}`, { id }).then((r) => r.data),

  save: <T = any>(formData: FormData) =>
    api.post<T>("/api/gymPost/save", formData).then((r) => r.data),

  update: <T = any>(formData: FormData) =>
    api.post<T>("/api/gymPost/update", formData).then((r) => r.data),

  delete: <T = any>(id: number) =>
    api.post<T>("/api/gymPost/delete", { id }).then((r) => r.data),
};
