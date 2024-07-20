import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/login/LoginView.vue'
import OtherView from '../views/OtherView.vue'
import SkuView from '../views/goods/SkuView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: { title: '首页' },
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      meta: { title: '登录' },
      component: LoginView
    },
    {
      path: '/goods/:goodsId',
      name: 'GoodsPanel',
      meta: { title: '商品信息' },
      component: SkuView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/:o(.*)',
      name: 'notfound',
      component: OtherView
    }
  ]
})

export default router
