import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreatePackage } from '@/hooks/usePackages';
import { EXPEDITION_TYPES, type ExpeditionType } from '@/lib/types';

export function PackageForm() {
  const [customerName, setCustomerName] = useState('');
  const [expeditionType, setExpeditionType] = useState<ExpeditionType | ''>('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [feeJastip, setFeeJastip] = useState('');
  const [notes, setNotes] = useState('');

  const createPackage = useCreatePackage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !expeditionType || !trackingNumber || !feeJastip) return;

    createPackage.mutate(
      {
        customer_name: customerName,
        expedition_type: expeditionType as ExpeditionType,
        tracking_number: trackingNumber,
        fee_jastip: Number(feeJastip),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setCustomerName('');
          setExpeditionType('');
          setTrackingNumber('');
          setFeeJastip('');
          setNotes('');
        },
      }
    );
  };

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-base font-semibold">Tambah Paket</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Nama Customer"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            required
          />
          <Select value={expeditionType} onValueChange={v => setExpeditionType(v as ExpeditionType)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Ekspedisi" />
            </SelectTrigger>
            <SelectContent>
              {EXPEDITION_TYPES.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Nomor Resi"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            required
          />
          <Input
            type="number"
            placeholder="Fee Jastip (Rp)"
            value={feeJastip}
            onChange={e => setFeeJastip(e.target.value)}
            min={0}
            required
          />
          <Input
            placeholder="Catatan (opsional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={createPackage.isPending}>
            <Plus className="h-4 w-4" />
            {createPackage.isPending ? 'Menambahkan...' : 'Tambah Paket'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
