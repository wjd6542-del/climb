<template>
  <div>
    <!-- 상단 버튼 -->
    <div class="bg-white border rounded-xl shadow-sm p-4 mb-4">
      <div class="flex items-center gap-2 flex-wrap">
        <button
          @click="addRow"
          class="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-1"
        >
          <i class="fa-solid fa-plus"></i>
          {{ $t("추가") }}
        </button>

        <button
          @click="saveRows"
          class="px-3 py-1.5 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center gap-1"
        >
          <i class="fa-solid fa-save"></i>
          {{ $t("저장") }}
        </button>

        <button
          @click="deleteRows"
          class="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-1"
        >
          <i class="fa-solid fa-trash"></i>
          {{ $t("삭제") }}
        </button>
      </div>
    </div>

    <!-- AG Grid -->
    <div class="ag-theme-alpine w-full" style="width: 100%; height: 400px">
      <AgGridVue
        class="ag-theme-alpine"
        theme="legacy"
        domLayout="normal"
        style="width: 100%; height: 400px"
        :rowData="rowData"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :gridOptions="gridOptions"
        @grid-ready="onGridReady"
      />
    </div>

    <!-- 이미지 모달 -->
    <BaseModal v-model="open" :title="'이미지 등록'" width="lg">
      <template #header>
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <i class="fa-solid fa-image"></i>
          이미지 등록
        </h2>
      </template>

      <div v-if="selectedRow" class="space-y-10 p-6">
        <!-- 🔵 배너 영역 -->
        <section>
          <h3 class="text-base font-bold mb-4 text-blue-600">
            배너 이미지 (1장)
          </h3>

          <!-- 업로드 -->
          <BaseImage
            :multiple="false"
            @change="(e) => handleFiles(e, 'banner')"
          />

          <!-- 프리뷰 -->
          <div class="mt-4">
            <div
              v-if="bannerPreview"
              class="relative w-64 border rounded-xl overflow-hidden shadow"
            >
              <img
                :src="
                  openImage(bannerPreview.preview || bannerPreview.file_url)
                "
                class="w-full h-40 object-cover"
              />

              <button
                class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
                @click="removeImage(bannerPreview.id)"
              >
                삭제
              </button>
            </div>

            <div v-else class="text-sm text-gray-400">
              등록된 배너 이미지가 없습니다.
            </div>
          </div>
        </section>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import api from "@/lib/api.js";
import { AgGridVue } from "ag-grid-vue3";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseImage from "@/components/common/BaseImage.vue";

export default {
  name: "bannerTable",
  components: { AgGridVue, BaseModal, BaseImage },

  computed: {
    bannerPreview() {
      if (!this.selectedRow?.images) return null;
      return this.selectedRow.images.find((i) => i.type === "banner") || null;
    },
    activityPreviews() {
      if (!this.selectedRow?.images) return [];
      return this.selectedRow.images.filter((i) => i.type === "activity");
    },
  },

  data() {
    return {
      open: false,
      selectedRow: null,
      pendingImages: [],

      gridApi: null,
      columnApi: null,
      tempId: -1,
      rowData: [],
      columnDefs: [],

      geocoder: null,

      gridOptions: {
        getRowId: (params) => String(params.data.id),

        rowSelection: {
          mode: "multiRow",
          checkboxes: true,
          headerCheckbox: true,
        },

        onCellClicked: (params) => {
          if (params.colDef.colId === "imageColumn") {
            this.openImageModal(params.data);
            // ✅ 클릭한 행 선택
            params.node.setSelected(true);
          }

          // 🔥 주소 컬럼 클릭 시
          if (params.colDef.field === "address") {
            this.selectedRow = params.data;
            this.searchAddress();
            // ✅ 클릭한 행 선택
            params.node.setSelected(true);
          }
        },

        onCellValueChanged: (params) => {
          if (params.oldValue !== params.newValue) {
            params.node.setSelected(true);
          }
        },

        rowClassRules: {
          "row-inactive": (params) => params.data?.is_active === "n",
        },
      },

      defaultColDef: {
        sortable: true,
        filter: true,
        editable: true,
        resizable: true,
      },

      statusMap: {
        y: "활성",
        n: "비활성",
      },
    };
  },

  methods: {
    openImage(path) {
      return import.meta.env.VITE_API_URL + path;
    },
    removeImage(imageId) {
      if (!this.selectedRow?.images) return;

      this.selectedRow.images = this.selectedRow.images.filter(
        (img) => img.id !== imageId,
      );

      this.gridApi.applyTransaction({
        update: [this.selectedRow],
      });
    },

    handleFiles(e, type) {
      if (!e?.target?.files || !this.selectedRow) return;

      const files = Array.from(e.target.files);

      // images 배열 없으면 생성
      if (!this.selectedRow.images) {
        this.selectedRow.images = [];
      }

      if (type === "banner") {
        // 🔥 banner는 1장만 허용
        const file = files[0];

        const preview = URL.createObjectURL(file);

        const tempImage = {
          id: Date.now(),
          file,
          preview,
          type: "banner",
          isNew: true,
        };

        // 기존 banner 제거
        this.selectedRow.images = this.selectedRow.images.filter(
          (img) => img.type !== "banner",
        );

        this.selectedRow.images.push(tempImage);
      }

      if (type === "activity") {
        // 🔥 activity는 여러장 허용
        files.forEach((file) => {
          const preview = URL.createObjectURL(file);

          const tempImage = {
            id: Date.now() + Math.random(),
            file,
            preview,
            type: "activity",
            isNew: true,
          };

          this.selectedRow.images.push(tempImage);
        });
      }

      // 🔥 AG Grid 즉시 갱신
      this.gridApi.applyTransaction({
        update: [this.selectedRow],
      });

      // input 초기화 (같은 파일 재선택 가능하게)
      e.target.value = "";
    },

    /* =========================
     * Grid Ready
     * ========================= */
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;

      setTimeout(() => {
        params.api.sizeColumnsToFit();
      }, 0);
    },

    /* =========================
     * 데이터 로드
     * ========================= */
    async loadList() {
      this.rowData = [];
      const res = await api.post("/api/banner/list");

      this.rowData = res.data;

      this.columnDefs = [
        {
          headerName: "이름",
          field: "name",
          filter: "agTextColumnFilter",
          flex: 1,
        },
        {
          headerName: "주소",
          field: "address",
          filter: "agTextColumnFilter",
          flex: 1,
          cellClass: "cursor-pointer text-blue-600 font-semibold",
        },
        {
          headerName: "URL",
          field: "url",
          filter: "agTextColumnFilter",
          flex: 1,
        },
        {
          headerName: "이미지",
          colId: "imageColumn",
          editable: false,
          flex: 0.5,
          cellRenderer: () => {
            return `
              <button
				class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
				>
				<i class="fa-solid fa-plus"></i> 등록
				</button>
            `;
          },
        },
        {
          headerName: "정렬",
          field: "sort",
          filter: "agTextColumnFilter",
          flex: 0.5,
        },
        {
          headerName: "활성여부",
          field: "is_active",
          editable: true,
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: ["y", "n"],
          },
          valueFormatter: (params) =>
            this.statusMap[params.value] ?? params.value,
          flex: 0.5,
        },
      ];
    },

    /* =========================
     * 이미지 모달 열기
     * ========================= */
    openImageModal(row) {
      this.selectedRow = row;
      this.open = true;
    },

    /* =========================
     * 행 추가
     * ========================= */
    addRow() {
      const newRow = {
        id: this.tempId--,
        name: "",
        address: "",
        address_detail: "",
        url: "",
        is_active: "y",
      };

      const res = this.gridApi.applyTransaction({
        add: [newRow],
        addIndex: 0,
      });

      res.add[0].setSelected(true);
    },

    /* =========================
     * 저장
     * ========================= */
    async saveRows() {
      const rows = this.gridApi.getSelectedRows();

      if (!rows.length) {
        this.$toast.error("선택된 정보가 없습니다");
        return;
      }

      const formData = new FormData();

      // 🔹 기본 데이터는 한 번에 JSON으로
      formData.append("data", JSON.stringify(rows));

      // 🔹 이미지 파일 + 메타는 인덱스 기준 배열
      rows.forEach((row) => {
        if (row.images && row.images.length) {
          row.images.forEach((img) => {
            if (img.isNew && img.file) {
              formData.append("files[]", img.file);

              formData.append(
                "filesMeta[]",
                JSON.stringify({
                  banner_id: row.id,
                  type: img.type,
                  sort: img.sort || 0,
                }),
              );
            }
          });
        }
      });

      await api.post("/api/banner/batchSave", formData);

      this.$toast.success("저장 완료");
      this.loadList();
    },

    /* =========================
     * 삭제
     * ========================= */
    async deleteRows() {
      const rows = this.gridApi.getSelectedRows();

      if (!rows.length) {
        this.$toast.error("선택된 정보가 없습니다");
        return;
      }

      const ok = await this.$confirm(
        `선택된 ${rows.length}개 항목을 삭제하시겠습니까?`,
        "삭제 확인",
      );

      if (!ok) return;

      await api.post("/api/banner/batchDelete", rows);
      this.$toast.success("삭제 완료");
      this.loadList();
    },

    // 주소 검색
    searchAddress() {
      if (!this.selectedRow) return;

      new window.kakao.Postcode({
        oncomplete: (data) => {
          const fullAddress = data.address;

          // 🔥 선택된 row에 주소 주입
          this.selectedRow.address = fullAddress;

          // grid 갱신
          this.gridApi.applyTransaction({
            update: [this.selectedRow],
          });

          // 수정된 것으로 선택 처리
          const node = this.gridApi.getRowNode(String(this.selectedRow.id));
          if (node) node.setSelected(true);
        },
      }).open();
    },
  },

  mounted() {
    this.loadList();

    window.kakao.maps.load(() => {
      this.geocoder = new window.kakao.maps.services.Geocoder();
    });
  },
};
</script>
