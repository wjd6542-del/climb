<template>
  <div>
    <div class="bg-white border rounded-xl shadow-sm p-4 mb-4">
      <div
        class="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
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

<script setup lang="ts">
import { onMounted, getCurrentInstance } from "vue";
import { AgGridVue } from "ag-grid-vue3";

import { amenitiesService } from "@/api/amenitiesService";
import { useAgGridCrud } from "@/composables/useAgGridCrud";
import type { Amenity } from "@/types";

const t = (k: string) =>
  (getCurrentInstance()?.proxy as any)?.$t(k) ?? k;

const statusMap: Record<string, string> = { y: "활성", n: "비활성" };

const {
  rowData,
  defaultColDef,
  gridOptions,
  onGridReady,
  loadList,
  addRow,
  saveRows,
  deleteRows,
} = useAgGridCrud<Amenity>({
  loader: () => amenitiesService.allList<Amenity[]>(),
  saver: (rows) => amenitiesService.batchSave(rows),
  deleter: (rows) => amenitiesService.batchDelete(rows),
  newRowFactory: (id) => ({
    id,
    text: "",
    value: "",
    icon: "",
    is_active: "y",
    sort: 0,
  }),
});

const columnDefs = [
  { headerName: t("이름"), field: "text", filter: "agTextColumnFilter", flex: 1 },
  { headerName: t("값"), field: "value", filter: "agTextColumnFilter", flex: 1 },
  { headerName: t("아이콘"), field: "icon", filter: "agTextColumnFilter", flex: 1 },
  { headerName: t("정렬"), field: "sort", filter: "agNumberColumnFilter", flex: 0.5 },
  {
    headerName: t("활성여부"),
    field: "is_active",
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["y", "n"],
      formatValue: (value: string) => statusMap[value],
    },
    filter: "agTextColumnFilter",
    filterValueGetter: (params: any) =>
      statusMap[params.data.is_active] ?? params.data.is_active,
    valueFormatter: (params: any) => statusMap[params.value] ?? params.value,
  },
];

onMounted(loadList);
</script>
