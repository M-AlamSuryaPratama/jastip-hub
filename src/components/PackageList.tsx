import { useState } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdatePackageStatus, useDeletePackage } from '@/hooks/usePackages';
import type { Package, PackageStatus } from '@/lib/types';
import { EXPEDITION_COLORS, STATUS_COLORS, PACKAGE_STATUSES } from '@/lib/types';

interface PackageListProps {
  packages: Package[];
  isLoading: boolean;
}

export function PackageList({ packages, isLoading }: PackageListProps) {
  const [filter, setFilter] = useState<PackageStatus | 'All'>('All');
  const updateStatus = useUpdatePackageStatus();
  const deletePackage = useDeletePackage();

  const filtered = filter === 'All' ? packages : packages.filter(p => p.status === filter);

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
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold flex-1">Daftar Paket ({filtered.length})</h2>
        <Select value={filter} onValueChange={v => setFilter(v as PackageStatus | 'All')}>
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
                    <Select
                      value={pkg.status}
                      onValueChange={v => updateStatus.mutate({ id: pkg.id, status: v as PackageStatus })}
                    >
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKAGE_STATUSES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
