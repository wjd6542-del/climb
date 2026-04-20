import api from "@/lib/api";

export const langPackService = {
  list: <T = any>() => api.post<T>("/api/langPack/list").then((r) => r.data),

  translateText: <T = any>(text: string) =>
    api
      .post<T>("/api/langPack/translateText", { text })
      .then((r) => r.data),

  batchSave: <T = any>(rows: any[]) =>
    api.post<T>("/api/langPack/batchSave", rows).then((r) => r.data),

  batchDelete: <T = any>(rows: any[]) =>
    api.post<T>("/api/langPack/batchDelete", rows).then((r) => r.data),
};
