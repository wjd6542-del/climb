<template>
  <div class="page-wrapper">
    <div>
      <!-- 타이틀 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold">정보공유</h1>
        <button
          class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
          @click="initForm"
        >
          <i class="fa-solid fa-plus"></i> 글쓰기
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
            @change="resetAndSearch"
          />
        </div>

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

        <div class="w-full md:w-[200px]">
          <input
            v-model="search.keyword"
            class="w-full border rounded px-3 py-2 text-sm min-h-[42px]"
            placeholder="제목 검색"
            @change="resetAndSearch"
          />
        </div>
      </div>

      <!-- 리스트 -->
      <PostList
        :posts="list"
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
      :title="isEdit ? '게시글 수정' : '정보 공유 등록'"
      width="lg"
    >
      <template #header>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <i class="fa-solid fa-pen"></i>
            {{ isEdit ? "게시글 수정" : "정보 공유 등록" }}
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="openModal = false"
          ></button>
        </div>
      </template>

      <!-- 폼 -->
      <div class="space-y-4 text-sm">
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

        <!-- 제목 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">제목</label>
          <div class="flex-1">
            <input
              v-model="form.title"
              placeholder="제목 입력"
              class="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <!-- 내용 -->
        <div class="flex items-start gap-4">
          <label class="w-28 text-sm font-medium mt-2">내용</label>
          <div class="flex-1">
            <Editor v-model="form.content" />
          </div>
        </div>

        <!-- 별점 -->
        <div class="flex items-center gap-4">
          <label class="w-28 text-sm font-medium">별점</label>
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
import Editor from "@/components/common/Editor.vue";
import DateRangePicker from "@/components/common/DateRangePicker.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import PostList from "@/components/gymPost/PostList.vue";
import BaseImage from "@/components/common/BaseImage.vue";

export default {
  name: "InfoShare",
  components: {
    PostList,
    SearchSelect,
    Editor,
    DateRangePicker,
    BaseModal,
    BaseImage,
  },

  data() {
    return {
      openModal: false,
      isEdit: false,
      editId: null as number | null,

      dateRange: { start: null as Date | null, end: null as Date | null },

      gymList: [] as any[],
      list: [] as any[],

      search: { keyword: "", gym_id: "" },

      form: { gym_id: "", title: "", content: "", rating: 0 },

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
          page: this.page,
          limit: this.limit,
        };

        if (this.dateRange?.start) {
          payload.startDate = this.dateRange.start.toISOString();
        }
        if (this.dateRange?.end) {
          payload.endDate = this.dateRange.end.toISOString();
        }

        const res = await api.post("/api/gymPost/pageList", payload);
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

    initForm() {
      this.isEdit = false;
      this.editId = null;
      this.form = { gym_id: "", title: "", content: "", rating: 0 };
      this.existingImages = [];
      this.deleteImageIds = [];
      this.newFiles = [];
      this.newPreviews = [];
      this.openModal = true;
    },

    dataView(data: any) {
      this.isEdit = true;
      this.editId = data.id;

      this.form = {
        gym_id: data.gym_id,
        title: data.title,
        content: data.content,
        rating: data.rating,
      };

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
        formData.append("title", this.form.title);
        formData.append("content", this.form.content);
        formData.append("rating", String(this.form.rating));

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
          await api.post("/api/gymPost/update", formData);
          this.$toast.success("수정 완료");
        } else {
          await api.post("/api/gymPost/save", formData);
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

    async deletePost(data: any) {
      const ok = await this.$confirm(
        `${data.title} 정보를 삭제하시겠습니까?`,
        "삭제 확인",
      );
      if (!ok) return;

      await api.post("/api/gymPost/delete", { id: data.id });
      this.$toast.success("삭제처리 되었습니다");

      this.page = 1;
      this.hasMore = true;
      this.loadList(false);
    },
  },

  async mounted() {
    await this.loadGymsList();
    await this.loadList(false);

    window.addEventListener("scroll", this.handleScroll);
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>
