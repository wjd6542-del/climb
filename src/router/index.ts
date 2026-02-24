import { createRouter, createWebHistory } from 'vue-router'

import SearchPage from '@/pages/SearchPage.vue'
import LocationPage from '@/pages/LocationPage.vue'
import SharePage from '@/pages/SharePage.vue'
import LocationDetail from '@/pages/LocationDetail.vue'
import SettingPage from '@/pages/settingPage.vue'
import GradePage from '@/pages/GradePage.vue'

const routes = [
	{ path: '/', redirect: '/search' },
	// 통합검색
	{ path: '/search', component: SearchPage },
	// 장소
	{ path: '/location', component: LocationPage },
	// 정보 공유
	{ path: '/share', component: SharePage },
	// 장소 상세정보 페이지
	{ path: '/locationDetail/:id', component: LocationDetail },
	// 환경설정
	{ path: '/setting', component: SettingPage },
	// 난이도 페이지
	{ path: '/grade', component: GradePage },
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})