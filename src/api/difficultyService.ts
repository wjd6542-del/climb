import api from "@/lib/api";

export const difficultyService = {
  list: <T = any>(params: Record<string, unknown> = {}) =>
    api.post<T>("/api/difficulty/list", params).then((r) => r.data),

  batchSave: <T = any>(rows: any[]) =>
    api.post<T>("/api/difficulty/batchSave", rows).then((r) => r.data),

  batchDelete: <T = any>(rows: any[]) =>
    api.post<T>("/api/difficulty/batchDelete", rows).then((r) => r.data),
};
