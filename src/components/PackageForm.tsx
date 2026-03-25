import { useState, useRef } from 'react';
import { Plus, ScanLine, Camera, X, ImagePlus, Image, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreatePackage } from '@/hooks/usePackages';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { EXPEDITION_TYPES, type ExpeditionType } from '@/lib/types';
import { compressImage } from '@/lib/imageUtils';
import { toast } from 'sonner';

export function PackageForm() {
  const [customerName, setCustomerName] = useState('');
  const [expeditionType, setExpeditionType] = useState<ExpeditionType | ''>('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [feeJastip, setFeeJastip] = useState('');
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const barcodeImageRef = useRef<HTMLInputElement>(null);

  const createPackage = useCreatePackage();

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setPhotoPreview(compressed);
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleBarcodeFromImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const scanner = new Html5Qrcode('barcode-image-scan', false);
      const result = await scanner.scanFile(file, true);
      setTrackingNumber(result);
      toast.success('Barcode berhasil terdeteksi!');
      scanner.clear();
    } catch {
      toast.error('Barcode tidak terdeteksi dari gambar ini.');
    }
    if (barcodeImageRef.current) barcodeImageRef.current.value = '';
  };

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
        photo_url: photoPreview || undefined,
      },
      {
        onSuccess: () => {
          setCustomerName('');
          setExpeditionType('');
          setTrackingNumber('');
          setFeeJastip('');
          setNotes('');
          clearPhoto();
        },
      }
    );
  };

  return (
    <>
      <Card className="shadow-card border">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base font-semibold">Tambah Paket</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="text-xs font-medium">Nama Customer</Label>
              <Input id="customerName" placeholder="Contoh: Budi Santoso" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-11" required />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Ekspedisi</Label>
              <Select value={expeditionType} onValueChange={v => setExpeditionType(v as ExpeditionType)}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Pilih Ekspedisi" /></SelectTrigger>
                <SelectContent>
                  {EXPEDITION_TYPES.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trackingNumber" className="text-xs font-medium">Nomor Resi</Label>
              <div className="relative">
                <Input id="trackingNumber" placeholder="Scan atau ketik nomor resi" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="pr-[5.5rem] h-11" required />
                <input ref={barcodeImageRef} type="file" accept="image/*" className="hidden" onChange={handleBarcodeFromImage} />
                <div className="absolute right-0 top-0 flex h-11">
                  <Button type="button" variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-primary" title="Scan dari gambar" onClick={() => barcodeImageRef.current?.click()}>
                    <ImagePlus className="h-4.5 w-4.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-11 w-11 text-primary hover:text-primary" title="Scan kamera" onClick={() => setShowScanner(true)}>
                    <ScanLine className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feeJastip" className="text-xs font-medium">Fee Jastip (Rp)</Label>
              <Input id="feeJastip" type="number" placeholder="0" value={feeJastip} onChange={e => setFeeJastip(e.target.value)} className="h-11" min={0} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium">Catatan <span className="text-muted-foreground">(opsional)</span></Label>
              <Input id="notes" placeholder="Catatan tambahan..." value={notes} onChange={e => setNotes(e.target.value)} className="h-11" />
            </div>

            {/* Dual Photo Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Foto Paket <span className="text-muted-foreground">(opsional)</span></Label>

              {/* Hidden file inputs */}
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelected} />
              <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelected} />

              {photoPreview ? (
                <div className="space-y-2">
                  <div className="relative inline-block">
                    <img src={photoPreview} alt="Preview Foto" className="h-28 w-28 rounded-lg object-cover border shadow-sm" />
                    <button type="button" className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm" onClick={clearPhoto}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => cameraInputRef.current?.click()}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Foto Ulang
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" className="h-11 text-xs gap-2" onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="h-4 w-4" />
                    Kamera Langsung
                  </Button>
                  <Button type="button" variant="outline" className="h-11 text-xs gap-2" onClick={() => galleryInputRef.current?.click()}>
                    <Image className="h-4 w-4" />
                    Pilih dari Galeri
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={createPackage.isPending}>
              <Plus className="h-4 w-4" />
              {createPackage.isPending ? 'Menambahkan...' : 'Tambah Paket'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div id="barcode-image-scan" className="hidden" />

      {showScanner && (
        <BarcodeScanner onScan={setTrackingNumber} onClose={() => setShowScanner(false)} />
      )}
    </>
  );
}
