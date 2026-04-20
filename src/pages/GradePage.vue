<template>
  <div class="page-wrapper">
    <div>
      <!-- 타이틀 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold">난이도</h1>
        <button
          class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
          @click="openCreate"
        >
          <i class="fa-solid fa-plus"></i> 등록
        </button>
      </div>

      <!-- 검색 영역 -->
      <div
        class="mb-8 flex flex-col md:flex-row md:flex-wrap gap-4 md:items-end"
      >
        <div class="w-full md:w-[220px]">
          <SearchSelect
            v-model="search.gym_id"
            :options="gymList"
            labelKey="name"
            valueKey="id"
            placeholder="장소를 선택하세요"
            class="bg-white border border-gray-200 rounded-lg h-[40px]"
            @change="reset"
          />
        </div>

        <div class="w-full md:w-[220px]">
          <SearchSelect
            v-model="search.environment"
            :options="environmentType"
            labelKey="text"
            valueKey="value"
            placeholder="내외 구분을 선택하세요"
            class="bg-white border border-gray-200 rounded-lg h-[40px]"
            @change="reset"
          />
        </div>

        <div class="w-full md:w-[220px]">
          <SearchSelect
            v-model="search.climb_type"
            :options="climbType"
            labelKey="text"
            valueKey="value"
            placeholder="구분을 선택하세요"
            class="bg-white border border-gray-200 rounded-lg h-[40px]"
            @change="reset"
          />
        </div>
      </div>

      <InfiniteScroll :loading="isLoading" :hasMore="hasMore" @load-more="loadMore">
        <RouteList
          :routs="list"
          :changeFlg="true"
          :bookmarkHandler="onBookmark"
          :changeHandler="openEdit"
          :deleteHandler="deleteData"
        />
      </InfiniteScroll>
    </div>

    <!-- 등록 / 수정 모달 -->
    <BaseModal
      v-model="openModal"
      :title="isEdit ? '난이도 수정' : '난이도 등록'"
      width="lg"
    >
      <template #header>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <i class="fa-solid fa-pen"></i>
            {{ isEdit ? "난이도 수정" : "난이도 등록" }}
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="openModal = false"
          ></button>
        </div>
      </template>

      <div class="p-1 space-y-4 text-sm">
        <!-- 위치 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">위치</label>
          <div class="flex-1">
            <SearchSelect
              v-model="form.gym_id"
              :options="gymList"
              labelKey="name"
              valueKey="id"
              placeholder="장소 선택"
              class="bg-white border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <!-- 루트 구분 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">루트구분</label>
          <div class="flex-1">
            <SearchSelect
              v-model="setting"
              :options="AUTO_SET"
              labelKey="text"
              valueKey="value"
              placeholder="루트 선택"
              class="bg-white border border-gray-200 rounded-lg"
              @change="applyAutoSetting"
            />
          </div>
        </div>

        <!-- 리드 루트명 -->
        <div class="flex items-center gap-4" v-if="form.climb_type === 'LEAD'">
          <label class="w-28 text-sm font-medium mt-2">리드 루트명</label>
          <div class="flex-1">
            <input
              type="text"
              v-model="form.route_name"
              placeholder="루트명 입력"
              class="flex-1 w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <!-- 난이도 정보 -->
        <div class="flex items-center gap-4">
          <template v-if="form.climb_type === 'LEAD'">
            <label class="w-28 text-sm font-medium mt-2">리드 난이도</label>
            <div class="flex-1">
              <SearchSelect
                v-model="form.difficulty"
                :options="leadGrade"
                labelKey="name"
                valueKey="name"
                placeholder="리드 난이도 선택"
                class="bg-white border border-gray-200 rounded-lg"
              />
            </div>
          </template>
          <template v-else>
            <label class="w-28 text-sm font-medium mt-2">볼더링 난이도</label>
            <div class="flex-1">
              <SearchSelect
                v-model="form.difficulty"
                :options="boulderGrade"
                labelKey="name"
                valueKey="name"
                placeholder="볼더링 난이도 선택"
                class="bg-white border border-gray-200 rounded-lg"
              />
            </div>
          </template>
        </div>

        <!-- 볼더링 색상 -->
        <div
          class="flex items-center gap-4"
          v-if="form.climb_type === 'BOULDER'"
        >
          <label class="w-28 text-sm font-medium mt-2">볼더링 색상정보</label>
          <div class="flex-1">
            <SearchColorSelect
              v-model="form.route_color"
              :options="routeColor"
              labelKey="name"
              valueKey="code"
              placeholder="색상 선택"
              class="bg-white border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <!-- 리드 바위타입 -->
        <div
          class="flex items-center gap-4"
          v-if="form.environment === 'NATURE'"
        >
          <label class="w-28 text-sm font-medium mt-2">바위 타입</label>
          <div class="flex-1">
            <SearchSelect
              v-model="form.rock_type"
              :options="rockType"
              labelKey="text"
              valueKey="value"
              placeholder="내외 구분 선택"
              class="bg-white border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <!-- 메모 -->
        <div class="flex items-start gap-4">
          <label class="w-28 text-sm font-medium mt-2">메모</label>
          <div class="flex-1">
            <Editor v-model="form.memo" />
          </div>
        </div>

        <!-- 파일 업로드 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">이미지</label>
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
              삭제
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
              삭제
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
            취소
          </button>

          <button
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            @click="submit"
          >
            {{ isEdit ? "수정" : "등록" }}
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
import { routeService } from "@/api/routeService";
import { settingsService } from "@/api/settingsService";
import { boulderColorService } from "@/api/boulderColorService";
import { difficultyService } from "@/api/difficultyService";

import { useListPage } from "@/composables/useListPage";
import { useImageUpload } from "@/composables/useImageUpload";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { alertStore } from "@/plugins/alert.store";

import SearchSelect from "@/components/common/SearchSelect.vue";
import SearchColorSelect from "@/components/common/SearchColorSelect.vue";
import Editor from "@/components/common/Editor.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseImage from "@/components/common/BaseImage.vue";
import RouteList from "@/components/route/RouteList.vue";
import InfiniteScroll from "@/components/common/InfiniteScroll.vue";

import type {
  BoulderColor,
  ClimbType,
  Difficulty,
  Environment,
  Gym,
  Route,
  RouteForm,
} from "@/types";

const AUTO_SET = [
  { text: "자연 - 리드", value: "NATURE-LEAD", icon: "fa-solid fa-mountain text-gray-500" },
  { text: "자연 - 볼더링", value: "NATURE-BOULDER", icon: "fa-solid fa-hill-rockslide text-yellow-500" },
  { text: "실내 - 리드", value: "INDOOR-LEAD", icon: "fa-solid fa-hand-fist text-gray-500" },
  { text: "실내 - 볼더링", value: "INDOOR-BOULDER", icon: "fa-solid fa-building text-yellow-500" },
  { text: "실내 - 스피드", value: "INDOOR-SPEED", icon: "fa-solid fa-stopwatch text-red-500" },
  { text: "실외 - 리드", value: "OUTDOOR-LEAD", icon: "fa-solid fa-mountain text-gray-500" },
  { text: "실외 - 볼더링", value: "OUTDOOR-BOULDER", icon: "fa-solid fa-building text-yellow-500" },
  { text: "실외 - 스피드", value: "OUTDOOR-SPEED", icon: "fa-solid fa-stopwatch text-red-500" },
  { text: "자연 - 빙벽", value: "NATURE-ICE", icon: "fa-solid fa-icicles text-blue-500" },
];

const toast = useToast();
const bookmarkStore = useBookmarkStore();
const apiUrl = import.meta.env.VITE_API_URL as string;

const gymList = ref<Gym[]>([]);
const climbType = ref<any[]>([]);
const environmentType = ref<any[]>([]);
const rockType = ref<any[]>([]);
const routeColor = ref<BoulderColor[]>([]);
const boulderGrade = ref<Difficulty[]>([]);
const leadGrade = ref<Difficulty[]>([]);

const openModal = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);
const setting = ref("");

const search = reactive({
  keyword: "",
  gym_id: "" as number | string,
  climb_type: "" as ClimbType | "",
  environment: "" as Environment | "",
});

const form = reactive<RouteForm>(createEmptyForm());

function createEmptyForm(): RouteForm {
  return {
    gym_id: 0,
    climb_type: "",
    environment: "",
    difficulty: "",
    memo: "",
    route_name: "",
    route_color: "",
    rock_type: "",
    height: 0,
    is_active: "y",
  };
}

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
  Route,
  {
    gym_id: number | string;
    keyword: string;
    climb_type: ClimbType | "";
    environment: Environment | "";
  }
>({
  fetcher: (params) => routeService.pageList<Route[]>(params),
  buildParams: () => ({
    gym_id: search.gym_id,
    keyword: search.keyword,
    climb_type: search.climb_type,
    environment: search.environment,
  }),
});

function applyAutoSetting() {
  const [env, type] = setting.value.split("-");
  form.environment = env as Environment;
  form.climb_type = type as ClimbType;
}

function resetForm() {
  Object.assign(form, createEmptyForm());
  resetUpload();
  editId.value = null;
  setting.value = "";
}

function openCreate() {
  resetForm();
  isEdit.value = false;
  openModal.value = true;
}

function openEdit(data: Route) {
  resetForm();
  isEdit.value = true;
  editId.value = data.id;

  form.gym_id = data.gym_id;
  form.climb_type = data.climb_type;
  form.environment = data.environment;
  form.difficulty = data.difficulty || "";
  form.memo = data.memo || "";
  form.route_name = data.route_name || "";
  form.route_color = data.route_color || "";
  form.rock_type = data.rock_type || "";
  form.height = data.height || 0;
  form.is_active = data.is_active || "y";

  setExistingImages(data.images || []);
  openModal.value = true;
}

async function submit() {
  try {
    const formData = new FormData();
    formData.append("gym_id", String(form.gym_id));
    formData.append("climb_type", form.climb_type);
    formData.append("environment", form.environment);
    formData.append("difficulty", form.difficulty);
    formData.append("memo", form.memo);
    formData.append("route_name", form.route_name);
    formData.append("route_color", form.route_color);
    formData.append("rock_type", form.rock_type);
    formData.append("height", String(form.height));
    formData.append("is_active", form.is_active);

    if (isEdit.value && editId.value) {
      formData.append("id", String(editId.value));
      formData.append("deleteImageIds", JSON.stringify(deleteImageIds.value));
    }

    appendFilesToFormData(formData);

    if (isEdit.value) {
      await routeService.update(formData);
      toast.success("수정 완료");
    } else {
      await routeService.save(formData);
      toast.success("등록 완료");
    }

    openModal.value = false;
    reset();
  } catch (err: any) {
    toast.error(err?.message || "처리 실패");
  }
}

function onBookmark(data: Route) {
  if (!data.gym) return;
  bookmarkStore.add({
    key: `${data.gym.id}_${data.id}`,
    id: data.gym.id,
    route_id: data.id,
    name: `${data.gym.name} - ${data.difficulty}`,
    address: data.gym.address,
    address_detail: data.gym.address_detail,
  });
  toast.success(`[${data.gym.name} - ${data.difficulty}] 북마크 적용되었습니다`);
}

async function deleteData(data: Route) {
  const gymName = data.gym?.name ?? "";
  const ok = await alertStore.openConfirm(
    `${gymName} - ${data.difficulty} 정보를 삭제하시겠습니까?`,
    "삭제 확인",
  );
  if (!ok) return;

  await routeService.delete(data.id);
  toast.success("삭제처리 되었습니다");
  reset();
}

async function loadGymsList() {
  gymList.value = await gymService.list<Gym[]>({});
}

async function loadSettings() {
  const data = await settingsService.getGradeList<{
    climb_type: any[];
    environment_type: any[];
    rock_type: any[];
  }>();
  climbType.value = data.climb_type;
  environmentType.value = data.environment_type;
  rockType.value = data.rock_type;
}

async function loadColor() {
  routeColor.value = await boulderColorService.list<BoulderColor[]>();
}

async function loadGrade() {
  const list = await difficultyService.list<Difficulty[]>();
  boulderGrade.value = list.filter((row) => row.code === "BOULDER");
  leadGrade.value = list.filter((row) => row.code === "LEAD");
}

onMounted(async () => {
  await loadGymsList();
  await loadSettings();
  await loadColor();
  await loadGrade();
  await load(false);
});
</script>
