<template>
  <div>
    <div class="flex gap-2">
      <!-- 상단 액션 -->
      <button
        @click="addRow"
        class="mb-2 px-2 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        <i class="fa-solid fa-plus"></i> {{ $t("추가") }}
      </button>
      <button
        @click="saveRows"
        class="mb-2 px-2 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600 gap-1"
      >
        <i class="fa-solid fa-save"></i> {{ $t("저장") }}
      </button>
      <button
        @click="deleteRows"
        class="mb-2 px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600 gap-1"
      >
        <i class="fa-solid fa-trash"></i> {{ $t("삭제") }}
      </button>
    </div>

    <!-- AG Grid -->
    <div class="ag-theme-alpine w-full" style="width: 100%; height: 600px">
      <AgGridVue
        class="ag-theme-alpine"
        theme="legacy"
        domLayout="normal"
        style="width: 100%; height: 600px"
        :rowData="rowData"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :gridOptions="gridOptions"
        @grid-ready="onGridReady"
        @cell-editing-stopped="onCellEditingStopped"
      />
    </div>
  </div>
</template>

<script>
import api from "@/lib/api.js";
import { AgGridVue } from "ag-grid-vue3";

export default {
  name: "settingsTable",
  components: { AgGridVue },

  data() {
    return {
      gridApi: null,
      columnApi: null,

      rowData: [],
      columnDefs: [],

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
    onCellEditingStopped(params) {
      params.api.setNodesSelected({
        nodes: [params.node],
        newValue: true,
        clearSelection: false,
      });
    },

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
      const res = await api.post("/api/settings/list");

      this.rowData = res.data;

      // 해더  및 기능 설정
      this.columnDefs = [
        {
          headerName: this.$t("키"),
          field: "key",
          filter: "agTextColumnFilter",
          flex: 0.5,
        },
        {
          headerName: this.$t("텍스트"),
          field: "text",
          filter: "agTextColumnFilter",
          flex: 0.5,
        },
        {
          headerName: this.$t("값"),
          field: "value",
          filter: "agTextColumnFilter",
          flex: 0.5,
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
          flex: 0.5,
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
      ];
    },

    /* =========================
     * 행 추가
     * ========================= */
    addRow() {
      const newRow = {
        id: 0,
        key: "",
        text: "",
        value: "",
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

        console.log("신규 추가 확인", rows);
        await api.post("/api/settings/batchSave", rows);
        this.$toast.success("저장 완료");
        this.loadList();
      } catch (e) {
        console.error(e);
        this.$toast.error("저장 실패");
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
        await api.post("/api/settings/batchDelete", rows);
        this.$toast.success("삭제 완료");
        this.loadList();
      } catch (e) {
        this.$toast.error("삭제 중 오류가 발생했습니다");
      }
    },
  },
};
</script>
