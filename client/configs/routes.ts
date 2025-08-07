import { createRouter, createWebHistory } from 'vue-router'
import Default from '../pages/Default.vine'
import PageHome from '../pages/Home.vine'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: PageHome },
    { path: '/articles', component: () => import('../pages/Articles.vine').then(m => m.PageArticles) },
    { path: '/articles/:path', component: () => import('../pages/Articles.vine').then(m => m.PageArticleContent) },
    // 404 fallback
    { path: '/:pathMatch(.*)*', component: Default },
  ],
})

export default router
