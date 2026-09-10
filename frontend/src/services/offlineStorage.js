/**
 * Offline Storage & Synchronization Service for SmritiNER
 * Enables rural health workers and primary health centres to record
 * cognitive games and memory reminders without an active internet connection.
 */

const STORAGE_KEY = 'smriti_offline_sessions_queue';
const OFFLINE_SIM_KEY = 'smriti_simulate_offline';

export const offlineStorage = {
  isSimulatedOffline() {
    return localStorage.getItem(OFFLINE_SIM_KEY) === 'true';
  },

  setSimulatedOffline(val) {
    localStorage.setItem(OFFLINE_SIM_KEY, val ? 'true' : 'false');
    window.dispatchEvent(new Event('smriti_connectivity_change'));
  },

  isOnline() {
    if (this.isSimulatedOffline()) {
      return false;
    }
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  getQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  enqueueSession(sessionData) {
    const queue = this.getQueue();
    const item = {
      ...sessionData,
      client_timestamp: new Date().toISOString(),
      offline_id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    };
    queue.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event('smriti_queue_updated'));
    return item;
  },

  clearQueue() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('smriti_queue_updated'));
  },

  async syncQueue(apiBase = '/api') {
    const queue = this.getQueue();
    if (queue.length === 0) {
      return { status: 'empty', synced: 0 };
    }

    if (!this.isOnline()) {
      return { status: 'offline', synced: 0 };
    }

    try {
      const userId = queue[0].user_id || 'NER-PAT-4821';
      const payload = {
        batch_id: `batch_${Date.now()}`,
        user_id: userId,
        sessions: queue,
        client_timestamp: new Date().toISOString()
      };

      const res = await fetch(`${apiBase}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Sync failed with status ${res.status}`);
      }

      const result = await res.json();
      this.clearQueue();
      return { status: 'success', synced: result.records_synced };
    } catch (err) {
      console.warn('[OfflineStorage] Sync error:', err);
      return { status: 'error', error: err.message };
    }
  }
};
