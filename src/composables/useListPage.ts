import { ref, Ref } from "vue";

export interface ListPageOptions<T, P> {
  fetcher: (params: P & { page: number; limit: number }) => Promise<T[]>;
  limit?: number;
  buildParams: () => P;
}

export function useListPage<T, P extends Record<string, unknown>>(
  options: ListPageOptions<T, P>,
) {
  const { fetcher, buildParams, limit = 20 } = options;

  const list: Ref<T[]> = ref([]);
  const page = ref(1);
  const isLoading = ref(false);
  const hasMore = ref(true);

  async function load(append = false) {
    if (isLoading.value) return;
    if (!hasMore.value && append) return;

    isLoading.value = true;

    try {
      const params = {
        ...buildParams(),
        page: page.value,
        limit,
      } as P & { page: number; limit: number };

      const data = (await fetcher(params)) || [];

      list.value = append ? [...list.value, ...data] : data;

      if (data.length < limit) {
        hasMore.value = false;
      }
    } catch (e) {
      console.error("리스트 로딩 실패", e);
    } finally {
      isLoading.value = false;
    }
  }

  function loadMore() {
    if (isLoading.value || !hasMore.value) return;
    if (page.value === 1 && list.value.length < limit) return;

    page.value++;
    load(true);
  }

  function reset() {
    page.value = 1;
    hasMore.value = true;
    load(false);
  }

  return {
    list,
    page,
    limit,
    isLoading,
    hasMore,
    load,
    loadMore,
    reset,
  };
}
