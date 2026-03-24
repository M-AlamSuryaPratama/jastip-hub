import { useState } from 'react';
import { Trash2, Search, PackageCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdatePackageStatus, useDeletePackage } from '@/hooks/usePackages';
import type { Package, PackageStatus, ExpeditionType } from '@/lib/types';
import { EXPEDITION_COLORS, STATUS_COLORS, PACKAGE_STATUSES, EXPEDITION_TYPES } from '@/lib/types';

interface PackageListProps {
  packages: Package[];
  isLoading: boolean;
}

export function PackageList({ packages, isLoading }: PackageListProps) {
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'All'>('All');
  const [expeditionFilter, setExpeditionFilter] = useState<ExpeditionType | 'All'>('All');
  const [search, setSearch] = useState('');
  const updateStatus = useUpdatePackageStatus();
  const deletePackage = useDeletePackage();

  const filtered = packages.filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (expeditionFilter !== 'All' && p.expedition_type !== expeditionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.customer_name.toLowerCase().includes(q) && !p.tracking_number.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="shadow-card border-0 animate-pulse">
            <CardContent className="p-4 h-20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama customer atau resi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Expedition quick filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setExpeditionFilter('All')}
          className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
            expeditionFilter === 'All'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Semua
        </button>
        {EXPEDITION_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setExpeditionFilter(expeditionFilter === t ? 'All' : t)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              expeditionFilter === t
                ? `${EXPEDITION_COLORS[t]} text-primary-foreground`
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Header + status filter */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold flex-1">Daftar Paket ({filtered.length})</h2>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as PackageStatus | 'All')}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Semua</SelectItem>
            {PACKAGE_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="shadow-card border-0">
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            Belum ada paket
          </CardContent>
        </Card>
      ) : (
        filtered.map(pkg => (
          <Card key={pkg.id} className="shadow-card border-0 animate-slide-up">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className={`w-1 self-stretch rounded-full ${EXPEDITION_COLORS[pkg.expedition_type]}`} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{pkg.customer_name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-primary-foreground ${STATUS_COLORS[pkg.status]}`}>
                      {pkg.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-primary-foreground ${EXPEDITION_COLORS[pkg.expedition_type]}`}>
                      {pkg.expedition_type}
                    </span>
                    <span className="truncate">{pkg.tracking_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary">
                      Rp {Number(pkg.fee_jastip).toLocaleString('id-ID')}
                    </p>
                    {pkg.notes && (
                      <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{pkg.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {pkg.status === 'Pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1 border-status-picked text-status-picked hover:bg-status-picked/10"
                        onClick={() => updateStatus.mutate({ id: pkg.id, status: 'Picked Up' })}
                      >
                        <PackageCheck className="h-3.5 w-3.5 mr-1" />
                        Ambil Paket
                      </Button>
                    )}
                    {pkg.status === 'Picked Up' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1 border-status-done text-status-done hover:bg-status-done/10"
                        onClick={() => updateStatus.mutate({ id: pkg.id, status: 'Done' })}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Selesai / Diterima
                      </Button>
                    )}
                    {pkg.status === 'Done' && (
                      <span className="text-xs text-status-done font-medium flex-1">✓ Selesai</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deletePackage.mutate(pkg.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
