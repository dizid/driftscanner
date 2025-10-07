// main.js
// Entry point for the Vue 3 application.
// Initializes the app with the root component (App.vue) and mounts it to the DOM.
// Includes global CSS for Tailwind styling.

import { createApp } from 'vue';
import App from './App.vue';
import './style.css'; // Global styles with Tailwind
import router from './router'; // Add this line

// Create and mount the Vue app
const app = createApp(App);
app.use(router); // Add this line to use the router
app.mount('#app');
