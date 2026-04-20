<template>
  <div class="relative w-full">
    <div
      class="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white shadow rounded flex overflow-hidden"
    >
      <input
        v-model="keyword"
        @keyup.enter.prevent="searchMarker"
        type="text"
        :placeholder="$t('검색')"
        class="px-3 py-2 text-sm outline-none w-60"
      />
      <button @click="searchMarker" class="px-3 bg-blue-500 text-white text-sm">
        {{ $t("검색") }}
      </button>
    </div>

    <div
      v-if="searchResults.length > 1"
      class="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white shadow-lg rounded w-72 max-h-60 overflow-y-auto"
    >
      <div
        v-for="item in searchResults"
        :key="item.id"
        @click="selectFromList(item)"
        class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b"
      >
        {{ item.name }}
      </div>
    </div>

    <div
      ref="mapContainer"
      :class="['w-full h-[500px] rounded border', attrs.class]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useAttrs, watch } from "vue";
import { useToast } from "vue-toastification";

interface MarkerItem {
  id: number;
  name: string;
  address?: string;
  address_detail?: string;
  lat: number;
  lon: number;
  gymTypeMap?: any[];
}

interface Props {
  markers?: MarkerItem[];
  level?: number;
}

const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
  level: 4,
});

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const toast = useToast();

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<any>(null);
const markerObjects = ref<any[]>([]);
const overlays = ref<any[]>([]);
const keyword = ref("");
const searchResults = ref<MarkerItem[]>([]);
const activeId = ref<number | null>(null);

function renderMarkers(currentActiveId: number | null = activeId.value) {
  if (!map.value) return;

  markerObjects.value.forEach((m) => m.setMap(null));
  overlays.value.forEach((o) => o.setMap(null));

  markerObjects.value = [];
  overlays.value = [];

  const GYM_TYPE_STYLE: Record<string, { icon: string; iconColor: string }> = {
    OUTDOOR_ROCK: { icon: "fa-mountain", iconColor: "#22c55e" },
    ICE: { icon: "fa-snowflake", iconColor: "#60a5fa" },
    INDOOR: { icon: "fa-hand-fist", iconColor: "#facc15" },
  };

  function getGymCategory(gymTypeMap: any[] = []) {
    const names = gymTypeMap.map((m) => m.GymType?.name);
    if (names.includes("자연암벽")) return "OUTDOOR_ROCK";
    if (names.includes("빙벽")) return "ICE";
    return "INDOOR";
  }

  props.markers.forEach((item) => {
    const position = new window.kakao.maps.LatLng(item.lat, item.lon);
    const marker = new window.kakao.maps.Marker({ position });
    marker.setMap(map.value);

    window.kakao.maps.event.addListener(marker, "click", () => {
      moveToMarker(item);
    });

    const style = GYM_TYPE_STYLE[getGymCategory(item.gymTypeMap)];

    const overlay = new window.kakao.maps.CustomOverlay({
      position,
      content: `
        <div style="
          background:${currentActiveId === item.id ? "#3b82f6" : "white"};
          color:${currentActiveId === item.id ? "white" : "black"};
          padding:6px 10px;
          border-radius:8px;
          font-size:12px;
          font-weight:600;
          box-shadow:0 4px 10px rgba(0,0,0,0.15);
          transform: translateY(-55px);
          min-width:160px;
        ">
          <div style="font-weight:700;">
            <i class="fa-solid ${style.icon}"
               style="color:${style.iconColor}; margin-right:6px;"></i>
            ${item.name}
          </div>
          ${
            currentActiveId === item.id
              ? `<div style="margin-top:4px;font-size:11px;font-weight:400;">
                   ${item.address || ""} ${item.address_detail || ""}
                 </div>`
              : ""
          }
        </div>
      `,
    });

    overlay.setMap(map.value);
    markerObjects.value.push(marker);
    overlays.value.push(overlay);
  });
}

function initMap() {
  if (!mapContainer.value) return;
  const center = new window.kakao.maps.LatLng(37.5665, 126.978);
  map.value = new window.kakao.maps.Map(mapContainer.value, {
    center,
    level: props.level,
  });

  renderMarkers();

  if (props.markers.length > 0) {
    moveToMarker(props.markers[props.markers.length - 1]);
  }
}

function moveToMarker(item: MarkerItem) {
  const position = new window.kakao.maps.LatLng(item.lat, item.lon);
  map.value.setCenter(position);
  activeId.value = item.id;
  renderMarkers(item.id);
}

function searchMarker() {
  if (!keyword.value || !props.markers?.length) return;

  const results = props.markers.filter((m) =>
    m.name.toLowerCase().includes(keyword.value.toLowerCase()),
  );

  if (results.length === 0) {
    toast.error("검색 결과가 없습니다");
    return;
  }

  if (results.length === 1) {
    moveToMarker(results[0]);
    searchResults.value = [];
    return;
  }

  searchResults.value = results;
}

function selectFromList(item: MarkerItem) {
  moveToMarker(item);
  searchResults.value = [];
}

watch(
  () => props.markers,
  (newVal) => {
    renderMarkers();
    if (newVal && newVal.length > 0 && map.value) {
      moveToMarker(newVal[newVal.length - 1]);
    }
  },
  { deep: true },
);

onMounted(() => {
  if (window.kakao && window.kakao.maps) {
    window.kakao.maps.load(initMap);
  }
});
</script>
