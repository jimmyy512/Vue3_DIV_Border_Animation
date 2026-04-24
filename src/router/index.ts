import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import InterviewView from '@/views/InterviewView.vue'
import ControlView from '@/views/ControlView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/main'
    },
    {
      path: '/main',
      name: 'main',
      component: InterviewView,
    },
    {
      path: '/control',
      name: 'control',
      component: ControlView,
    }
  ],
})

export default router
