// useDriftPnL.js
// Composable for state management: wallet input, data fetching, loading states.
// Logical, reactive, and reusable.

import { ref, computed } from 'vue';
import { fetchDriftPositions, exportToCSV } from '@/services/driftService';

export function useDriftPnL() {
  const walletAddress = ref('');
  const positions = ref([]);
  const summary = ref({ totalUnrealized: 0, totalRealized: 0, totalPnL: 0, positions: [] });
  const isLoading = ref(false);
  const error = ref(null);

  const isValidWallet = computed(() => walletAddress.value.length > 30);

  const formattedPositions = computed(() => {
    return positions.value.map(pos => ({
      ...pos,
      timeAgo: pos.timeAgo || 'Recent'
    }));
  });

  async function loadPnL() {
    if (!isValidWallet.value) {
      error.value = 'Enter a valid Solana wallet address';
      return;
    }

    isLoading.value = true;
    error.value = null;

    const result = await fetchDriftPositions(walletAddress.value);
    if (result) {
      positions.value = result.positions;
      summary.value = result.summary;
    } else {
      error.value = 'Failed to fetch data. Check wallet or network.';
    }

    isLoading.value = false;
  }

  function handleExport() {
    if (!positions.value.length) return;
    const csv = exportToCSV(summary.value);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drift-pnl-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return {
    walletAddress,
    positions: formattedPositions,
    summary,
    isLoading,
    error,
    isValidWallet,
    loadPnL,
    handleExport,
  };
}