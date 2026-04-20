# 리펙토링 정리 문서

Vue 3 + Pinia + Vue Router + TailwindCSS 기반 climb-frontend-vue-router 프로젝트의 전체 리펙토링 기록입니다.

---

## 1. 목표

- **비즈니스 로직과 UI 분리**: API 호출, 상태 관리, 재사용 로직을 페이지 컴포넌트 바깥으로 추출
- **중복 제거**: 페이지·컴포넌트 사이의 반복 코드 한 곳으로 집약
- **타입 안정성 확보**: `any` 남발 지양, 도메인 모델에 인터페이스 부여
- **코드 스타일 통일**: Options API / Composition API 혼용 → `<script setup lang="ts">` 단일화

---

## 2. 새로 만든 계층

### 2.1 API 서비스 레이어 — [src/api/](src/api/)

페이지에 산재하던 `api.post("/api/...")` 호출을 도메인별 서비스로 분리했습니다.

| 파일 | 담당 엔드포인트 |
|---|---|
| [gymService.ts](src/api/gymService.ts) | `/api/gyms/*` (list, pageList, get, save, update, delete, sidoGroup) |
| [gymDetailService.ts](src/api/gymDetailService.ts) | `/api/gymDetail/*` (getGym, save, update) |
| [gymTypeService.ts](src/api/gymTypeService.ts) | `/api/gymType/*` (list, allList, batchSave, batchDelete) |
| [amenitiesService.ts](src/api/amenitiesService.ts) | `/api/amenities/*` |
| [routeService.ts](src/api/routeService.ts) | `/api/route/*` |
| [gymPostService.ts](src/api/gymPostService.ts) | `/api/gymPost/*` |
| [bannerService.ts](src/api/bannerService.ts) | `/api/banner/*` |
| [boulderColorService.ts](src/api/boulderColorService.ts) | `/api/boulderColor/*` |
| [difficultyService.ts](src/api/difficultyService.ts) | `/api/difficulty/*` |
| [settingsService.ts](src/api/settingsService.ts) | `/api/settings/*` |
| [langPackService.ts](src/api/langPackService.ts) | `/api/langPack/*` |
| [uploadService.ts](src/api/uploadService.ts) | `/api/upload` |
| [index.ts](src/api/index.ts) | 배럴 export |

서비스는 `res.data`를 자동으로 언랩해서 반환하므로 호출부에서 `.data` 접근을 제거할 수 있습니다.

```ts
// Before
const res = await api.post("/api/gyms/pageList", params);
this.GYMS = res.data;

// After
list.value = await gymService.pageList<Gym[]>(params);
```

### 2.2 Composables — [src/composables/](src/composables/)

| Composable | 용도 |
|---|---|
| [useListPage.ts](src/composables/useListPage.ts) | 무한스크롤 리스트 상태 (list, page, limit, isLoading, hasMore, load, loadMore, reset) |
| [useImageUpload.ts](src/composables/useImageUpload.ts) | 신규/기존 이미지 관리, 파일 검증 (5MB 제한), 프리뷰, FormData 주입 |
| [useKakaoPostcode.ts](src/composables/useKakaoPostcode.ts) | Daum 우편번호 + Kakao 지오코더 (`open({ onAddress })` 하나로 좌표까지 반환) |
| [useAgGridCrud.ts](src/composables/useAgGridCrud.ts) | AG Grid 기반 세팅 테이블 공통 CRUD (행 추가/저장/삭제, 기본 그리드 옵션) |

### 2.3 타입 정의 — [src/types/](src/types/)

도메인 모델 인터페이스 — `any` 대신 사용하도록 페이지/컴포넌트에서 임포트.

| 파일 | 포함 타입 |
|---|---|
| [common.ts](src/types/common.ts) | `YesNo`, `ImageFile`, `PageParams`, `BookmarkItem` |
| [gym.ts](src/types/gym.ts) | `Gym`, `GymForm`, `GymDetail`, `GymDetailForm`, `GymType`, `Amenity`, `BoulderColor`, `Difficulty`, `HoursMap`, `OperatingHour`, `SidoGroupItem` |
| [route.ts](src/types/route.ts) | `Route`, `RouteForm`, `ClimbType`, `Environment` |
| [gymPost.ts](src/types/gymPost.ts) | `GymPost`, `GymPostForm` |
| [banner.ts](src/types/banner.ts) | `Banner` |
| [langPack.ts](src/types/langPack.ts) | `LangCode`, `LocalizedName`, `LangPackRow` |
| [index.ts](src/types/index.ts) | 배럴 export |

### 2.4 기반 설정

- [tsconfig.json](tsconfig.json) 추가 — 이전에는 TS 설정이 없어 IDE/Volar가 타입 추론에 한계
- [src/shims-vue.d.ts](src/shims-vue.d.ts) 추가 — `$t`, `$alert`, `$confirm`, `$toast` 전역 프로퍼티 타입 선언
- [src/lib/api.ts](src/lib/api.ts) — 기존 `api.js`를 TS로 전환, 응답 인터셉터의 `err.response.data` 접근 NPE 방지(`err.response?.data ?? err`)

---

## 3. 기존 파일 변환 내역

### 3.1 `.js` → `.ts`

| Before | After |
|---|---|
| `src/lib/api.js` | [src/lib/api.ts](src/lib/api.ts) |
| `src/stores/bookmarkStore.js` | [src/stores/bookmarkStore.ts](src/stores/bookmarkStore.ts) |
| `src/stores/i18nStore.js` | [src/stores/i18nStore.ts](src/stores/i18nStore.ts) |
| `src/plugins/alert.store.js` | [src/plugins/alert.store.ts](src/plugins/alert.store.ts) |
| `src/plugins/alert.plugin.js` | [src/plugins/alert.plugin.ts](src/plugins/alert.plugin.ts) |

부수 효과:
- [bookmarkStore.ts](src/stores/bookmarkStore.ts)의 `isBookmarked` 버그 수정 — 기존엔 `gym.id === id`로 비교했지만 `toggle`이 `gym.key`를 넘겨 항상 false가 되어 삭제가 작동하지 않았음. `key` 기준으로 통일.

### 3.2 페이지 재작성 (Options API → `<script setup lang="ts">`)

| 파일 | 주요 변경 |
|---|---|
| [pages/GymPage.vue](src/pages/GymPage.vue) | 859줄 → 약 395줄. `useListPage`, `useImageUpload`, `useKakaoPostcode` 적용 |
| [pages/GradePage.vue](src/pages/GradePage.vue) | 682줄 → 약 385줄. `applyAutoSetting` 헬퍼 추출 |
| [pages/GymPostPage.vue](src/pages/GymPostPage.vue) | 446줄 → 약 285줄. `dateRange` 필드 타입 보강 |
| [pages/MainPage.vue](src/pages/MainPage.vue) | `onMounted`에서 `Promise.all` 병렬 로딩 |
| [pages/GymDetailPage.vue](src/pages/GymDetailPage.vue) | `useRoute` 기반으로 재작성 |
| [pages/GymPostDetailPage.vue](src/pages/GymPostDetailPage.vue) | 동일 |
| [pages/SettingPage.vue](src/pages/SettingPage.vue) | `markRaw` 탭 구조 유지하면서 `computed` 기반으로 변경 |
| [layouts/HomeLayout.vue](src/layouts/HomeLayout.vue) | 배너 로딩 `bannerService` 사용 |
| [layouts/DefaultLayout.vue](src/layouts/DefaultLayout.vue) | 단순화 |

### 3.3 세팅 컴포넌트 공통화 ([src/components/setting/](src/components/setting/))

모두 `useAgGridCrud` 적용으로 보일러플레이트 대폭 축소:

- [Amenities.vue](src/components/setting/Amenities.vue)
- [Types.vue](src/components/setting/Types.vue)
- [BoulderColor.vue](src/components/setting/BoulderColor.vue)
- [Difficulty.vue](src/components/setting/Difficulty.vue)
- [Setting.vue](src/components/setting/Setting.vue) — `key` 필터 유지
- [LangPack.vue](src/components/setting/LangPack.vue) — `toFlat/fromFlat` 변환 유지, 번역 버튼 renderer는 그대로
- [Banner.vue](src/components/setting/Banner.vue) — FormData 기반 `saveRows`를 `buildFormData` 헬퍼로 추출

### 3.4 공용 컴포넌트 Composition API 전환

모두 `<script setup lang="ts">`로:

- [App.vue](src/App.vue), [components/layout/Header.vue](src/components/layout/Header.vue)
- [MultiCheck.vue](src/components/common/MultiCheck.vue), [MultiColorSelect.vue](src/components/common/MultiColorSelect.vue)
- [SearchSelect.vue](src/components/common/SearchSelect.vue), [SearchColorSelect.vue](src/components/common/SearchColorSelect.vue)
- [BaseModal.vue](src/components/common/BaseModal.vue), [BaseImage.vue](src/components/common/BaseImage.vue), [BaseDropdown.vue](src/components/common/BaseDropdown.vue), [AlertModal.vue](src/components/common/AlertModal.vue)
- [ScrollTop.vue](src/components/common/ScrollTop.vue), [DateTime.vue](src/components/common/DateTime.vue), [BookmarkList.vue](src/components/common/BookmarkList.vue)
- [KakaoMap.vue](src/components/common/KakaoMap.vue), [DateRangePicker.vue](src/components/common/DateRangePicker.vue), [Editor.vue](src/components/common/Editor.vue)
- [RouteList.vue](src/components/route/RouteList.vue), [RouteItem.vue](src/components/route/RouteItem.vue)
- [PostList.vue](src/components/gymPost/PostList.vue), [PostItem.vue](src/components/gymPost/PostItem.vue)
- [BannerList.vue](src/components/banner/BannerList.vue), [BannerItem.vue](src/components/banner/BannerItem.vue)
- [GymItem.vue](src/components/gym/GymItem.vue)

---

## 4. 리팩터링 결과 수치

| 항목 | Before | After |
|---|---|---|
| Options API 사용 Vue 파일 | 22개 | 0개 |
| `<script setup>` 사용 Vue 파일 | 약 5개 | 44개 |
| `.js` 파일 (stores/plugins/lib) | 5개 | 0개 |
| 페이지 바깥에서 `api.post(...)` 직접 호출 | 40+ 곳 | 0 곳 (서비스 레이어 내부만) |
| `GymPage.vue` 줄 수 | 859 | 약 395 |
| `GradePage.vue` 줄 수 | 682 | 약 385 |

---

## 5. 사용 예시

### 5.1 리스트 페이지 패턴

```ts
import { useListPage } from "@/composables/useListPage";
import { gymPostService } from "@/api/gymPostService";
import type { GymPost } from "@/types";

const { list, isLoading, hasMore, load, loadMore, reset } = useListPage<
  GymPost,
  { gym_id: number | string; keyword: string }
>({
  fetcher: (params) => gymPostService.pageList<GymPost[]>(params),
  buildParams: () => ({
    gym_id: search.gym_id,
    keyword: search.keyword,
  }),
});

onMounted(() => load(false));
```

### 5.2 이미지 업로드 폼 패턴

```ts
import { useImageUpload } from "@/composables/useImageUpload";

const {
  existingImages,
  newPreviews,
  handleFiles,
  removeNewImage,
  removeExistingImage,
  setExistingImages,
  resetUpload,
  appendFilesToFormData,
} = useImageUpload(); // 기본 5MB, FileReader
```

### 5.3 세팅 테이블 패턴

```ts
import { useAgGridCrud } from "@/composables/useAgGridCrud";
import { gymTypeService } from "@/api/gymTypeService";
import type { GymType } from "@/types";

const {
  rowData,
  defaultColDef,
  gridOptions,
  onGridReady,
  loadList,
  addRow,
  saveRows,
  deleteRows,
} = useAgGridCrud<GymType>({
  loader: () => gymTypeService.allList<GymType[]>(),
  saver: (rows) => gymTypeService.batchSave(rows),
  deleter: (rows) => gymTypeService.batchDelete(rows),
  newRowFactory: (id) => ({ id, name: "", icon: "", is_active: "y", sort: 0 }),
});
```

### 5.4 Kakao 주소 검색 패턴

```ts
import { useKakaoPostcode } from "@/composables/useKakaoPostcode";

const postcode = useKakaoPostcode();

function searchAddress() {
  postcode.open({
    onAddress: (data, coords) => {
      form.address = data.address;
      form.post = data.zonecode;
      form.sido = data.sido;
      if (coords) {
        form.lat = coords.lat;
        form.lon = coords.lon;
      }
    },
  });
}
```

---

## 6. 검증 필요 항목

자동 테스트가 없는 프로젝트이므로 실행 검증이 필요합니다. `npm run dev` 후 다음 플로우를 확인해주세요:

- [ ] **로그인/토큰**: 요청 인터셉터의 Authorization 헤더 전달
- [ ] **GymPage**: 리스트 무한스크롤, 장소 등록/수정/삭제, 상세정보 모달 이미지 업로드, 지도 모달, 주소 검색
- [ ] **GradePage**: 루트 등록/수정/삭제, auto-set 드롭다운, 이미지 업로드
- [ ] **GymPostPage**: 게시글 CRUD, 날짜 범위 필터
- [ ] **MainPage**: 병렬 로딩, ECharts 렌더, 지도 모달
- [ ] **북마크**: 패널 열기/닫기, 추가/삭제, 토글 동작 (기존 버그 수정으로 삭제가 실제로 작동)
- [ ] **세팅 각 탭**: 추가/저장/삭제, AG Grid 셀 편집
- [ ] **언어 변경**: Dropdown에서 `setLocale` 호출 및 번역 키 반영
- [ ] **KakaoMap 마커**: 마커 클릭, 검색, 리스트 선택

---

## 7. 다음 단계 제안

이번 리팩터링에서 스코프를 벗어난 것들:

- **테스트 도입**: Vitest + Vue Test Utils로 composable 단위 테스트부터 시작하면 구조가 다 분리되어 있어 쉽게 가능
- **Zod 검증**: 이미 dependency에 있음. API 응답/폼 입력에 스키마 적용
- **로깅**: `console.error` 대신 중앙 로거 도입
- **i18n 표준화**: 현재 커스텀 `$t`지만 `vue-i18n` 도입 고려
- **Route-level code splitting**: [router/index.ts](src/router/index.ts)에 `() => import()` 동적 import
- **MainPage 검색 디바운스**: `handleSearch`가 매 엔터마다 호출되는데 디바운스 추가 고려
