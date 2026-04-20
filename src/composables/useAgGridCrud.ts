import { ref, Ref } from "vue";
import { useToast } from "vue-toastification";
import { alertStore } from "@/plugins/alert.store";

export interface AgGridCrudOptions<T> {
  loader: () => Promise<T[]>;
  saver: (rows: T[]) => Promise<unknown>;
  deleter: (rows: T[]) => Promise<unknown>;
  newRowFactory: (tempId: number) => T;
  afterSave?: () => void | Promise<void>;
  afterDelete?: () => void | Promise<void>;
}

export function useAgGridCrud<T extends { id: number }>(
  options: AgGridCrudOptions<T>,
) {
  const toast = useToast();

  const gridApi: Ref<any> = ref(null);
  const rowData: Ref<T[]> = ref([]);
  let tempId = -1;

  const defaultColDef = {
    sortable: true,
    filter: true,
    editable: true,
    resizable: true,
  };

  const gridOptions = {
    getRowId: (params: any) => String(params.data.id),
    rowSelection: {
      mode: "multiRow",
      checkboxes: true,
      headerCheckbox: true,
    },
    onCellValueChanged: (params: any) => {
      if (params.oldValue !== params.newValue) {
        params.node.setSelected(true);
      }
    },
    rowClassRules: {
      "row-inactive": (params: any) => params.data?.is_active === "n",
    },
  };

  function onGridReady(params: any) {
    gridApi.value = params.api;
    setTimeout(() => params.api.sizeColumnsToFit(), 0);
  }

  function onCellEditingStopped(params: any) {
    params.api.setNodesSelected({
      nodes: [params.node],
      newValue: true,
      clearSelection: false,
    });
  }

  async function loadList() {
    rowData.value = [];
    rowData.value = await options.loader();
  }

  function addRow() {
    const newRow = options.newRowFactory(tempId--);
    const res = gridApi.value.applyTransaction({ add: [newRow], addIndex: 0 });
    res.add[0].setSelected(true);
  }

  async function saveRows() {
    const rows = gridApi.value.getSelectedRows();
    if (rows.length === 0) {
      toast.error("선택된 정보가 없습니다");
      return;
    }

    try {
      await options.saver(rows);
      toast.success("저장 완료");
      await loadList();
      await options.afterSave?.();
    } catch (e) {
      console.error(e);
      toast.error("저장 실패");
    }
  }

  async function deleteRows() {
    const rows = gridApi.value.getSelectedRows();
    if (rows.length === 0) {
      toast.error("선택된 정보가 없습니다");
      return;
    }

    const ok = await alertStore.openConfirm(
      `선택된 ${rows.length}개 항목을 삭제하시겠습니까?`,
      "삭제 확인",
    );
    if (!ok) return;

    try {
      await options.deleter(rows);
      toast.success("삭제 완료");
      await loadList();
      await options.afterDelete?.();
    } catch (e) {
      toast.error("삭제 중 오류가 발생했습니다");
    }
  }

  return {
    gridApi,
    rowData,
    defaultColDef,
    gridOptions,
    onGridReady,
    onCellEditingStopped,
    loadList,
    addRow,
    saveRows,
    deleteRows,
  };
}
