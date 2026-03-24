import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Package, PackageStatus, ExpeditionType } from '@/lib/types';
import { toast } from 'sonner';
import { enqueue } from '@/lib/offlineQueue';

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
        enqueue({ type: 'create', payload: pkg });
        return pkg;
      }
      const { data, error } = await supabase.from('packages').insert(pkg).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] });
      toast.success(navigator.onLine ? 'Paket berhasil ditambahkan!' : 'Paket disimpan offline, akan disinkronkan otomatis.');
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
