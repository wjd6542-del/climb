import api from "@/lib/api";

export const settingsService = {
  list: <T = any>(params: Record<string, unknown> = {}) =>
    api.post<T>("/api/settings/list", params).then((r) => r.data),

  getGradeList: <T = any>() =>
    api.post<T>("/api/settings/getGradeList").then((r) => r.data),

  keyGroup: <T = any>() =>
    api.post<T>("/api/settings/keyGroup").then((r) => r.data),

  batchSave: <T = any>(rows: any[]) =>
    api.post<T>("/api/settings/batchSave", rows).then((r) => r.data),

  batchDelete: <T = any>(rows: any[]) =>
    api.post<T>("/api/settings/batchDelete", rows).then((r) => r.data),
};
