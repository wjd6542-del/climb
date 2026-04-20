import api from "@/lib/api";

export const gymTypeService = {
  list: <T = any>() => api.post<T>("/api/gymType/list").then((r) => r.data),

  allList: <T = any>() =>
    api.post<T>("/api/gymType/allList").then((r) => r.data),

  batchSave: <T = any>(rows: any[]) =>
    api.post<T>("/api/gymType/batchSave", rows).then((r) => r.data),

  batchDelete: <T = any>(rows: any[]) =>
    api.post<T>("/api/gymType/batchDelete", rows).then((r) => r.data),
};
