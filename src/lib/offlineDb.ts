import Dexie, { type EntityTable } from 'dexie';

export interface OfflinePackage {
  id?: number;
  customer_name: string;
  expedition_type: string;
  tracking_number: string;
  fee_jastip: number;
  notes: string | null;
  photo_base64: string | null;
  created_at: string;
}

const db = new Dexie('AlamJastipOffline') as Dexie & {
  offline_packages: EntityTable<OfflinePackage, 'id'>;
};

db.version(1).stores({
  offline_packages: '++id, customer_name, tracking_number',
});

export { db };
