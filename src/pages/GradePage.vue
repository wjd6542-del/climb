<template>
  <div class="page-wrapper">
    <div>
      <!-- 타이틀 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold">난이도</h1>
        <button
          class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
          @click="initForm"
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
            @change="resetAndSearch"
          />
        </div>

        <!-- 내외 구분 -->
        <div class="w-full md:w-[220px]">
          <SearchSelect
            v-model="search.environment"
            :options="environment_type"
            labelKey="text"
            valueKey="value"
            placeholder="내외 구분을 선택하세요"
            class="bg-white border border-gray-200 rounded-lg h-[40px]"
            @change="resetAndSearch"
          />
        </div>

        <!-- 클라이밍 구분검색 -->
        <div class="w-full md:w-[220px]">
          <SearchSelect
            v-model="search.climb_type"
            :options="climb_type"
            labelKey="text"
            valueKey="value"
            placeholder="구분을 선택하세요"
            class="bg-white border border-gray-200 rounded-lg h-[40px]"
            @change="resetAndSearch"
          />
        </div>
      </div>

      <!-- 리스트 -->
      <RouteList
        :routs="list"
        :changeFlg="true"
        @delete="deletePost"
        @edit="dataView"
      />

      <div v-if="isLoading" class="text-center py-6 text-gray-400">
        불러오는 중...
      </div>

      <div
        v-if="!hasMore && list.length && list.length > 20"
        class="text-center py-6 text-gray-300"
      >
        마지막 게시글입니다
      </div>
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

      <!-- 폼 -->
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
          <label class="w-28 text-sm font-medium mt-2">루트 구분</label>
          <div class="flex-1">
            <SearchSelect
              v-model="form.climb_type"
              :options="climb_type"
              labelKey="text"
              valueKey="value"
              placeholder="루트 선택"
              class="bg-white border border-gray-200 rounded-lg"
              @change="climbTypeChange"
            />
          </div>
        </div>

        <!-- 내부/외부 구분 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium mt-2">내외 구분</label>
          <div class="flex-1">
            <SearchSelect
              v-model="form.environment"
              :options="environment_type"
              labelKey="text"
              valueKey="value"
              placeholder="내외 구분 선택"
              class="bg-white border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <!-- 리드 루트명 -->
        <div class="flex items-center gap-4" v-if="form.climb_type == 'LEAD'">
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
          <template v-if="form.climb_type == 'LEAD'">
            <label class="w-28 text-sm font-medium mt-2">리드 난이도</label>
            <div class="flex-1">
              <SearchSelect
                v-model="form.difficulty"
                :options="l_grade"
                labelKey="text"
                valueKey="value"
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
                :options="v_grade"
                labelKey="text"
                valueKey="value"
                placeholder="볼더링 난이도 선택"
                class="bg-white border border-gray-200 rounded-lg"
              />
            </div>
          </template>
        </div>

        <!-- 볼더링 색상정보 -->
        <div
          class="flex items-center gap-4"
          v-if="form.climb_type == 'BOULDER'"
        >
          <label class="w-28 text-sm font-medium mt-2">볼더링 색상정보</label>
          <div class="flex-1">
            <SearchColorSelect
              v-model="form.route_color"
              :options="route_color"
              labelKey="text"
              valueKey="value"
              placeholder="색상 선택"
              class="bg-white border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <!-- 리드 바위타입 -->
        <div
          class="flex items-center gap-4"
          v-if="form.environment == 'NATURE'"
        >
          <label class="w-28 text-sm font-medium mt-2">바위 타입</label>
          <div class="flex-1">
            <SearchSelect
              v-model="form.rock_type"
              :options="rock_type"
              labelKey="text"
              valueKey="value"
              placeholder="내외 구분 선택"
              class="bg-white border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <!-- 리드 높이 height -->
        <div class="flex items-center gap-4" v-if="form.climb_type == 'LEAD'">
          <label class="w-28 text-sm font-medium mt-2">리드 높이</label>
          <div class="flex-1">
            <input
              type="number"
              v-model="form.height"
              class="flex-1 w-full border rounded px-3 py-2 text-sm"
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
        <!-- 버튼 -->
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

<script lang="ts">
import api from "@/lib/api.js";
import SearchSelect from "@/components/common/SearchSelect.vue";
import SearchColorSelect from "@/components/common/SearchColorSelect.vue";
import Editor from "@/components/common/Editor.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseImage from "@/components/common/BaseImage.vue";

import RouteList from "@/components/route/RouteList.vue";

export default {
  name: "InfoShare",
  components: {
    SearchSelect,
    SearchColorSelect,
    Editor,
    BaseModal,
    BaseImage,
    RouteList,
  },

  data() {
    return {
      openModal: false,
      isEdit: false,
      editId: null as number | null,

      // 환경설정
      gymList: [] as any[],
      climb_type: [],
      environment_type: [],
      v_grade: [],
      l_grade: [],
      rock_type: [],
      route_color: [],

      list: [] as any[],
      // 검색
      search: { keyword: "", gym_id: "", climb_type: "", environment: "" },

      // 등록폼
      form: this.initForm() || {},

      existingImages: [] as any[],
      deleteImageIds: [] as number[],
      newFiles: [] as File[],
      newPreviews: [] as string[],

      apiUrl: import.meta.env.VITE_API_URL,

      /* =====================
         무한스크롤 상태
      ===================== */
      page: 1,
      limit: 20,
      isLoading: false,
      hasMore: true,
    };
  },

  methods: {
    // 클라이밍 구분 변경시
    climbTypeChange() {
      if (this.form.climb_type == "BOULDER") {
        this.form.route_name = "";
        this.form.rock_type = "";
        this.form.height = 0;
      } else {
        this.form.route_color = "";
      }
      this.form.difficulty = "";
    },

    // 등록폼 초기화
    initForm() {
      this.form = {
        gym_id: 0,
        // 리드, 볼더 구분
        climb_type: "",
        // 실내, 실외 구분
        environment: "",
        // 난이도
        difficulty: "",
        // 메모
        memo: "",
        // 루트명
        route_name: "",
        // 실내 볼더링 색상
        route_color: "",
        // 리드 바위종료
        rock_type: "",
        // 리드 높이
        height: 0,
        // 활성여부
        is_active: "y",
      };

      this.existingImages = [];
      this.deleteImageIds = [];
      this.newFiles = [];
      this.newPreviews = [];
      this.isEdit = false;
      this.openModal = true;
    },

    /* =====================
       무한스크롤 리스트 로딩
    ===================== */
    async loadList(append = false) {
      if (this.isLoading) return;
      if (!this.hasMore && append) return;

      this.isLoading = true;

      try {
        const payload: any = {
          gym_id: this.search.gym_id,
          keyword: this.search.keyword,
          climb_type: this.search.climb_type,
          environment: this.search.environment,
          page: this.page,
          limit: this.limit,
        };

        const res = await api.post("/api/route/pageList", payload);
        const data = res.data || [];

        if (append) {
          this.list = [...this.list, ...data];
        } else {
          this.list = data;
        }

        if (data.length < this.limit) {
          this.hasMore = false;
        }
      } catch (e) {
        console.error("리스트 로딩 실패", e);
      } finally {
        this.isLoading = false;
      }
    },

    /* =====================
       스크롤 감지
    ===================== */
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

    /* =====================
       검색 초기화
    ===================== */
    resetAndSearch() {
      this.page = 1;
      this.hasMore = true;
      this.loadList(false);
    },

    dataView(data: any) {
      this.isEdit = true;
      this.editId = data.id;

      this.form = {
        gym_id: data.gym_id,
        // 리드, 볼더 구분
        climb_type: data.climb_type,
        // 실내, 실외 구분
        environment: data.environment,
        // 난이도
        difficulty: data.difficulty || "",
        // 메모
        memo: data.memo || "",
        // 루트명
        route_name: data.route_name || "",
        // 실내 볼더링 색상
        route_color: data.route_color || "",
        // 리드 바위종료
        rock_type: data.rock_type || "",
        // 리드 높이
        height: data.height || 0,
        // 활성여부
        is_active: data.is_active || "y",
      };

      console.log(this.form);

      this.existingImages = data.images || [];
      this.deleteImageIds = [];
      this.newFiles = [];
      this.newPreviews = [];
      this.openModal = true;
    },

    removeExistingImage(img: any) {
      this.deleteImageIds.push(img.id);
      this.existingImages = this.existingImages.filter((i) => i.id !== img.id);
    },

    handleFiles(event: Event) {
      const input = event.target as HTMLInputElement;
      if (!input.files) return;

      const MAX_SIZE = 5 * 1024 * 1024;

      Array.from(input.files).forEach((file) => {
        if (file.size > MAX_SIZE) {
          this.$toast.error("파일은 5MB 이하만 가능");
          return;
        }

        this.newFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          this.newPreviews.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    },

    removeNewImage(index: number) {
      this.newFiles.splice(index, 1);
      this.newPreviews.splice(index, 1);
    },

    async submit() {
      try {
        const formData = new FormData();

        formData.append("gym_id", this.form.gym_id);
        formData.append("climb_type", this.form.climb_type);
        formData.append("environment", this.form.environment);
        formData.append("difficulty", this.form.difficulty);
        formData.append("memo", this.form.memo);
        formData.append("route_name", this.form.route_name);
        formData.append("route_color", this.form.route_color);
        formData.append("rock_type", this.form.rock_type);
        formData.append("height", this.form.height);
        formData.append("is_active", this.form.is_active);

        if (this.isEdit && this.editId) {
          formData.append("id", String(this.editId));
          formData.append(
            "deleteImageIds",
            JSON.stringify(this.deleteImageIds),
          );
        }

        this.newFiles.forEach((file) => {
          formData.append("images", file);
        });

        if (this.isEdit) {
          await api.post("/api/route/update", formData);
          this.$toast.success("수정 완료");
        } else {
          await api.post("/api/route/save", formData);
          this.$toast.success("등록 완료");
        }

        this.openModal = false;

        this.page = 1;
        this.hasMore = true;
        this.loadList(false);
      } catch (err: any) {
        this.$toast.error(err.message || "처리 실패");
      }
    },

    async loadGymsList() {
      const res = await api.post("/api/gyms/list", {});
      this.gymList = res.data;
    },

    async loadSetting() {
      const res = await api.post("/api/settings/getGradeList");
      console.log("결과 정보 확인", res.data);

      this.climb_type = res.data.climb_type;
      this.environment_type = res.data.environment_type;
      this.v_grade = res.data.v_grade;
      this.l_grade = res.data.l_grade;
      this.rock_type = res.data.rock_type;
      this.route_color = res.data.route_color;
    },

    async deletePost(data: any) {
      const ok = await this.$confirm(
        `${data.gym.name} - ${data.difficulty} 정보를 삭제하시겠습니까?`,
        "삭제 확인",
      );
      if (!ok) return;

      await api.post("/api/route/delete", { id: data.id });
      this.$toast.success("삭제처리 되었습니다");

      this.page = 1;
      this.hasMore = true;
      this.loadList(false);
    },
  },

  async mounted() {
    // 환경설정 로드
    await this.loadGymsList();
    await this.loadSetting();

    // 메인 릭스트 로드
    await this.loadList(false);

    window.addEventListener("scroll", this.handleScroll);
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>
