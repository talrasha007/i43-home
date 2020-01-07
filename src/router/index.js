import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
import Trade from "../views/Trade"
import Hash from '../views/Hash'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/hash',
    name: 'Hash',
    component: Hash
  },
  {
    path: '/trade',
    name: 'trade',
    component: Trade
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
];

const router = new VueRouter({
  routes
});

export default router
