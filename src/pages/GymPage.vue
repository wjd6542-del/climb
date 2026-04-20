<template>
  <div class="page-wrapper">
    <div>
      <!-- 타이틀 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold"></h1>
        <button
          class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
          @click="openCreate"
        >
          <i class="fa-solid fa-plus"></i> 장소등록
        </button>
      </div>

      <!-- 검색 영역 -->
      <div class="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <SearchSelect
            v-model="search.sido"
            :options="sidoList"
            labelKey="sido"
            valueKey="sido"
            placeholder="시도를 선택하세요"
            class="bg-white border border-gray-200 rounded-lg h-[40px]"
            @change="reset"
          />
        </div>

        <div>
          <input
            v-model="search.keyword"
            class="w-full border rounded px-3 py-2 text-sm min-h-[42px]"
            placeholder="장소명 / 주소"
            @change="reset"
          />
        </div>

        <MultiCheck
          placeholder="구분을 선택하세요"
          label=""
          :items="gymTypes"
          v-model="search.types"
          textKey="name"
          @change="reset"
        />

        <MultiCheck
          placeholder="편의시설을 선택하세요"
          label=""
          :items="amenities"
          v-model="search.amenities"
          textKey="text"
          @change="reset"
        />

        <div>
          <button
            class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
            @click="openMapModal = true"
          >
            지도 열기
          </button>
        </div>
      </div>

      <InfiniteScroll :loading="isLoading" :hasMore="hasMore" @load-more="loadMore">
        <GymList
          :gyms="list"
          :changeFlg="true"
          :mainFlg="true"
          :deleteHandler="deleteGym"
          :bookmarkHandler="onBookmark"
          :changeHandler="openEdit"
          :detailHandler="onDetail"
        />
      </InfiniteScroll>
    </div>

    <!-- 등록/수정 모달 -->
    <BaseModal
      v-model="openModal"
      :title="'지도 확인'"
      width="lg"
      :closeOnOverlay="false"
    >
      <template #header>
        <h2 class="text-lg font-semibold">
          <i class="fa-solid fa-plus"></i> 클라이밍 장소 등록
        </h2>
      </template>
      <div class="space-y-4 text-sm">
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">짐 이름</label>
          <input
            v-model="form.name"
            class="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="예: 더클라임 성수"
          />
        </div>

        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">주소</label>
          <input
            v-model="form.address"
            class="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="주소 검색"
          />
          <button
            class="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
            @click="searchAddress"
          >
            <i class="fa-solid fa-magnifying-glass"></i>주소검색
          </button>
        </div>

        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">상세주소</label>
          <input
            v-model="form.address_detail"
            class="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="상세주소"
          />
        </div>

        <div class="grid grid-cols-[112px_1fr] gap-4 items-start">
          <label class="text-sm font-medium leading-8">타입</label>
          <div class="flex flex-wrap gap-2">
            <Toggle
              v-for="t in gymTypes"
              :key="t.id"
              :label="t.name"
              v-model="form.types"
              :value="t.id"
            />
          </div>
        </div>

        <div class="grid grid-cols-[112px_1fr] gap-4 items-start">
          <label class="text-sm font-medium leading-8">편의시설</label>
          <div class="flex flex-wrap gap-2">
            <Toggle
              v-for="a in amenities"
              :key="a.id"
              :label="a.text"
              v-model="form.amenities"
              :value="a.id"
            />
          </div>
        </div>

        <div class="grid grid-cols-[112px_1fr] gap-4 items-start">
          <label class="text-sm font-medium leading-8"
            >색상 순서
            <i
              class="fa-solid fa-circle-question"
              v-tooltip="'볼더링/지구력 난이도 순서별 색상 설정'"
            ></i
          ></label>
          <div class="flex flex-wrap gap-2">
            <MultiColorSelect
              v-model="form.gymBoulderColors"
              :options="boulderColors"
              labelKey="name"
              valueKey="id"
              colorKey="code"
            />
          </div>
        </div>

        <div class="grid grid-cols-[112px_1fr] gap-4 items-start">
          <label class="text-sm font-medium leading-8"
            >난이도 종류
            <i
              class="fa-solid fa-circle-question"
              v-tooltip="'볼더링/지구력 난이도 종류 설정'"
            ></i
          ></label>
          <div class="flex flex-wrap gap-2">
            <MultiCheck
              placeholder="구분을 선택하세요"
              label=""
              :items="difficulties"
              v-model="form.gymDifficulties"
              textKey="name"
            />
          </div>
        </div>

        <div class="flex items-start gap-4">
          <label class="w-28 text-sm font-medium mt-1">운영시간</label>
          <div class="flex-1 space-y-1 text-sm">
            <TimeRow label="평일" v-model="form.hours.weekday" />
            <TimeRow label="주말" v-model="form.hours.weekend" />
            <TimeRow label="공휴일" v-model="form.hours.holiday" />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">운영 여부</label>
          <button
            type="button"
            @click="toggleActive"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300"
            :class="form.is_active === 'y' ? 'bg-blue-500' : 'bg-gray-300'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300"
              :class="
                form.is_active === 'y' ? 'translate-x-6' : 'translate-x-1'
              "
            />
          </button>
          <span class="text-sm text-gray-600">
            {{ form.is_active === "y" ? "운영중" : "운영중지" }}
          </span>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 mt-6">
          <button
            class="px-4 py-2 text-sm border rounded"
            @click="openModal = false"
          >
            닫기
          </button>
          <button
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            @click="saveLocation"
          >
            저장
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- 상세 모달 -->
    <BaseModal
      v-model="openDetailModal"
      :title="'상세정보'"
      width="md"
      :closeOnOverlay="false"
    >
      <template #header>
        <h2 class="text-lg font-semibold">
          <i class="fa-solid fa-file-lines"></i> 상세정보
        </h2>
      </template>

      <div class="space-y-4 text-sm">
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">장소명</label>
          <input
            v-model="detailForm.name"
            class="flex-1 border rounded px-3 py-2 text-sm"
            disabled
          />
        </div>

        <div class="flex items-start gap-4">
          <label class="w-28 text-sm font-medium mt-2">정보</label>
          <div class="flex-1">
            <Editor v-model="detailForm.description" />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">일일 이용금액</label>
          <div class="flex-1">
            <input
              type="number"
              v-model="detailForm.day_pass_price"
              class="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">이미지</label>
          <div class="flex-1">
            <BaseImage :multiple="true" @change="handleFiles" />
          </div>
        </div>

        <div
          v-if="isDetailEdit && existingImages.length"
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
            @click="openDetailModal = false"
          >
            닫기
          </button>
          <button
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            @click="saveDetail"
          >
            저장
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- 맵모달 -->
    <BaseModal v-model="openMapModal" :title="'지도 확인'" width="full">
      <template #header>
        <h2 class="text-lg font-semibold">
          <i class="fa-solid fa-map"></i> 지도 확인
        </h2>
      </template>
      <div class="space-y-4">
        <KakaoMap :markers="gymMap" class="h-[800px] rounded-2xl shadow-xl" />
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useToast } from "vue-toastification";

import { gymService } from "@/api/gymService";
import { gymDetailService } from "@/api/gymDetailService";
import { gymTypeService } from "@/api/gymTypeService";
import { amenitiesService } from "@/api/amenitiesService";
import { boulderColorService } from "@/api/boulderColorService";
import { difficultyService } from "@/api/difficultyService";

import { useListPage } from "@/composables/useListPage";
import { useImageUpload } from "@/composables/useImageUpload";
import { useKakaoPostcode } from "@/composables/useKakaoPostcode";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { alertStore } from "@/plugins/alert.store";

import TimeRow from "@/components/common/TimeRow.vue";
import GymList from "@/components/gym/GymList.vue";
import MultiCheck from "@/components/common/MultiCheck.vue";
import KakaoMap from "@/components/common/KakaoMap.vue";
import Editor from "@/components/common/Editor.vue";
import SearchSelect from "@/components/common/SearchSelect.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import MultiColorSelect from "@/components/common/MultiColorSelect.vue";
import BaseImage from "@/components/common/BaseImage.vue";
import InfiniteScroll from "@/components/common/InfiniteScroll.vue";

import type {
  Amenity,
  BoulderColor,
  Difficulty,
  Gym,
  GymDetail,
  GymDetailForm,
  GymForm,
  GymType,
  HoursMap,
  SidoGroupItem,
} from "@/types";

const toast = useToast();
const bookmarkStore = useBookmarkStore();
const apiUrl = import.meta.env.VITE_API_URL as string;

const amenities = ref<Amenity[]>([]);
const gymTypes = ref<GymType[]>([]);
const sidoList = ref<SidoGroupItem[]>([]);
const gymMap = ref<Gym[]>([]);
const boulderColors = ref<BoulderColor[]>([]);
const difficulties = ref<Difficulty[]>([]);

const openModal = ref(false);
const openMapModal = ref(false);
const openDetailModal = ref(false);

const isEdit = ref(false);
const editId = ref<number | null>(null);

const isDetailEdit = ref(false);
const detailId = ref<number | null>(null);

const search = reactive<{
  is_active: string;
  keyword: string;
  sido: string;
  types: number[];
  amenities: number[];
}>({
  is_active: "",
  keyword: "",
  sido: "",
  types: [],
  amenities: [],
});

function createEmptyHours(): HoursMap {
  const entry = { open_time: "10:00", close_time: "22:00", is_closed: false };
  return {
    weekday: { ...entry },
    weekend: { ...entry },
    holiday: { ...entry },
  };
}

function createEmptyForm(): GymForm {
  return {
    name: "",
    address: "",
    address_detail: "",
    types: [],
    amenities: [],
    gymBoulderColors: [],
    gymDifficulties: [],
    hours: createEmptyHours(),
    is_active: "y",
    lat: 0,
    lon: 0,
    post: "",
    sido: "",
  };
}

function createEmptyDetailForm(): GymDetailForm {
  return { gym_id: 0, name: "", description: "", day_pass_price: 0 };
}

const form = reactive<GymForm>(createEmptyForm());
const detailForm = reactive<GymDetailForm>(createEmptyDetailForm());

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
} = useImageUpload({ useFileReader: false });

const postcode = useKakaoPostcode();

const { list, isLoading, hasMore, load, loadMore, reset } = useListPage<
  Gym,
  {
    is_active: string;
    keyword: string;
    sido: string;
    types: number[];
    amenities: number[];
  }
>({
  fetcher: (params) => gymService.pageList<Gym[]>(params),
  buildParams: () => ({ ...search }),
});

function toggleActive() {
  form.is_active = form.is_active === "y" ? "n" : "y";
}

function resetForm() {
  Object.assign(form, createEmptyForm());
}

function openCreate() {
  isEdit.value = false;
  editId.value = null;
  resetForm();
  openModal.value = true;
}

function openEdit(data: Gym) {
  resetForm();

  const hours = createEmptyHours();
  hours.weekday.open_time = "";
  hours.weekday.close_time = "";
  hours.weekend.open_time = "";
  hours.weekend.close_time = "";
  hours.holiday.open_time = "";
  hours.holiday.close_time = "";

  data.operating_hours?.forEach((h) => {
    const target = hours[h.type];
    if (target) {
      target.open_time = h.open_time;
      target.close_time = h.close_time;
      target.is_closed = h.is_closed ?? false;
    }
  });

  form.name = data.name || "";
  form.address = data.address || "";
  form.address_detail = data.address_detail || "";
  form.types = data.gymTypeMap?.map((t) => t.type_id) || [];
  form.amenities = data.gymAmenityMaps?.map((a) => a.amenity_id) || [];
  form.gymBoulderColors =
    data.gymBoulderColors?.map((c) => c.boulder_color_id) || [];
  form.gymDifficulties =
    data.gymDifficulties?.map((d) => d.difficulty_id) || [];
  form.hours = hours;
  form.is_active = data.is_active || "y";
  form.lat = data.lat || 0;
  form.lon = data.lon || 0;
  form.post = data.post || "";
  form.sido = data.sido || "";

  editId.value = data.id;
  isEdit.value = true;
  openModal.value = true;
}

function searchAddress() {
  postcode.open({
    onAddress: (data, coords) => {
      form.address = data.address;
      form.post = data.zonecode;
      form.sido = data.sido;
      if (coords) {
        form.lat = coords.lat;
        form.lon = coords.lon;
      }
    },
  });
}

async function saveLocation() {
  try {
    const payload: Record<string, unknown> = { ...form };
    if (isEdit.value && editId.value) {
      payload.id = editId.value;
      await gymService.update(payload);
    } else {
      await gymService.save(payload);
    }

    toast.success("저장되었습니다");
    openModal.value = false;
    reset();
  } catch (e) {
    toast.error("저장 실패");
  }
}

function resetDetailForm() {
  Object.assign(detailForm, createEmptyDetailForm());
  detailId.value = null;
  isDetailEdit.value = false;
  resetUpload();
}

async function onDetail(data: Gym) {
  resetDetailForm();
  openDetailModal.value = true;

  const res = await gymDetailService.getGym<GymDetail | null>(data.id);
  if (res) {
    isDetailEdit.value = true;
    detailId.value = res.id;
    detailForm.gym_id = res.id;
    detailForm.description = res.description || "";
    detailForm.day_pass_price = res.day_pass_price || 0;
    setExistingImages(res.images || []);
  }

  detailForm.name = data.name;
  detailForm.gym_id = data.id;
}

async function saveDetail() {
  try {
    const formData = new FormData();
    formData.append("gym_id", String(detailForm.gym_id));
    formData.append("description", detailForm.description);
    formData.append("day_pass_price", String(detailForm.day_pass_price));
    formData.append("deleteImageIds", JSON.stringify(deleteImageIds.value));
    appendFilesToFormData(formData);

    if (isDetailEdit.value && detailId.value) {
      formData.append("id", String(detailId.value));
      await gymDetailService.update(formData);
    } else {
      await gymDetailService.save(formData);
    }

    toast.success("저장 완료");
    openDetailModal.value = false;
  } catch (e) {
    toast.error("저장 실패");
  }
}

async function deleteGym(data: Gym) {
  const ok = await alertStore.openConfirm(
    `${data.name} 정보를 삭제하시겠습니까?`,
    "삭제 확인",
  );
  if (!ok) return;

  try {
    await gymService.delete(data.id);
    toast.success("삭제 처리 되었습니다");
    reset();
  } catch (e) {
    toast.error("삭제 실패");
  }
}

function onBookmark(data: Gym) {
  bookmarkStore.add({
    key: `${data.id}_0`,
    id: data.id,
    route_id: null,
    name: data.name,
    address: data.address,
    address_detail: data.address_detail,
  });
  toast.success(`[${data.name}] 북마크 적용되었습니다`);
}

onMounted(async () => {
  const [types, ams, sidos, markers, colors, diffs] = await Promise.all([
    gymTypeService.list<GymType[]>(),
    amenitiesService.list<Amenity[]>(),
    gymService.sidoGroup<SidoGroupItem[]>(),
    gymService.list<Gym[]>(),
    boulderColorService.list<BoulderColor[]>(),
    difficultyService.list<Difficulty[]>(),
  ]);

  gymTypes.value = types;
  amenities.value = ams;
  sidoList.value = sidos;
  gymMap.value = markers;
  boulderColors.value = colors;
  difficulties.value = diffs;

  await load(false);
});
</script>
