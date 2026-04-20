import { ref, Ref } from "vue";
import { useToast } from "vue-toastification";

export interface ExistingImage {
  id: number;
  file_url?: string;
  [key: string]: unknown;
}

export interface UseImageUploadOptions {
  maxSize?: number;
  useFileReader?: boolean;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { maxSize = 5 * 1024 * 1024, useFileReader = true } = options;
  const toast = useToast();

  const existingImages: Ref<ExistingImage[]> = ref([]);
  const deleteImageIds: Ref<number[]> = ref([]);
  const newFiles: Ref<File[]> = ref([]);
  const newPreviews: Ref<string[]> = ref([]);

  function handleFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`파일은 ${Math.floor(maxSize / 1024 / 1024)}MB 이하만 가능`);
        return;
      }

      newFiles.value.push(file);

      if (useFileReader) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.value.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.value.push(URL.createObjectURL(file));
      }
    });
  }

  function removeNewImage(index: number) {
    newFiles.value.splice(index, 1);
    newPreviews.value.splice(index, 1);
  }

  function removeExistingImage(img: ExistingImage) {
    deleteImageIds.value.push(img.id);
    existingImages.value = existingImages.value.filter((i) => i.id !== img.id);
  }

  function setExistingImages(images: ExistingImage[] = []) {
    existingImages.value = images;
  }

  function resetUpload() {
    existingImages.value = [];
    deleteImageIds.value = [];
    newFiles.value = [];
    newPreviews.value = [];
  }

  function appendFilesToFormData(formData: FormData, fieldName = "images") {
    newFiles.value.forEach((file) => {
      formData.append(fieldName, file);
    });
  }

  return {
    existingImages,
    deleteImageIds,
    newFiles,
    newPreviews,
    handleFiles,
    removeNewImage,
    removeExistingImage,
    setExistingImages,
    resetUpload,
    appendFilesToFormData,
  };
}
