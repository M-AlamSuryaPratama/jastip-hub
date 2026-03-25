import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Package, PackageStatus, ExpeditionType } from '@/lib/types';
import { toast } from 'sonner';
import { enqueue, savePackageOffline, getOfflinePackages } from '@/lib/offlineQueue';
import { uploadPhoto } from '@/lib/photoUpload';
import type { OfflinePackage } from '@/lib/offlineDb';

export interface OfflinePackageDisplay extends Omit<Package, 'id'> {
  id: string;
  _offline: true;
  _offlineId: number;
}

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async (): Promise<Package[]> => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Package[];
    },
  });
}

/** Fetch offline packages from IndexedDB for display */
export function useOfflinePackages() {
  return useQuery({
    queryKey: ['offline_packages'],
    queryFn: async (): Promise<OfflinePackageDisplay[]> => {
      const items = await getOfflinePackages();
      return items.map((pkg: OfflinePackage) => ({
        id: `offline-${pkg.id}`,
        created_at: pkg.created_at,
        customer_name: pkg.customer_name,
        expedition_type: pkg.expedition_type as ExpeditionType,
        tracking_number: pkg.tracking_number,
        fee_jastip: pkg.fee_jastip,
        status: 'Pending' as PackageStatus,
        notes: pkg.notes,
        photo_url: pkg.photo_base64,
        _offline: true as const,
        _offlineId: pkg.id!,
      }));
    },
    refetchInterval: 2000, // Poll to keep in sync
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pkg: {
      customer_name: string;
      expedition_type: ExpeditionType;
      tracking_number: string;
      fee_jastip: number;
      notes?: string;
      photo_url?: string;
    }) => {
      if (!navigator.onLine) {
        await savePackageOffline({
          customer_name: pkg.customer_name,
          expedition_type: pkg.expedition_type,
          tracking_number: pkg.tracking_number,
          fee_jastip: pkg.fee_jastip,
          notes: pkg.notes,
          photo_base64: pkg.photo_url, // base64 string
        });
        return pkg;
      }

      // Upload photo to Storage if present
      let photoUrl = pkg.photo_url;
      if (photoUrl && photoUrl.startsWith('data:')) {
        try {
          photoUrl = await uploadPhoto(photoUrl);
        } catch {
          // Fall back to base64 if upload fails
        }
      }

      const { data, error } = await supabase
        .from('packages')
        .insert({ ...pkg, photo_url: photoUrl || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] });
      qc.invalidateQueries({ queryKey: ['offline_packages'] });
      toast.success(
        navigator.onLine
          ? 'Paket berhasil ditambahkan!'
          : 'Tersimpan di memori HP (Offline). Akan disinkronkan saat ada sinyal.'
      );
    },
    onError: () => toast.error('Gagal menambahkan paket'),
  });
}

export function useUpdatePackageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PackageStatus }) => {
      if (!navigator.onLine) {
        enqueue({ type: 'update_status', payload: { id, status } });
        return;
      }
      const { error } = await supabase.from('packages').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] });
      toast.success(navigator.onLine ? 'Status berhasil diupdate!' : 'Status disimpan offline, akan disinkronkan otomatis.');
    },
    onError: () => toast.error('Gagal update status'),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!navigator.onLine) {
        enqueue({ type: 'delete', payload: { id } });
        return;
      }
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] });
      toast.success(navigator.onLine ? 'Paket berhasil dihapus!' : 'Penghapusan disimpan offline, akan disinkronkan otomatis.');
    },
    onError: () => toast.error('Gagal menghapus paket'),
  });
}
