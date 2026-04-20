import api from "@/lib/api";

export const gymDetailService = {
  getGym: <T = any>(gym_id: number) =>
    api.post<T>("/api/gymDetail/getGym", { gym_id }).then((r) => r.data),

  save: <T = any>(formData: FormData) =>
    api.post<T>("/api/gymDetail/save", formData).then((r) => r.data),

  update: <T = any>(formData: FormData) =>
    api.post<T>("/api/gymDetail/update", formData).then((r) => r.data),
};
