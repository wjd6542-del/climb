<template>
  <div class="page-wrapper">
    <div>
      <!-- 타이틀 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold"></h1>
        <button
          class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
          @click="initForm"
        >
          <i class="fa-solid fa-plus"></i> 장소등록
        </button>
      </div>

      <!-- 검색 영역 -->
      <div class="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <SearchSelect
            v-model="search.sido"
            :options="SIDO"
            labelKey="sido"
            valueKey="sido"
            placeholder="시도를 선택하세요"
            class="bg-white border border-gray-200 rounded-lg h-[40px]"
            @change="search_list"
          />
        </div>

        <!-- 검색어 -->
        <div>
          <input
            v-model="search.keyword"
            class="w-full border rounded px-3 py-2 text-sm min-h-[42px]"
            placeholder="장소명 / 주소"
            @change="search_list"
          />
        </div>

        <!-- 클라이밍 구분 -->
        <MultiCheck
          placeholder="구분을 선택하세요"
          label=""
          :items="GYM_TYPES"
          v-model="search.types"
          textKey="name"
          @change="search_list"
        />

        <!-- 편의시설 -->
        <MultiCheck
          placeholder="편의시설을 선택하세요"
          label=""
          :items="AMENITIES"
          v-model="search.amenities"
          textKey="text"
          @change="search_list"
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

      <GymList
        :gyms="GYMS"
        :deleteHandler="deleteGym"
        :changeFlg="true"
        :bookmarkHandler="onBookmark"
        :changeHandler="saveForm"
        :detailHandler="onDetail"
      />

      <div v-if="isLoading" class="text-center py-6 text-gray-400">
        불러오는 중...
      </div>

      <div
        v-if="!hasMore && GYMS.length"
        class="text-center py-6 text-gray-300"
      >
        마지막 데이터입니다
      </div>
    </div>

    <!-- 등록 모달 -->
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
        <!-- 짐 이름 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">짐 이름</label>
          <input
            v-model="form.name"
            class="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="예: 더클라임 성수"
          />
        </div>

        <!-- 주소 -->
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
        <!-- 상세주소 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">상세주소</label>
          <input
            v-model="form.address_detail"
            class="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="상세주소"
          />
        </div>

        <!-- 짐 타입 -->
        <div class="grid grid-cols-[112px_1fr] gap-4 items-start">
          <label class="text-sm font-medium leading-8">타입</label>
          <div class="flex flex-wrap gap-2">
            <Toggle
              v-for="t in GYM_TYPES"
              :key="t.id"
              :label="t.name"
              v-model="form.types"
              :value="t.id"
            />
          </div>
        </div>

        <!-- 편의시설 -->
        <div class="grid grid-cols-[112px_1fr] gap-4 items-start">
          <label class="text-sm font-medium leading-8">편의시설</label>
          <div>
            <div class="flex flex-wrap gap-2">
              <Toggle
                v-for="a in AMENITIES"
                :key="a.id"
                :label="a.text"
                v-model="form.amenities"
                :value="a.id"
              />
            </div>
          </div>
        </div>

        <!-- 색상순서 -->
        <div class="grid grid-cols-[112px_1fr] gap-4 items-start">
          <label class="text-sm font-medium leading-8"
            >색상 순서
            <i
              class="fa-solid fa-circle-question"
              v-tooltip="'볼더링/지구력 난이도 순서별 색상 설정'"
            ></i
          ></label>
          <div>
            <div class="flex flex-wrap gap-2">
              <MultiColorSelect
                v-model="form.gymBoulderColors"
                :options="COLOR"
                labelKey="name"
                valueKey="id"
                colorKey="code"
              />
            </div>
          </div>
        </div>

        <!-- 난이도 종류 -->
        <div class="grid grid-cols-[112px_1fr] gap-4 items-start">
          <label class="text-sm font-medium leading-8"
            >난이도 종류
            <i
              class="fa-solid fa-circle-question"
              v-tooltip="'볼더링/지구력 난이도 종류 설정'"
            ></i
          ></label>
          <div>
            <div class="flex flex-wrap gap-2">
              <MultiCheck
                placeholder="구분을 선택하세요"
                label=""
                :items="DIFFICULTYS"
                v-model="form.gymDifficulties"
                textKey="name"
              />
            </div>
          </div>
        </div>

        <!-- 운영시간 -->
        <div class="flex items-start gap-4">
          <label class="w-28 text-sm font-medium mt-1">운영시간</label>
          <div class="flex-1 space-y-1 text-sm">
            <TimeRow label="평일" v-model="form.hours.weekday" />
            <TimeRow label="주말" v-model="form.hours.weekend" />
            <TimeRow label="공휴일" v-model="form.hours.holiday" />
          </div>
        </div>

        <!-- 활성 여부 -->
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

      <!-- 내용 영역 -->
      <div class="space-y-4 text-sm">
        <!-- 장소명 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">장소명</label>
          <input
            v-model="default_d_form.name"
            class="flex-1 border rounded px-3 py-2 text-sm"
            placeholder=""
            disabled="true"
          />
        </div>

        <!-- 내용 -->
        <div class="flex items-start gap-4">
          <label class="w-28 text-sm font-medium mt-2">정보</label>
          <div class="flex-1">
            <Editor v-model="default_d_form.description" />
          </div>
        </div>

        <!-- 일일이용권 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">일일 이용금액</label>
          <div class="flex-1">
            <input
              type="number"
              v-model="default_d_form.day_pass_price"
              class="w-full border rounded px-3 py-2 text-sm"
            />
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
        <KakaoMap :markers="GYM_MAP" class="h-[800px] rounded-2xl shadow-xl" />
      </div>
    </BaseModal>
  </div>
</template>

<script lang="ts">
import { useBookmarkStore } from "@/stores/bookmarkStore";
import api from "@/lib/api.js";
import TimeRow from "@/components/common/TimeRow.vue";
import GymList from "@/components/gym/GymList.vue";
import MultiCheck from "@/components/common/MultiCheck.vue";
import KakaoMap from "@/components/common/KakaoMap.vue";
import Editor from "@/components/common/Editor.vue";
import SearchSelect from "@/components/common/SearchSelect.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import MultiColorSelect from "@/components/common/MultiColorSelect.vue";
import BaseImage from "@/components/common/BaseImage.vue";

export default {
  name: "GymPage",

  setup() {
    const bookmarkStore = useBookmarkStore();
    return { bookmarkStore };
  },

  components: {
    TimeRow,
    GymList,
    MultiCheck,
    KakaoMap,
    Editor,
    SearchSelect,
    BaseModal,
    BaseImage,
    MultiColorSelect,
  },

  data() {
    return {
      AMENITIES: [],
      GYM_TYPES: [],
      GYMS: [],
      SIDO: [],
      GYM_MAP: [],
      COLOR: [],
      DIFFICULTYS: [],
      geocoder: null,

      openModal: false,
      openMapModal: false,
      openDetailModal: false,

      isEdit: false,
      editId: null,

      isDetailEdit: false,
      detailId: null,

      search: {
        is_active: "",
        keyword: "",
        sido: "",
        types: [],
        amenities: [],
      },

      /* =======================
         무한스크롤 상태
      ======================= */
      page: 1,
      limit: 20,
      isLoading: false,
      hasMore: true,

      form: {} as any,
      detail_form: {} as any,

      default_d_form: {
        name: "",
        gym_id: 0,
        description: "",
        day_pass_price: 0,
      },

      existingImages: [] as any[],
      deleteImageIds: [] as number[],
      newFiles: [] as File[],
      newPreviews: [] as string[],

      apiUrl: import.meta.env.VITE_API_URL,
    };
  },

  created() {
    this.form = this.getDefaultForm();
  },

  methods: {
    toggleActive() {
      this.form.is_active = this.form.is_active === "y" ? "n" : "y";
    },

    removeNewImage(index: number) {
      this.newFiles.splice(index, 1);
      this.newPreviews.splice(index, 1);
    },
    removeExistingImage(img: any) {
      this.deleteImageIds.push(img.id);
      this.existingImages = this.existingImages.filter((i) => i.id !== img.id);
    },
    handleFiles(e: Event) {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      for (let file of Array.from(files)) {
        this.newFiles.push(file);
        this.newPreviews.push(URL.createObjectURL(file));
      }
    },

    // 상세정보 초기화
    inintDetailForm() {
      this.default_d_form = {
        gym_id: 0,
        name: "",
        description: "",
        day_pass_price: 0,
      };
      this.detailId = null;
      this.isDetailEdit = false;
      this.existingImages = [];
      this.newFiles = [];
      this.newPreviews = [];
      this.openDetailModal = true;
    },

    // 상세정보 출력
    async onDetail(data: any) {
      this.inintDetailForm();

      const res = await api.post("/api/gymDetail/getGym", {
        gym_id: data.id,
      });

      if (res.data) {
        this.isDetailEdit = true;
        this.detailId = res.data.id;
        this.default_d_form = {
          name: res.data.name,
          gym_id: res.data.id,
          description: res.data.description || "",
          day_pass_price: res.data.day_pass_price || 0,
        };
        this.existingImages = res.data.images || [];
      }

      this.default_d_form.name = data.name;
      this.default_d_form.gym_id = data.id;
      this.openDetailModal = true;
    },

    // 상세정보 저장
    async saveDetail() {
      try {
        const formData = new FormData();
        formData.append("gym_id", this.default_d_form.gym_id);
        formData.append("description", this.default_d_form.description);
        formData.append("day_pass_price", this.default_d_form.day_pass_price);
        formData.append("deleteImageIds", JSON.stringify(this.deleteImageIds));
        // 신규 파일
        this.newFiles.forEach((file) => {
          formData.append("images", file);
        });

        if (this.isDetailEdit) {
          formData.append("id", this.detailId);
          await api.post("/api/gymDetail/update", formData);
        } else {
          await api.post("/api/gymDetail/save", formData);
        }

        this.$toast.success("저장 완료");
        this.openDetailModal = false;
      } catch (e) {
        this.$toast.error("저장 실패");
      }
    },

    // 주소 검색
    searchAddress() {
      new window.kakao.Postcode({
        oncomplete: (data: any) => {
          // 주소 문자열
          const fullAddress = data.address;
          const sido = data.sido;
          const zonecode = data.zonecode;

          this.form.address = fullAddress;
          this.form.post = zonecode;
          this.form.sido = sido;

          // 지오코딩 → 좌표 변환
          if (this.geocoder) {
            this.geocoder.addressSearch(
              fullAddress,
              (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                  this.form.lat = parseFloat(result[0].y);
                  this.form.lon = parseFloat(result[0].x);
                }
              },
            );
          }
        },
      }).open();
    },

    // 저장 처리
    async saveForm(data: any) {
      this.form = this.getDefaultForm();

      const hoursMap = {
        weekday: { open_time: "", close_time: "", is_closed: false },
        weekend: { open_time: "", close_time: "", is_closed: false },
        holiday: { open_time: "", close_time: "", is_closed: false },
      };

      // 운영시간 매핑
      if (data.operating_hours && Array.isArray(data.operating_hours)) {
        data.operating_hours.forEach((h: any) => {
          if (hoursMap[h.type]) {
            hoursMap[h.type] = {
              open_time: h.open_time,
              close_time: h.close_time,
              is_closed: h.is_closed ?? false,
            };
          }
        });
      }

      // 최종 폼 세팅
      this.form = {
        name: data.name || "",
        address: data.address || "",
        address_detail: data.address_detail || "",
        types: data.gymTypeMap
          ? data.gymTypeMap.map((t: any) => t.type_id)
          : [],
        amenities: data.gymAmenityMaps
          ? data.gymAmenityMaps.map((a: any) => a.amenity_id)
          : [],
        gymBoulderColors: data.gymBoulderColors
          ? data.gymBoulderColors.map((a: any) => a.boulder_color_id)
          : [],
        gymDifficulties: data.gymDifficulties
          ? data.gymDifficulties.map((a: any) => a.difficulty_id)
          : [],
        hours: hoursMap,
        is_active: data.is_active || "y",
        lat: data.lat || 0,
        lon: data.lon || 0,
        post: data.post || "",
        sido: data.sido || "",
      };

      this.editId = data.id;
      this.isEdit = true;
      this.openModal = true;
    },

    // 장소 정보 저장
    async saveLocation() {
      try {
        console.log("색상 순서 확인", this.form.gymBoulderColors);

        const payload = {
          ...this.form,
        };

        // 수정여부 확인
        if (this.isEdit) {
          payload.id = this.editId;
          console.log("색상 순서 확인", this.form.gymBoulderColors);
          await api.post("/api/gyms/update", payload);
        } else {
          await api.post("/api/gyms/save", payload);
        }

        this.$toast.success("저장되었습니다");
        this.openModal = false;

        this.page = 1;
        this.hasMore = true;
        this.loadList(false);
      } catch (e) {
        this.$toast.error("저장 실패");
      }
    },

    initForm() {
      this.isEdit = false;
      this.editId = null;
      this.form = this.getDefaultForm();
      this.openModal = true;
    },

    /* =========================
       무한스크롤 리스트 로딩
    ========================== */
    async loadList(append = false) {
      if (this.isLoading) return;
      if (!this.hasMore && append) return;

      this.isLoading = true;

      try {
        const res = await api.post("/api/gyms/pageList", {
          ...this.search,
          page: this.page,
          limit: this.limit,
        });

        const list = res.data || [];
        console.log("정렬된체로 오나??", list);

        if (append) {
          this.GYMS = [...this.GYMS, ...list];
        } else {
          this.GYMS = list;
        }

        if (list.length < this.limit) {
          this.hasMore = false;
        }
      } catch (e) {
        console.error("리스트 로딩 실패", e);
      } finally {
        this.isLoading = false;
      }
    },

    /* =========================
       스크롤 감지
    ========================== */
    handleScroll() {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - 150) {
        if (!this.isLoading && this.hasMore) {
          this.page++;
          this.loadList(true);
        }
      }
    },

    /* =========================
       검색 (초기화)
    ========================== */
    search_list() {
      this.page = 1;
      this.hasMore = true;
      this.loadList(false);
    },

    /* =========================
       삭제
    ========================== */
    async deleteGym(data: any) {
      const ok = await this.$confirm(
        `${data.name} 정보를 삭제하시겠습니까?`,
        "삭제 확인",
      );
      if (!ok) return;

      try {
        await api.post("/api/gyms/delete", { id: data.id });
        this.$toast.success("삭제 처리 되었습니다");

        this.page = 1;
        this.hasMore = true;
        this.loadList(false);
      } catch (e) {
        this.$toast.error("삭제 실패");
      }
    },

    /* =========================
       기본 폼
    ========================== */
    getDefaultForm() {
      return {
        name: "",
        address: "",
        address_detail: "",
        types: [],
        amenities: [],
        gymBoulderColors: [],
        gymDifficulties: [],
        hours: {
          weekday: {
            open_time: "10:00",
            close_time: "22:00",
            is_closed: false,
          },
          weekend: {
            open_time: "10:00",
            close_time: "22:00",
            is_closed: false,
          },
          holiday: {
            open_time: "10:00",
            close_time: "22:00",
            is_closed: false,
          },
        },
        is_active: "y",
        lat: 0,
        lon: 0,
        post: "",
        sido: "",
      };
    },

    /* =========================
       기타 기존 메서드 유지
       (상세, 저장, 타입/편의시설 로딩 등)
    ========================== */

    async loadTypes() {
      const res = await api.post("/api/gymType/list");
      this.GYM_TYPES = res.data;
    },

    async loadAmenities() {
      const res = await api.post("/api/amenities/list");
      this.AMENITIES = res.data;
    },

    async loadSidoList() {
      const res = await api.post("/api/gyms/sidoGroup");
      this.SIDO = res.data;
    },

    async loadMapData() {
      const res = await api.post("/api/gyms/list");
      this.GYM_MAP = res.data;
    },

    async loadColor() {
      const res = await api.post("/api/boulderColor/list");
      this.COLOR = res.data;
    },

    async loadDifficulty() {
      const res = await api.post("/api/difficulty/list");
      this.DIFFICULTYS = res.data;
    },

    // 북마크
    onBookmark(data: any) {
      let item = {
        key: `${data.id}_0`,
        id: data.id,
        route_id: null,
        name: data.name,
        address: data.address,
        address_detail: data.address_detail,
      };
      // 북마크 주입
      this.bookmarkStore.add(item);
      this.$toast.success(`[${data.name}] 북마크 적용되었습니다`);
    },
  },

  async mounted() {
    await this.loadTypes();
    await this.loadAmenities();
    await this.loadSidoList();
    await this.loadMapData();
    await this.loadColor();
    await this.loadDifficulty();

    await this.loadList(false);

    window.kakao.maps.load(() => {
      this.geocoder = new window.kakao.maps.services.Geocoder();
    });

    window.addEventListener("scroll", this.handleScroll);
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>
