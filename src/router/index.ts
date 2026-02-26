import { createRouter, createWebHistory } from 'vue-router'

import MainPage from '@/pages/MainPage.vue'
import gymPage from '@/pages/gymPage.vue'
import GymDetailPage from '@/pages/GymDetailPage.vue'
import SettingPage from '@/pages/settingPage.vue'
import GradePage from '@/pages/GradePage.vue'

import GymPostPage from '@/pages/GymPostPage.vue'
import GymPostDetailPage from '@/pages/GymPostDetailPage.vue'

const routes = [
	{ path: '/', redirect: '/search' },
	// 통합검색
	{ path: '/search', component: MainPage },
	// 장소
	{ path: '/location', component: gymPage },
	// 장소 상세정보 페이지
	{ path: '/locationDetail', component: GymDetailPage },
	// 정보 공유
	{ path: '/share', component: GymPostPage },
	// 정보 공유
	{ path: '/shareDetail', component: GymPostDetailPage },
	// 환경설정
	{ path: '/setting', component: SettingPage },
	// 난이도 페이지
	{ path: '/grade', component: GradePage },
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})