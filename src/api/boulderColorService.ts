import api from "@/lib/api";

export const boulderColorService = {
  list: <T = any>(params: Record<string, unknown> = {}) =>
    api.post<T>("/api/boulderColor/list", params).then((r) => r.data),

  batchSave: <T = any>(rows: any[]) =>
    api.post<T>("/api/boulderColor/batchSave", rows).then((r) => r.data),

  batchDelete: <T = any>(rows: any[]) =>
    api.post<T>("/api/boulderColor/batchDelete", rows).then((r) => r.data),
};
