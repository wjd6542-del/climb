import api from "@/lib/api";

export interface RouteListParams {
  take?: number;
  gym_id?: number;
  route_id?: number;
  [key: string]: unknown;
}

export interface RoutePageListParams {
  gym_id?: number | string;
  keyword?: string;
  climb_type?: string;
  environment?: string;
  page: number;
  limit: number;
}

export const routeService = {
  list: <T = any>(params: RouteListParams = {}) =>
    api.post<T>("/api/route/list", params).then((r) => r.data),

  pageList: <T = any>(params: RoutePageListParams) =>
    api.post<T>("/api/route/pageList", params).then((r) => r.data),

  save: <T = any>(formData: FormData) =>
    api.post<T>("/api/route/save", formData).then((r) => r.data),

  update: <T = any>(formData: FormData) =>
    api.post<T>("/api/route/update", formData).then((r) => r.data),

  delete: <T = any>(id: number) =>
    api.post<T>("/api/route/delete", { id }).then((r) => r.data),
};
