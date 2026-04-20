import api from "@/lib/api";

export const amenitiesService = {
  list: <T = any>() => api.post<T>("/api/amenities/list").then((r) => r.data),

  allList: <T = any>() =>
    api.post<T>("/api/amenities/allList").then((r) => r.data),

  batchSave: <T = any>(rows: any[]) =>
    api.post<T>("/api/amenities/batchSave", rows).then((r) => r.data),

  batchDelete: <T = any>(rows: any[]) =>
    api.post<T>("/api/amenities/batchDelete", rows).then((r) => r.data),
};
