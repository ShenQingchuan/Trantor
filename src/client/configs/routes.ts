import { createRouter, createWebHistory } from 'vue-router'
import Default from '../pages/Default.vine'
import PageHome from '../pages/Home.vine'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: PageHome },
    { path: '/articles', component: () => import('../pages/ArticleList.vine').then(m => m.PageArticles) },
    { path: '/articles/:path', component: () => import('../pages/Article.vine').then(m => m.PageArticleContent) },
    { path: '/os', name: 'MyOS', component: () => import('../pages/MyOS.vine').then(m => m.PageMyOS) },
    // 404 fallback
    { path: '/:pathMatch(.*)*', component: Default },
  ],
})

export default router
