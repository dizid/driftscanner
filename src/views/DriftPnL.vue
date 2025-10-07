<!-- DriftPnL.vue -->
<!-- Main view for Drift PnL Tracker. Responsive, mobile-first design mimicking Drift app screenshot. -->
<!-- Uses Tailwind for clean, maintainable styles. Expandable sections for positions. -->

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto text-center mb-8">
      <h1 class="text-3xl font-bold text-drift-purple">Drift PnL Tracker</h1>
      <p class="text-gray-600 mt-2">Enter your Solana wallet to view perp positions & PnL</p>
    </div>

    <div class="max-w-md mx-auto mb-8">
      <form @submit.prevent="loadPnL" class="space-y-4">
        <div>
          <label for="wallet" class="block text-sm font-medium text-gray-700">Wallet Address</label>
          <input
            id="wallet"
            v-model="walletAddress"
            type="text"
            placeholder="Enter Solana wallet (e.g., 9Wz...)"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-drift-purple focus:ring-drift-purple"
            :disabled="isLoading"
          />
        </div>
        <button
          type="submit"
          :disabled="!isValidWallet || isLoading"
          class="w-full bg-drift-purple text-white py-2 px-4 rounded-md hover:bg-opacity-90 disabled:opacity-50"
        >
          {{ isLoading ? 'Loading...' : 'Load PnL' }}
        </button>
      </form>
      <p v-if="error" class="text-red-600 text-sm mt-2 text-center">{{ error }}</p>
    </div>

    <div v-if="summary.totalPnL !== 0" class="max-w-4xl mx-auto mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">PnL Summary</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-sm text-gray-600">Total Unrealized</p>
            <p class="text-2xl font-bold text-green-600">${{ summary.totalUnrealized.toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Total Realized</p>
            <p class="text-2xl font-bold text-blue-600">${{ summary.totalRealized.toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Total PnL</p>
            <p class="text-2xl font-bold" :class="summary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'">
              ${{ summary.totalPnL.toFixed(2) }}
            </p>
          </div>
        </div>
        <button
          @click="handleExport"
          class="mt-4 bg-drift-blue text-white py-2 px-4 rounded-md hover:bg-opacity-90"
        >
          Export to CSV (for Google Sheets)
        </button>
      </div>
    </div>

    <div v-if="positions.length" class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Open Positions ({{ positions.length }})</h2>
          <button @click="isExpanded = !isExpanded" class="text-drift-purple hover:underline">
            {{ isExpanded ? 'Collapse All' : 'Expand All' }}
          </button>
        </div>
        <div v-for="(pos, index) in positions" :key="index" class="border-b border-gray-100 last:border-b-0">
          <div
            @click="expandedItems[index] = !expandedItems[index]"
            class="px-6 py-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
          >
            <div class="flex items-center space-x-4">
              <span class="text-drift-purple font-semibold">{{ pos.symbol }} Perp</span>
              <span class="text-2xl font-bold" :class="pos.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ pos.unrealizedPnL.toFixed(2) }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Size: {{ pos.size }} {{ pos.symbol }}</p>
              <p class="text-sm text-gray-500">{{ pos.timeAgo }}</p>
            </div>
          </div>
          <div v-if="isExpanded || expandedItems[index]" class="px-6 py-4 bg-gray-50 space-y-2">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Side</p>
                <p class="font-medium" :class="pos.side === 'long' ? 'text-green-600' : 'text-red-600'">
                  {{ pos.side.toUpperCase() }}
                </p>
              </div>
              <div>
                <p class="text-gray-600">Entry Price</p>
                <p class="font-medium">${{ pos.entryPrice.toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Mark Price</p>
                <p class="font-medium">${{ pos.markPrice.toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-gray-600">PnL %</p>
                <p class="font-medium">
                  {{ ((pos.unrealizedPnL / (pos.size * pos.entryPrice)) * 100).toFixed(2) }}%
                </p>
              </div>
            </div>
            <div class="flex space-x-2 pt-2">
              <button class="text-xs bg-drift-blue text-white px-3 py-1 rounded">Trade</button>
              <button class="text-xs bg-gray-300 px-3 py-1 rounded">Chart</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoading && positions.length === 0 && walletAddress" class="text-center text-gray-500 mt-8">
      No positions found for this wallet.
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useDriftPnL } from '@/composables/useDriftPnL';

export default {
  setup() {
    const { walletAddress, positions, summary, isLoading, error, isValidWallet, loadPnL, handleExport } = useDriftPnL();

    const isExpanded = ref(false);
    const expandedItems = ref({});

    onMounted(() => {
      const urlWallet = new URLSearchParams(window.location.search).get('wallet');
      if (urlWallet) {
        walletAddress.value = urlWallet;
        loadPnL();
      }
    });

    return {
      walletAddress,
      positions,
      summary,
      isLoading,
      error,
      isValidWallet,
      loadPnL,
      handleExport,
      isExpanded,
      expandedItems,
    };
  },
};
</script>

<style scoped>
.drift-purple { color: #7C3AED; }
</style>