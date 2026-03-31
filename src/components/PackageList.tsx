import { useState } from 'react';
import { Trash2, Search, PackageCheck, CheckCircle2, PackageOpen, CloudOff, Pencil, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdatePackageStatus, useDeletePackage, useBulkUpdateStatus } from '@/hooks/usePackages';
import { PhotoViewer } from '@/components/PhotoViewer';
import { PackageDetailModal } from '@/components/PackageDetailModal';
import type { Package, PackageStatus, ExpeditionType } from '@/lib/types';
import { EXPEDITION_COLORS, STATUS_COLORS, PACKAGE_STATUSES, EXPEDITION_TYPES } from '@/lib/types';

interface PackageListProps {
  packages: (Package & { _offline?: boolean })[];
  isLoading: boolean;
}

function generateWhatsAppUrl(pkg: Package): string {
  const msg = `Halo ${pkg.customer_name}, paket ${pkg.expedition_type} kamu dengan Resi ${pkg.tracking_number} sudah saya ${pkg.status === 'Done' ? 'selesaikan' : 'ambil'} ya! 📦 Lokasi: Pundu. ${pkg.status === 'Picked Up' ? 'Standby di rumah, segera meluncur!' : 'Paket sudah sampai!'} ${pkg.photo_url ? `Cek foto paket di sini: ${pkg.photo_url}` : ''}`.trim();
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

export function PackageList({ packages, isLoading }: PackageListProps) {
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'All'>('All');
  const [expeditionFilter, setExpeditionFilter] = useState<ExpeditionType | 'All'>('All');
  const [search, setSearch] = useState('');
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const [detailPkg, setDetailPkg] = useState<Package | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const updateStatus = useUpdatePackageStatus();
  const deletePackage = useDeletePackage();
  const bulkUpdate = useBulkUpdateStatus();

  const filtered = packages.filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (expeditionFilter !== 'All' && p.expedition_type !== expeditionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.customer_name.toLowerCase().includes(q) && !p.tracking_number.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectedPkgs = filtered.filter(p => selected.has(p.id) && !(p as any)._offline);
  const canBulkPickUp = selectedPkgs.length > 0 && selectedPkgs.every(p => p.status === 'Pending');
  const canBulkDone = selectedPkgs.length > 0 && selectedPkgs.every(p => p.status === 'Picked Up');
  const hasSelection = selected.size > 0;

  const handleBulk = (status: PackageStatus) => {
    const ids = selectedPkgs.map(p => p.id);
    bulkUpdate.mutate({ ids, status }, { onSuccess: () => setSelected(new Set()) });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="shadow-card border animate-pulse">
            <CardContent className="p-4 h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari nama customer atau resi..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-11" />
      </div>

      {/* Expedition quick filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setExpeditionFilter('All')} className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${expeditionFilter === 'All' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>
          Semua
        </button>
        {EXPEDITION_TYPES.map(t => (
          <button key={t} onClick={() => setExpeditionFilter(expeditionFilter === t ? 'All' : t)} className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${expeditionFilter === t ? `${EXPEDITION_COLORS[t]} text-primary-foreground shadow-sm` : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Header + status filter */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold flex-1">Daftar Paket <span className="text-muted-foreground font-normal">({filtered.length})</span></h2>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as PackageStatus | 'All')}>
          <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Semua Status</SelectItem>
            {PACKAGE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="shadow-card border">
          <CardContent className="p-10 text-center text-muted-foreground text-sm">Belum ada paket</CardContent>
        </Card>
      ) : (
        filtered.map(pkg => (
          <Card key={pkg.id} className={`shadow-card hover:shadow-card-hover transition-shadow border animate-slide-up ${selected.has(pkg.id) ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Checkbox for non-offline, non-Done packages */}
                {!(pkg as any)._offline && pkg.status !== 'Done' && (
                  <div className="shrink-0 pt-1">
                    <Checkbox
                      checked={selected.has(pkg.id)}
                      onCheckedChange={() => toggleSelect(pkg.id)}
                      className="h-5 w-5"
                    />
                  </div>
                )}
                <button type="button" className="shrink-0 h-14 w-14 rounded-lg border bg-muted overflow-hidden flex items-center justify-center" onClick={() => pkg.photo_url && setViewPhoto(pkg.photo_url)} disabled={!pkg.photo_url}>
                  {pkg.photo_url ? (
                    <img src={pkg.photo_url} alt="Foto" className="h-full w-full object-cover" />
                  ) : (
                    <PackageOpen className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </button>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-semibold text-sm truncate">{pkg.customer_name}</p>
                      {(pkg as any)._offline && <CloudOff className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* WhatsApp button for Picked Up / Done */}
                      {!(pkg as any)._offline && (pkg.status === 'Picked Up' || pkg.status === 'Done') && (
                        <a href={generateWhatsAppUrl(pkg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded-md text-green-600 hover:bg-green-50 transition-colors">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {!(pkg as any)._offline && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setDetailPkg(pkg)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary-foreground ${(pkg as any)._offline ? 'bg-amber-500' : STATUS_COLORS[pkg.status]}`}>
                        {(pkg as any)._offline ? 'Offline' : pkg.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-primary-foreground ${EXPEDITION_COLORS[pkg.expedition_type]}`}>{pkg.expedition_type}</span>
                    <span className="truncate font-mono text-[11px]">{pkg.tracking_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primary">Rp {Number(pkg.fee_jastip).toLocaleString('id-ID')}</p>
                    {pkg.notes && <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{pkg.notes}</p>}
                  </div>
                  {!(pkg as any)._offline && (
                    <div className="flex items-center gap-2 pt-1">
                      {pkg.status === 'Pending' && (
                        <Button size="sm" variant="outline" className="h-9 text-xs flex-1 border-status-picked text-status-picked hover:bg-status-picked hover:text-primary-foreground font-semibold" onClick={() => updateStatus.mutate({ id: pkg.id, status: 'Picked Up' })}>
                          <PackageCheck className="h-4 w-4 mr-1.5" />Ambil Paket
                        </Button>
                      )}
                      {pkg.status === 'Picked Up' && (
                        <Button size="sm" variant="outline" className="h-9 text-xs flex-1 border-status-done text-status-done hover:bg-status-done hover:text-primary-foreground font-semibold" onClick={() => updateStatus.mutate({ id: pkg.id, status: 'Done' })}>
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />Selesai / Diterima
                        </Button>
                      )}
                      {pkg.status === 'Done' && (
                        <span className="text-xs text-status-done font-semibold flex-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                        </span>
                      )}
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deletePackage.mutate(pkg.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {(pkg as any)._offline && (
                    <p className="text-[10px] text-amber-600 flex items-center gap-1 pt-1">
                      <CloudOff className="h-3 w-3" /> Menunggu koneksi untuk sinkronisasi
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Bulk Action Bar */}
      {hasSelection && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-elevated p-3 flex items-center gap-2 justify-center animate-slide-up">
          <span className="text-xs font-semibold text-muted-foreground mr-2">{selected.size} dipilih</span>
          {canBulkPickUp && (
            <Button size="lg" className="flex-1 max-w-[200px] h-12 text-sm font-bold bg-status-picked hover:bg-status-picked/90 text-primary-foreground" onClick={() => handleBulk('Picked Up')}>
              <PackageCheck className="h-5 w-5 mr-2" /> Ambil Semua
            </Button>
          )}
          {canBulkDone && (
            <Button size="lg" className="flex-1 max-w-[200px] h-12 text-sm font-bold bg-status-done hover:bg-status-done/90 text-primary-foreground" onClick={() => handleBulk('Done')}>
              <CheckCircle2 className="h-5 w-5 mr-2" /> Selesai Semua
            </Button>
          )}
          {!canBulkPickUp && !canBulkDone && selected.size > 0 && (
            <p className="text-xs text-muted-foreground">Pilih paket dengan status yang sama untuk bulk action</p>
          )}
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelected(new Set())}>Batal</Button>
        </div>
      )}

      <PhotoViewer url={viewPhoto} open={!!viewPhoto} onClose={() => setViewPhoto(null)} />
      <PackageDetailModal pkg={detailPkg} open={!!detailPkg} onClose={() => setDetailPkg(null)} />
    </div>
  );
}
