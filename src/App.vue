<!-- App.vue -->
<!-- Root component for the Drift PnL Tracker app. Provides a simple layout with navigation. -->
<!-- Uses Tailwind for consistent, maintainable styling. Includes router-view for page routing. -->

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <nav class="bg-drift-purple text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Drift PnL Tracker</h1>
        <ul class="flex space-x-4">
          <li><router-link to="/" class="hover:underline">Home</router-link></li>
          <li><router-link to="/drift-pnl" class="hover:underline">PnL Tracker</router-link></li>
        </ul>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mx-auto p-4">
      <router-view />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>

<style scoped>
/* Scoped styles if needed */
</style>