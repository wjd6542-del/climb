<template>
  <div>
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

    <BaseModal v-model="open" :title="'이미지 등록'" width="lg">
      <template #header>
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <i class="fa-solid fa-image"></i>
          이미지 등록
        </h2>
      </template>

      <div v-if="selectedRow" class="space-y-10 p-6">
        <section>
          <h3 class="text-base font-bold mb-4 text-blue-600">
            배너 이미지 (1장)
          </h3>

          <BaseImage :multiple="false" @change="(e: Event) => handleFiles(e, 'banner')" />

          <div class="mt-4">
            <div
              v-if="bannerPreview"
              class="relative w-64 border rounded-xl overflow-hidden shadow"
            >
              <img
                :src="imagePath(bannerPreview.preview || bannerPreview.file_url)"
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

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { AgGridVue } from "ag-grid-vue3";

import { bannerService } from "@/api/bannerService";
import { useAgGridCrud } from "@/composables/useAgGridCrud";
import { useKakaoPostcode } from "@/composables/useKakaoPostcode";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseImage from "@/components/common/BaseImage.vue";

import type { Banner } from "@/types";

interface BannerImage {
  id: number;
  file_url?: string;
  preview?: string;
  file?: File;
  type: "banner" | "activity";
  sort?: number;
  isNew?: boolean;
}

interface BannerRow extends Banner {
  images?: BannerImage[];
}

const statusMap: Record<string, string> = { y: "활성", n: "비활성" };

const open = ref(false);
const selectedRow = ref<BannerRow | null>(null);
const postcode = useKakaoPostcode();

function imagePath(path?: string) {
  return import.meta.env.VITE_API_URL + (path ?? "");
}

const bannerPreview = computed<BannerImage | null>(() => {
  if (!selectedRow.value?.images) return null;
  return selectedRow.value.images.find((i) => i.type === "banner") || null;
});

function buildFormData(rows: BannerRow[]): FormData {
  const formData = new FormData();
  formData.append("data", JSON.stringify(rows));

  rows.forEach((row) => {
    row.images?.forEach((img) => {
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
  });

  return formData;
}

const {
  gridApi,
  rowData,
  defaultColDef,
  gridOptions: baseGridOptions,
  onGridReady,
  loadList,
  addRow,
  saveRows,
  deleteRows,
} = useAgGridCrud<BannerRow>({
  loader: () => bannerService.list<BannerRow[]>(),
  saver: (rows) => bannerService.batchSave(buildFormData(rows)),
  deleter: (rows) => bannerService.batchDelete(rows),
  newRowFactory: (id) => ({
    id,
    name: "",
    address: "",
    address_detail: "",
    url: "",
    is_active: "y",
  }),
});

const gridOptions = {
  ...baseGridOptions,
  onCellClicked: (params: any) => {
    if (params.colDef.colId === "imageColumn") {
      selectedRow.value = params.data;
      open.value = true;
      params.node.setSelected(true);
    }
    if (params.colDef.field === "address") {
      selectedRow.value = params.data;
      searchAddress();
      params.node.setSelected(true);
    }
  },
};

function searchAddress() {
  if (!selectedRow.value) return;
  postcode.open({
    onAddress: (data) => {
      if (!selectedRow.value) return;
      selectedRow.value.address = data.address;
      gridApi.value.applyTransaction({ update: [selectedRow.value] });
      const node = gridApi.value.getRowNode(String(selectedRow.value.id));
      node?.setSelected(true);
    },
  });
}

function handleFiles(e: Event, type: "banner" | "activity") {
  const input = e.target as HTMLInputElement;
  if (!input.files || !selectedRow.value) return;

  const files = Array.from(input.files);
  selectedRow.value.images = selectedRow.value.images || [];

  if (type === "banner") {
    const file = files[0];
    const tempImage: BannerImage = {
      id: Date.now(),
      file,
      preview: URL.createObjectURL(file),
      type: "banner",
      isNew: true,
    };
    selectedRow.value.images = selectedRow.value.images.filter(
      (img) => img.type !== "banner",
    );
    selectedRow.value.images.push(tempImage);
  }

  if (type === "activity") {
    files.forEach((file) => {
      const tempImage: BannerImage = {
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
        type: "activity",
        isNew: true,
      };
      selectedRow.value!.images!.push(tempImage);
    });
  }

  gridApi.value.applyTransaction({ update: [selectedRow.value] });
  input.value = "";
}

function removeImage(imageId: number) {
  if (!selectedRow.value?.images) return;
  selectedRow.value.images = selectedRow.value.images.filter(
    (img) => img.id !== imageId,
  );
  gridApi.value.applyTransaction({ update: [selectedRow.value] });
}

const columnDefs = [
  { headerName: "이름", field: "name", filter: "agTextColumnFilter", flex: 1 },
  {
    headerName: "주소",
    field: "address",
    filter: "agTextColumnFilter",
    flex: 1,
    cellClass: "cursor-pointer text-blue-600 font-semibold",
  },
  { headerName: "URL", field: "url", filter: "agTextColumnFilter", flex: 1 },
  {
    headerName: "이미지",
    colId: "imageColumn",
    editable: false,
    flex: 0.5,
    cellRenderer: () => `
      <button class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600">
        <i class="fa-solid fa-plus"></i> 등록
      </button>
    `,
  },
  { headerName: "정렬", field: "sort", filter: "agTextColumnFilter", flex: 0.5 },
  {
    headerName: "활성여부",
    field: "is_active",
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: ["y", "n"] },
    valueFormatter: (params: any) => statusMap[params.value] ?? params.value,
    flex: 0.5,
  },
];

onMounted(loadList);
</script>
