import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Dashboard from '../pages/Dashboard.vue';
import PokemonDetail from '../pages/PokemonDetail.vue';
import PokemonComparison from '../pages/PokemonComparison.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      requiresAuth: false,
      title: 'Home',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
    },
  },
  {
    path: '/pokemon/:name',
    name: 'pokemon-detail',
    component: PokemonDetail,
    meta: {
      requiresAuth: true,
      title: 'Pokémon Details',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: 'Login',
    },
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      requiresAuth: false,
      title: 'Register',
    },
  },
  {
    path: '/compare',
    name: 'compare',
    component: PokemonComparison,
    meta: {
      requiresAuth: true,
      title: 'Compare Pokémon',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: {
      title: 'Page Not Found',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Set page title
  document.title = `${to.meta.title} | Pokédex`;

  // If auth state is not initialized, check it
  if (!authStore.isAuthenticated && !authStore.loading) {
    await authStore.initializeAuth();
  }

  // Handle authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // Redirect authenticated users away from login/register pages
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
    return;
  }

  next();
});

export default router;
