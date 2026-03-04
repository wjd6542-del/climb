<template>
  <div>
    <div class="bg-white border rounded-xl shadow-sm p-4 mb-4">
      <div
        class="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <!-- 우측 : 액션 버튼 -->
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
  </div>
</template>

<script>
import api from "@/lib/api.js";
import { AgGridVue } from "ag-grid-vue3";

// AG Grid CSS는 main.js 또는 여기서 import 되어 있어야 함
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";

export default {
  name: "AmenitiesTable",
  components: { AgGridVue },

  data() {
    return {
      gridApi: null,
      columnApi: null,
      tempId: -1,
      rowData: [],
      columnDefs: [
        {
          headerName: this.$t("이름"),
          field: "text",
          filter: "agTextColumnFilter",
          flex: 1,
        },
        {
          headerName: this.$t("값"),
          field: "value",
          filter: "agTextColumnFilter",
          flex: 1,
        },
        {
          headerName: this.$t("아이콘"),
          field: "icon",
          filter: "agTextColumnFilter",
          flex: 1,
        },
        {
          headerName: this.$t("정렬"),
          field: "sort",
          filter: "agNumberColumnFilter",
          flex: 0.5,
        },
        {
          headerName: this.$t("활성여부"),
          field: "is_active",

          editable: true,
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: ["y", "n"],
            formatValue: (value) => this.statusMap[value],
          },

          filter: "agTextColumnFilter",
          filterValueGetter: (params) =>
            this.statusMap[params.data.is_active] ?? params.data.is_active,

          valueFormatter: (params) =>
            this.statusMap[params.value] ?? params.value,
        },
      ],

      gridOptions: {
        getRowId: (params) => String(params.data.id), // ⭐ 필수
        rowSelection: {
          mode: "multiRow",
          checkboxes: true, // 🔥 반드시 필요
          headerCheckbox: true,
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
        onCellValueChanged: (params) => {
          params.node.setSelected(true);
        },
      },

      statusMap: {
        y: "활성",
        n: "비활성",
      },
    };
  },

  mounted() {
    this.loadList();
  },

  methods: {
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
      const res = await api.post("/api/amenities/allList");
      this.rowData = res.data;
    },

    /* =========================
     * 행 추가
     * ========================= */
    addRow() {
      const newRow = {
        id: this.tempId--,
        text: "",
        value: "",
        icon: "",
        is_active: "y",
        sort: 0,
      };

      const res = this.gridApi.applyTransaction({ add: [newRow], addIndex: 0 });
      res.add[0].setSelected(true);
    },

    /* =========================
     * 저장
     * ========================= */
    async saveRows() {
      const rows = this.gridApi.getSelectedRows();
      try {
        if (rows.length === 0) {
          this.$toast.error("선택된 정보가 없습니다");
          return;
        }
        await api.post("/api/amenities/batchSave", rows);
        this.$toast.success("저장 완료");
        this.loadList();
      } catch (e) {
        this.$toast.error(`${e.message}`);
      }
    },

    // 일괄 삭제 처리
    async deleteRows() {
      const rows = this.gridApi.getSelectedRows();

      if (rows.length === 0) {
        this.$toast.error("선택된 정보가 없습니다");
        return;
      }

      const ok = await this.$confirm(
        `선택된 ${rows.length}개 항목을 삭제하시겠습니까?`,
        "삭제 확인",
      );

      if (!ok) return;

      try {
        await api.post("/api/amenities/batchDelete", rows);
        this.$toast.success("삭제 완료");
        this.loadList();
      } catch (e) {
        this.$toast.error("삭제 중 오류가 발생했습니다");
      }
    },
  },
};
</script>
