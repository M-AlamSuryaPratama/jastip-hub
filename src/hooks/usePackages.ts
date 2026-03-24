import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Package, PackageStatus, ExpeditionType } from '@/lib/types';
import { toast } from 'sonner';

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
      const { data, error } = await supabase.from('packages').insert(pkg).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Paket berhasil ditambahkan!');
    },
    onError: () => toast.error('Gagal menambahkan paket'),
  });
}

export function useUpdatePackageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PackageStatus }) => {
      const { error } = await supabase.from('packages').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Status berhasil diupdate!');
    },
    onError: () => toast.error('Gagal update status'),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Paket berhasil dihapus!');
    },
    onError: () => toast.error('Gagal menghapus paket'),
  });
}
