import { supabase } from '@/integrations/supabase/client';
import { uploadPhoto } from '@/lib/photoUpload';
import { db, type OfflinePackage } from '@/lib/offlineDb';
import { toast } from 'sonner';

interface QueuedAction {
  id: string;
  type: 'update_status' | 'delete' | 'update';
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

/** Save a full package record to IndexedDB for offline creation */
export async function savePackageOffline(pkg: {
  customer_name: string;
  expedition_type: string;
  tracking_number: string;
  fee_jastip: number;
  notes?: string;
  photo_base64?: string;
}) {
  await db.offline_packages.add({
    customer_name: pkg.customer_name,
    expedition_type: pkg.expedition_type,
    tracking_number: pkg.tracking_number,
    fee_jastip: pkg.fee_jastip,
    notes: pkg.notes || null,
    photo_base64: pkg.photo_base64 || null,
    created_at: new Date().toISOString(),
  });
}

/** Get all offline packages from IndexedDB */
export async function getOfflinePackages(): Promise<OfflinePackage[]> {
  return db.offline_packages.toArray();
}

export async function syncQueue() {
  // 1. Sync IndexedDB packages (create operations)
  const offlinePackages = await db.offline_packages.toArray();
  let packagesSynced = 0;

  for (const pkg of offlinePackages) {
    try {
      let photoUrl: string | null = null;

      // Upload base64 photo to Storage
      if (pkg.photo_base64 && pkg.photo_base64.startsWith('data:')) {
        try {
          photoUrl = await uploadPhoto(pkg.photo_base64);
        } catch {
          // Keep null if upload fails
        }
      }

      const { error } = await supabase.from('packages').insert({
        customer_name: pkg.customer_name,
        expedition_type: pkg.expedition_type as any,
        tracking_number: pkg.tracking_number,
        fee_jastip: pkg.fee_jastip,
        notes: pkg.notes,
        photo_url: photoUrl,
      });

      if (error) throw error;

      // Delete from IndexedDB on success
      await db.offline_packages.delete(pkg.id!);
      packagesSynced++;
    } catch {
      // Keep in IndexedDB for next sync attempt
    }
  }

  // 2. Sync localStorage queue (update/delete operations)
  const queue = getQueue();
  const failed: QueuedAction[] = [];

  for (const action of queue) {
    try {
      if (action.type === 'update_status') {
        const { id, status } = action.payload as { id: string; status: string };
        const { error } = await supabase.from('packages').update({ status } as any).eq('id', id);
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

  const totalSynced = packagesSynced + (queue.length - failed.length);
  if (totalSynced > 0) {
    toast.success(`Sinkronisasi berhasil! ${totalSynced} aksi offline telah disimpan.`);
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
