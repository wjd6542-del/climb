import api from "@/lib/api";

export const uploadService = {
  upload: <T = any>(formData: FormData) =>
    api.post<T>("/api/upload", formData).then((r) => r.data),
};
