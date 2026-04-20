import api from "@/lib/api";

export interface GymListParams {
  take?: number;
  keyword?: string;
  [key: string]: unknown;
}

export interface GymPageListParams {
  is_active?: string;
  keyword?: string;
  sido?: string;
  types?: number[];
  amenities?: number[];
  page: number;
  limit: number;
}

export const gymService = {
  list: <T = any>(params: GymListParams = {}) =>
    api.post<T>("/api/gyms/list", params).then((r) => r.data),

  pageList: <T = any>(params: GymPageListParams) =>
    api.post<T>("/api/gyms/pageList", params).then((r) => r.data),

  get: <T = any>(id: number) =>
    api.post<T>(`/api/gyms/${id}`, { id }).then((r) => r.data),

  save: <T = any>(payload: Record<string, unknown>) =>
    api.post<T>("/api/gyms/save", payload).then((r) => r.data),

  update: <T = any>(payload: Record<string, unknown>) =>
    api.post<T>("/api/gyms/update", payload).then((r) => r.data),

  delete: <T = any>(id: number) =>
    api.post<T>("/api/gyms/delete", { id }).then((r) => r.data),

  sidoGroup: <T = any>() =>
    api.post<T>("/api/gyms/sidoGroup").then((r) => r.data),
};
