<template>
  <div class="relative w-full">
    <!-- 🔍 검색 -->
    <div
      class="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white shadow rounded flex overflow-hidden"
    >
      <input
        v-model="keyword"
        @keyup.enter.prevent="searchMarker"
        type="text"
        placeholder="이름 검색"
        class="px-3 py-2 text-sm outline-none w-60"
      />
      <button @click="searchMarker" class="px-3 bg-blue-500 text-white text-sm">
        검색
      </button>
    </div>

    <!-- 🔎 검색 결과 리스트 -->
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

    <!-- 지도 -->
    <div
      ref="mapContainer"
      :class="['w-full h-[500px] rounded border', $attrs.class]"
    ></div>
  </div>
</template>

<script>
export default {
  name: "KakaoMap",
  inheritAttrs: false,

  props: {
    markers: {
      type: Array,
      default: () => [],
    },
    level: {
      type: Number,
      default: 4,
    },
  },

  data() {
    return {
      map: null,
      markerObjects: [],
      overlays: [],
      keyword: "",
      searchResults: [],
      activeId: null,
      bounceTimer: null,
      bouncingMarker: null,
    };
  },

  mounted() {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        this.initMap();
      });
    }
  },

  watch: {
    markers: {
      handler(newVal) {
        this.renderMarkers();
        // 🔥 마지막 데이터로 자동 포커스
        if (newVal && newVal.length > 0) {
          const lastItem = newVal[newVal.length - 1];

          // 지도 생성 이후에만 동작
          if (this.map) {
            this.moveToMarker(lastItem);
          }
        }
      },
      deep: true,
    },
  },

  methods: {
    initMap() {
      const center = new window.kakao.maps.LatLng(37.5665, 126.978);

      this.map = new window.kakao.maps.Map(this.$refs.mapContainer, {
        center,
        level: this.level,
      });

      this.renderMarkers();

      // 🔥 최초 로딩시 마지막 마커로 이동
      if (this.markers.length > 0) {
        const lastItem = this.markers[this.markers.length - 1];
        this.moveToMarker(lastItem);
      }
    },

    renderMarkers(activeId = this.activeId) {
      if (!this.map) return;

      // 기존 제거
      this.markerObjects.forEach((m) => m.setMap(null));
      this.overlays.forEach((o) => o.setMap(null));

      this.stopBounce();

      this.markerObjects = [];
      this.overlays = [];

      this.markers.forEach((item) => {
        const position = new window.kakao.maps.LatLng(item.lat, item.lon);

        const marker = new window.kakao.maps.Marker({
          position,
        });

        marker.setMap(this.map);

        // 🔥 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, "click", () => {
          this.moveToMarker(item);
        });

        const hasOutdoor = item.gymTypeMap?.some(
          (map) => map.GymType?.name === "자연암벽",
        );

        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content: `
        <div style="
          background:${activeId === item.id ? "#3b82f6" : "white"};
          color:${activeId === item.id ? "white" : "black"};
          padding:6px 10px;
          border-radius:8px;
          font-size:12px;
          font-weight:600;
          box-shadow:0 4px 10px rgba(0,0,0,0.15);
          transform: translateY(-55px);
          min-width:160px;
        ">
          <div style="font-weight:700;">
			${
        hasOutdoor
          ? `<i class="text-green-300 fa-solid fa-mountain"></i>`
          : `<i class="text-yellow-300 fa-solid fa-solid fa-hand-fist"></i>`
      }
			
            ${item.name}
          </div>
          ${
            activeId === item.id
              ? `<div style="margin-top:4px;font-size:11px;font-weight:400;">
                   ${item.address || ""} ${item.address_detail || ""}
                 </div>`
              : ""
          }
        </div>
      `,
        });

        overlay.setMap(this.map);

        this.markerObjects.push(marker);
        this.overlays.push(overlay);
      });
    },

    searchMarker() {
      if (!this.keyword) return;

      if (!this.markers || this.markers.length === 0) return;

      const results = this.markers.filter((m) =>
        m.name.toLowerCase().includes(this.keyword.toLowerCase()),
      );

      if (results.length === 0) {
        this.$toast.error("검색 결과가 없습니다");
        return;
      }

      if (results.length === 1) {
        this.moveToMarker(results[0]);
        this.searchResults = [];
        return;
      }

      this.searchResults = results;
    },

    selectFromList(item) {
      this.moveToMarker(item);
      this.searchResults = [];
    },

    moveToMarker(item) {
      const position = new window.kakao.maps.LatLng(item.lat, item.lon);

      this.map.setCenter(position);
      //this.map.setLevel(3);

      this.activeId = item.id;
      this.renderMarkers(item.id);
    },

    // 🔥 바운스 애니메이션
    startBounce(marker, item) {
      this.stopBounce();

      const originalPosition = new window.kakao.maps.LatLng(item.lat, item.lon);

      let offset = 0;
      let direction = 1;

      this.bouncingMarker = marker;

      this.bounceTimer = setInterval(() => {
        offset += direction * 0.00005;

        if (offset > 0.0003) direction = -1;
        if (offset < 0) direction = 1;

        const bouncePosition = new window.kakao.maps.LatLng(
          item.lat + offset,
          item.lon,
        );

        marker.setPosition(bouncePosition);
      }, 30);
    },

    stopBounce() {
      if (this.bounceTimer) {
        clearInterval(this.bounceTimer);
        this.bounceTimer = null;
      }
      this.bouncingMarker = null;
    },
  },
};
</script>
