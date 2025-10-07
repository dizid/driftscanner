// router.js
// Configures Vue Router for the Drift PnL Tracker app.
// Defines routes for navigation, including the new Drift PnL page.
// Maintainable and extensible with clear route definitions.

import { createRouter, createWebHistory } from 'vue-router';

// Define routes
const routes = [
  {
    // Default route (home page)
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue') // Placeholder
  },
  {
    // Drift PnL Tracker route
    path: '/drift-pnl',
    name: 'DriftPnL',
    component: () => import('./views/DriftPnL.vue') // Matches the previously provided view
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Export router for use in main.js
export default router;