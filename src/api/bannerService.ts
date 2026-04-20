import api from "@/lib/api";

export const bannerService = {
  list: <T = any>(params: Record<string, unknown> = {}) =>
    api.post<T>("/api/banner/list", params).then((r) => r.data),

  batchSave: <T = any>(formData: FormData) =>
    api.post<T>("/api/banner/batchSave", formData).then((r) => r.data),

  batchDelete: <T = any>(rows: any[]) =>
    api.post<T>("/api/banner/batchDelete", rows).then((r) => r.data),
};
