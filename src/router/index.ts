import { createRouter, createWebHistory } from 'vue-router'

// 🔥 Layout
import HomeLayout from '@/layouts/HomeLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// 🔥 Pages
import MainPage from '@/pages/MainPage.vue'
import gymPage from '@/pages/gymPage.vue'
import GymDetailPage from '@/pages/GymDetailPage.vue'
import SettingPage from '@/pages/settingPage.vue'
import GradePage from '@/pages/GradePage.vue'
import GymPostPage from '@/pages/GymPostPage.vue'
import GymPostDetailPage from '@/pages/GymPostDetailPage.vue'

const routes = [
	// 🔥 루트 접근 시 search로 이동
	{
		path: '/',
		redirect: '/search',
	},

	// 🔥 메인 (사이드바 있는 레이아웃)
	{
		path: '/',
		component: HomeLayout,
		children: [
			{
				path: 'search',
				name: 'search',
				component: MainPage,
			},
		],
	},

	// 🔥 나머지 일반 페이지 (기본 레이아웃)
	{
		path: '/',
		component: DefaultLayout,
		children: [
			{
				path: 'location',
				name: 'location',
				component: gymPage,
			},
			{
				path: 'locationDetail',
				name: 'locationDetail',
				component: GymDetailPage,
			},
			{
				path: 'share',
				name: 'share',
				component: GymPostPage,
			},
			{
				path: 'shareDetail',
				name: 'shareDetail',
				component: GymPostDetailPage,
			},
			{
				path: 'setting',
				name: 'setting',
				component: SettingPage,
			},
			{
				path: 'grade',
				name: 'grade',
				component: GradePage,
			},
		],
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})