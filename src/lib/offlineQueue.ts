import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QueuedAction {
  id: string;
  type: 'create' | 'update_status' | 'delete';
  payload: Record<string, unknown>;
  timestamp: number;
}

const QUEUE_KEY = 'alam_jastip_offline_queue';

export function getQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueue(action: Omit<QueuedAction, 'id' | 'timestamp'>) {
  const queue = getQueue();
  queue.push({ ...action, id: crypto.randomUUID(), timestamp: Date.now() });
  saveQueue(queue);
}

export async function syncQueue() {
  const queue = getQueue();
  if (queue.length === 0) return;

  const failed: QueuedAction[] = [];

  for (const action of queue) {
    try {
      if (action.type === 'create') {
        const { error } = await supabase.from('packages').insert(action.payload);
        if (error) throw error;
      } else if (action.type === 'update_status') {
        const { id, status } = action.payload as { id: string; status: string };
        const { error } = await supabase.from('packages').update({ status }).eq('id', id);
        if (error) throw error;
      } else if (action.type === 'delete') {
        const { error } = await supabase.from('packages').delete().eq('id', action.payload.id as string);
        if (error) throw error;
      }
    } catch {
      failed.push(action);
    }
  }

  saveQueue(failed);

  const synced = queue.length - failed.length;
  if (synced > 0) {
    toast.success(`${synced} aksi offline berhasil disinkronkan!`);
  }
  if (failed.length > 0) {
    toast.error(`${failed.length} aksi gagal disinkronkan, akan dicoba lagi.`);
  }
}

export function setupOnlineSync(onSync: () => void) {
  const handler = async () => {
    if (navigator.onLine) {
      await syncQueue();
      onSync();
    }
  };
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
