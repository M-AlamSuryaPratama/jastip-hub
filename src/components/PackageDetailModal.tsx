import { useState } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { X, Save, PackageOpen, Clock, PackageCheck, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdatePackage } from '@/hooks/usePackages';
import { EXPEDITION_TYPES, type Package, type ExpeditionType } from '@/lib/types';

interface PackageDetailModalProps {
  pkg: Package | null;
  open: boolean;
  onClose: () => void;
}

export function PackageDetailModal({ pkg, open, onClose }: PackageDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [expeditionType, setExpeditionType] = useState<ExpeditionType>('J&T');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [feeJastip, setFeeJastip] = useState('');
  const [notes, setNotes] = useState('');
  const updatePackage = useUpdatePackage();

  const startEdit = () => {
    if (!pkg) return;
    setCustomerName(pkg.customer_name);
    setExpeditionType(pkg.expedition_type);
    setTrackingNumber(pkg.tracking_number);
    setFeeJastip(String(pkg.fee_jastip));
    setNotes(pkg.notes || '');
    setEditing(true);
  };

  const handleSave = () => {
    if (!pkg) return;
    updatePackage.mutate({
      id: pkg.id,
      customer_name: customerName,
      expedition_type: expeditionType,
      tracking_number: trackingNumber,
      fee_jastip: Number(feeJastip),
      notes: notes || null,
    }, {
      onSuccess: () => {
        setEditing(false);
        onClose();
      },
    });
  };

  const handleClose = () => {
    setEditing(false);
    onClose();
  };

  if (!pkg) return null;

  const createdAt = new Date(pkg.created_at);

  const timelineSteps = [
    { label: 'Dibuat', icon: Clock, date: createdAt, active: true },
    { label: 'Diambil', icon: PackageCheck, date: pkg.status === 'Picked Up' || pkg.status === 'Done' ? createdAt : null, active: pkg.status === 'Picked Up' || pkg.status === 'Done' },
    { label: 'Selesai', icon: CheckCircle2, date: pkg.status === 'Done' ? createdAt : null, active: pkg.status === 'Done' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base font-semibold">Detail Paket</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Photo */}
          {pkg.photo_url && (
            <div className="rounded-lg overflow-hidden border bg-muted">
              <img src={pkg.photo_url} alt="Foto Paket" className="w-full max-h-48 object-cover" />
            </div>
          )}
          {!pkg.photo_url && (
            <div className="rounded-lg border bg-muted flex items-center justify-center h-24">
              <PackageOpen className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}

          {editing ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Customer</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ekspedisi</Label>
                <Select value={expeditionType} onValueChange={v => setExpeditionType(v as ExpeditionType)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPEDITION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor Resi</Label>
                <Input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fee Jastip (Rp)</Label>
                <Input type="number" value={feeJastip} onChange={e => setFeeJastip(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} className="h-11" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-11" onClick={() => setEditing(false)}>Batal</Button>
                <Button className="flex-1 h-11" onClick={handleSave} disabled={updatePackage.isPending}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {updatePackage.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Customer</p>
                  <p className="font-semibold">{pkg.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Ekspedisi</p>
                  <p className="font-semibold">{pkg.expedition_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Nomor Resi</p>
                  <p className="font-semibold font-mono text-xs">{pkg.tracking_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fee Jastip</p>
                  <p className="font-bold text-primary">Rp {Number(pkg.fee_jastip).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Tanggal</p>
                  <p className="font-semibold text-xs">{format(createdAt, 'dd MMM yyyy, HH:mm', { locale: idLocale })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className="font-semibold">{pkg.status}</p>
                </div>
              </div>
              {pkg.notes && (
                <div>
                  <p className="text-muted-foreground text-xs">Catatan</p>
                  <p className="text-sm">{pkg.notes}</p>
                </div>
              )}

              {/* Status Timeline */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Timeline Status</p>
                <div className="flex items-center gap-0">
                  {timelineSteps.map((step, i) => (
                    <div key={step.label} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <p className={`text-[10px] mt-1 font-medium ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div className={`h-0.5 flex-1 -mt-4 ${timelineSteps[i + 1].active ? 'bg-primary' : 'bg-border'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full h-11 text-sm" onClick={startEdit}>
                Edit Data
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
