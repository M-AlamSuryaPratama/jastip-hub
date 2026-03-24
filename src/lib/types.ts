export type ExpeditionType = 'J&T' | 'JNE' | 'SPX' | 'Sicepat' | 'Makanan' | 'Lainnya';
export type PackageStatus = 'Pending' | 'Picked Up' | 'Done';

export interface Package {
  id: string;
  created_at: string;
  customer_name: string;
  expedition_type: ExpeditionType;
  tracking_number: string;
  fee_jastip: number;
  status: PackageStatus;
  notes: string | null;
}

export const EXPEDITION_TYPES: ExpeditionType[] = ['J&T', 'JNE', 'SPX', 'Sicepat', 'Makanan', 'Lainnya'];
export const PACKAGE_STATUSES: PackageStatus[] = ['Pending', 'Picked Up', 'Done'];

export const EXPEDITION_COLORS: Record<ExpeditionType, string> = {
  'J&T': 'bg-expedition-jt',
  'JNE': 'bg-expedition-jne',
  'SPX': 'bg-expedition-spx',
  'Sicepat': 'bg-expedition-sicepat',
  'Makanan': 'bg-expedition-makanan',
  'Lainnya': 'bg-expedition-lainnya',
};

export const STATUS_COLORS: Record<PackageStatus, string> = {
  'Pending': 'bg-status-pending',
  'Picked Up': 'bg-status-picked',
  'Done': 'bg-status-done',
};
