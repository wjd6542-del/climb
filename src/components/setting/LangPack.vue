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
            @click="onSave"
            class="px-3 py-1.5 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center gap-1"
          >
            <i class="fa-solid fa-save"></i>
            {{ $t("저장") }}
          </button>

          <button
            @click="onDelete"
            class="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-1"
          >
            <i class="fa-solid fa-trash"></i>
            {{ $t("삭제") }}
          </button>
        </div>
      </div>
    </div>

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

<script setup lang="ts">
import { onMounted, getCurrentInstance } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { useToast } from "vue-toastification";

import { langPackService } from "@/api/langPackService";
import { useAgGridCrud } from "@/composables/useAgGridCrud";
import { useI18nStore } from "@/stores/i18nStore";
import { alertStore } from "@/plugins/alert.store";
import type { LangPackRow, LocalizedName } from "@/types";

const t = (k: string) =>
  (getCurrentInstance()?.proxy as any)?.$t(k) ?? k;

const statusMap: Record<string, string> = { y: "활성", n: "비활성" };

const toast = useToast();
const i18n = useI18nStore();

interface FlatRow {
  id: number;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_zh: string;
  is_active: "y" | "n";
}

function toFlat(list: LangPackRow[]): FlatRow[] {
  return list.map((row) => ({
    id: row.id,
    name_ko: row.name.ko,
    name_en: row.name.en,
    name_ja: row.name.ja,
    name_zh: row.name.zh,
    is_active: row.is_active,
  }));
}

function fromFlat(rows: FlatRow[]): LangPackRow[] {
  return rows.map((row) => ({
    id: row.id,
    name: {
      ko: row.name_ko,
      en: row.name_en,
      ja: row.name_ja,
      zh: row.name_zh,
    } as LocalizedName,
    is_active: row.is_active,
  }));
}

const {
  gridApi,
  rowData,
  defaultColDef,
  gridOptions,
  onGridReady,
  onCellEditingStopped,
  loadList,
  addRow,
} = useAgGridCrud<FlatRow>({
  loader: async () => toFlat(await langPackService.list<LangPackRow[]>()),
  saver: (rows) => langPackService.batchSave(fromFlat(rows)),
  deleter: (rows) => langPackService.batchDelete(rows),
  newRowFactory: (id) => ({
    id,
    name_ko: "",
    name_en: "",
    name_ja: "",
    name_zh: "",
    is_active: "y",
  }),
});

async function onSave() {
  const rows = gridApi.value.getSelectedRows();
  if (!rows.length) {
    toast.error("선택된 정보가 없습니다");
    return;
  }
  try {
    await langPackService.batchSave(fromFlat(rows));
    toast.success("저장 완료");
    await loadList();
    await i18n.loadLangPacks();
  } catch (e) {
    console.error(e);
    toast.error("저장 실패");
  }
}

async function onDelete() {
  const rows = gridApi.value.getSelectedRows();
  if (!rows.length) {
    toast.error("선택된 정보가 없습니다");
    return;
  }
  const ok = await alertStore.openConfirm(
    `선택된 ${rows.length}개 항목을 삭제하시겠습니까?`,
    "삭제 확인",
  );
  if (!ok) return;
  try {
    await langPackService.batchDelete(rows);
    toast.success("삭제 완료");
    await loadList();
    await i18n.loadLangPacks();
  } catch (e) {
    toast.error("삭제 중 오류가 발생했습니다");
  }
}

const columnDefs = [
  { headerName: t("한국어"), field: "name_ko", filter: "agTextColumnFilter", flex: 0.5 },
  { headerName: t("영어"), field: "name_en", filter: "agTextColumnFilter", flex: 0.5 },
  { headerName: t("일본어"), field: "name_ja", filter: "agTextColumnFilter", flex: 0.5 },
  { headerName: t("중국어"), field: "name_zh", filter: "agTextColumnFilter", flex: 0.5 },
  {
    headerName: t("활성여부"),
    field: "is_active",
    editable: true,
    flex: 0.5,
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
  {
    headerName: t("자동번역"),
    field: "auto_translate",
    width: 110,
    editable: false,
    cellRenderer: (params: any) => {
      const button = document.createElement("button");
      button.innerHTML = "🌍 번역";
      button.className =
        "px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600";

      button.addEventListener("click", async (e) => {
        e.stopPropagation();
        const row = params.node.data as FlatRow;
        if (!row.name_ko) {
          toast.error("한국어 를 입력하세요");
          return;
        }
        try {
          button.innerText = "번역중...";
          const result = await langPackService.translateText<{
            en: string;
            ja: string;
            zh: string;
          }>(row.name_ko);
          params.node.setDataValue("name_en", result.en);
          params.node.setDataValue("name_ja", result.ja);
          params.node.setDataValue("name_zh", result.zh);
        } catch (err) {
          console.error(err);
        } finally {
          button.innerHTML = "🌍 번역";
        }
      });

      return button;
    },
  },
];

onMounted(loadList);
</script>
