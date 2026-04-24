import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import InterviewView from '@/views/InterviewView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: InterviewView,
    },
    {
      path: '/main',
      name: 'main',
      component: InterviewView,
    },
  ],
})

export default router
