<template>
  <div class="page-wrapper">
    <div>
      <!-- 타이틀 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold">{{ $t("정보") }}</h1>
        <button
          class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
          @click="openCreate"
        >
          <i class="fa-solid fa-plus"></i> {{ $t("글쓰기") }}
        </button>
      </div>

      <!-- 검색 영역 -->
      <div
        class="mb-8 flex flex-col md:flex-row md:flex-wrap gap-4 md:items-end"
      >
        <div class="relative w-full md:w-[400px]">
          <DateRangePicker
            v-model="dateRange"
            :minuteStep="5"
            :showQuickButtons="true"
            @change="reset"
          />
        </div>

        <div class="w-full md:w-[220px]">
          <SearchSelect
            v-model="search.gym_id"
            :options="gymList"
            labelKey="name"
            valueKey="id"
            :placeholder="$t('장소를 선택하세요')"
            class="bg-white border border-gray-200 rounded-lg h-[40px]"
            @change="reset"
          />
        </div>

        <div class="w-full md:w-[200px]">
          <input
            v-model="search.keyword"
            class="w-full border rounded px-3 py-2 text-sm min-h-[42px]"
            :placeholder="$t('제목 검색')"
            @change="reset"
          />
        </div>
      </div>

      <InfiniteScroll :loading="isLoading" :hasMore="hasMore" @load-more="loadMore">
        <PostList
          :posts="list"
          :changeFlg="true"
          :changeHandler="openEdit"
          :deleteHandler="deletePost"
        />
      </InfiniteScroll>
    </div>

    <!-- 등록 / 수정 모달 -->
    <BaseModal
      v-model="openModal"
      :title="isEdit ? $t('수정') : $t('등록')"
      width="lg"
    >
      <template #header>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <i class="fa-solid fa-pen"></i>
            {{ isEdit ? $t("수정") : $t("등록") }}
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="openModal = false"
          ></button>
        </div>
      </template>

      <div class="space-y-4 text-sm">
        <!-- 위치 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">{{ $t("위치") }}</label>
          <div class="flex-1">
            <SearchSelect
              v-model="form.gym_id"
              :options="gymList"
              labelKey="name"
              valueKey="id"
              :placeholder="$t('장소 선택')"
              class="bg-white border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <!-- 제목 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">{{ $t("제목") }}</label>
          <div class="flex-1">
            <input
              v-model="form.title"
              :placeholder="$t('제목 입력')"
              class="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <!-- 내용 -->
        <div class="flex items-start gap-4">
          <label class="w-28 text-sm font-medium mt-2">{{ $t("내용") }}</label>
          <div class="flex-1">
            <Editor v-model="form.content" />
          </div>
        </div>

        <!-- 별점 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">{{ $t("별점") }}</label>
          <div class="flex text-lg">
            <i
              v-for="n in 5"
              :key="n"
              class="cursor-pointer"
              :class="
                n <= form.rating
                  ? 'fa-solid fa-star text-yellow-400'
                  : 'fa-regular fa-star text-gray-300'
              "
              @click="form.rating = n"
            ></i>
          </div>
        </div>

        <!-- 파일 업로드 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">{{ $t("이미지") }}</label>
          <div class="flex-1">
            <BaseImage :multiple="true" @change="handleFiles" />
          </div>
        </div>

        <!-- 기존 이미지 -->
        <div
          v-if="isEdit && existingImages.length"
          class="grid grid-cols-3 gap-3"
        >
          <div v-for="img in existingImages" :key="img.id" class="relative">
            <img
              :src="`${apiUrl}${img.file_url}`"
              class="w-full h-28 object-cover rounded"
            />
            <button
              @click="removeExistingImage(img)"
              class="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-red-500"
            >
              {{ $t("삭제") }}
            </button>
          </div>
        </div>

        <!-- 신규 이미지 -->
        <div class="grid grid-cols-3 gap-3">
          <div v-for="(img, i) in newPreviews" :key="i" class="relative">
            <img :src="img" class="w-full h-28 object-cover rounded" />
            <button
              @click="removeNewImage(i)"
              class="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-red-500"
            >
              {{ $t("삭제") }}
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 mt-6">
          <button
            class="px-4 py-2 text-sm border rounded"
            @click="openModal = false"
          >
            {{ $t("취소") }}
          </button>

          <button
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            @click="submit"
          >
            {{ isEdit ? $t("수정") : $t("등록") }}
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useToast } from "vue-toastification";

import { gymService } from "@/api/gymService";
import { gymPostService } from "@/api/gymPostService";
import { useListPage } from "@/composables/useListPage";
import { useImageUpload } from "@/composables/useImageUpload";
import { alertStore } from "@/plugins/alert.store";

import SearchSelect from "@/components/common/SearchSelect.vue";
import Editor from "@/components/common/Editor.vue";
import DateRangePicker from "@/components/common/DateRangePicker.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import PostList from "@/components/gymPost/PostList.vue";
import BaseImage from "@/components/common/BaseImage.vue";
import InfiniteScroll from "@/components/common/InfiniteScroll.vue";

import type { Gym, GymPost, GymPostForm } from "@/types";

const toast = useToast();
const apiUrl = import.meta.env.VITE_API_URL as string;

const gymList = ref<Gym[]>([]);
const openModal = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);

const dateRange = ref<{ start: Date | null; end: Date | null }>({
  start: null,
  end: null,
});
const search = reactive({ keyword: "", gym_id: "" as number | string });

const form = reactive<GymPostForm>({
  gym_id: "",
  title: "",
  content: "",
  rating: 0,
});

const {
  existingImages,
  newFiles,
  newPreviews,
  deleteImageIds,
  handleFiles,
  removeNewImage,
  removeExistingImage,
  setExistingImages,
  resetUpload,
  appendFilesToFormData,
} = useImageUpload();

const { list, isLoading, hasMore, load, loadMore, reset } = useListPage<
  GymPost,
  { gym_id: number | string; keyword: string; startDate?: string; endDate?: string }
>({
  fetcher: (params) => gymPostService.pageList<GymPost[]>(params),
  buildParams: () => {
    const params: {
      gym_id: number | string;
      keyword: string;
      startDate?: string;
      endDate?: string;
    } = {
      gym_id: search.gym_id,
      keyword: search.keyword,
    };
    if (dateRange.value.start) {
      params.startDate = dateRange.value.start.toISOString();
    }
    if (dateRange.value.end) {
      params.endDate = dateRange.value.end.toISOString();
    }
    return params;
  },
});

function resetForm() {
  form.gym_id = "";
  form.title = "";
  form.content = "";
  form.rating = 0;
  resetUpload();
  editId.value = null;
}

function openCreate() {
  resetForm();
  isEdit.value = false;
  openModal.value = true;
}

function openEdit(data: GymPost) {
  resetForm();
  isEdit.value = true;
  editId.value = data.id;
  form.gym_id = data.gym_id;
  form.title = data.title;
  form.content = data.content;
  form.rating = data.rating;
  setExistingImages(data.images || []);
  openModal.value = true;
}

async function submit() {
  try {
    const formData = new FormData();
    formData.append("gym_id", String(form.gym_id));
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("rating", String(form.rating));

    if (isEdit.value && editId.value) {
      formData.append("id", String(editId.value));
      formData.append("deleteImageIds", JSON.stringify(deleteImageIds.value));
    }

    appendFilesToFormData(formData);

    if (isEdit.value) {
      await gymPostService.update(formData);
      toast.success("수정 완료");
    } else {
      await gymPostService.save(formData);
      toast.success("등록 완료");
    }

    openModal.value = false;
    reset();
  } catch (err: any) {
    toast.error(err?.message || "처리 실패");
  }
}

async function deletePost(data: GymPost) {
  const ok = await alertStore.openConfirm(
    `${data.title} 정보를 삭제하시겠습니까?`,
    "삭제 확인",
  );
  if (!ok) return;

  await gymPostService.delete(data.id);
  toast.success("삭제처리 되었습니다");
  reset();
}

async function loadGymsList() {
  gymList.value = await gymService.list<Gym[]>({});
}

onMounted(async () => {
  await loadGymsList();
  await load(false);
});
</script>
