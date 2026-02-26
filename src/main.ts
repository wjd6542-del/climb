import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { createPinia } from "pinia";

import { useI18nStore } from "@/stores/i18nStore";

import './style.css'
// 아이콘 폰트 어섬 추가
import '@fortawesome/fontawesome-free/css/all.min.css'
// 테이블 css
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// 토스 알림용
import Toast, { useToast } from "vue-toastification";
import "vue-toastification/dist/index.css";

// 토클 ui 전역설정
import Toggle from '@/components/common/Toggle.vue'

// 알림창
import AlertPlugin from "@/plugins/alert.plugin";

// 캘린더
import VCalendar from "v-calendar";
import "v-calendar/style.css";

/* ✅ AG Grid v33 */
import { ModuleRegistry, AllCommunityModule, RowSelectionModule } from "ag-grid-community";

/* ✅ 커뮤니티 전체 기능 등록 */
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";

import VueECharts from "vue-echarts"
import * as echarts from "echarts/core"

import {
	BarChart,
	LineChart,
	PieChart
} from "echarts/charts"

import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent
} from "echarts/components"

import { CanvasRenderer } from "echarts/renderers"

echarts.use([
	BarChart,
	LineChart,
	PieChart,
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	CanvasRenderer
])



const pinia = createPinia();

const app = createApp(App)
app.component('Toggle', Toggle)
app.component("v-chart", VueECharts)
// 툴팁
app.use(FloatingVue);

app.use(VCalendar, {});

// 설정 먼저 적용
app.use(Toast, {
	position: "top-right",
	timeout: 2000,
	closeOnClick: true,
	pauseOnHover: true,
});
app.config.globalProperties.$toast = useToast();
app.use(router)
app.use(AlertPlugin)
app.use(pinia);
app.mount('#app')