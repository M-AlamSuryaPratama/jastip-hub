import { useState, useMemo } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Package } from '@/lib/types';
import { EXPEDITION_COLORS } from '@/lib/types';

interface ProfitCalendarProps {
  packages: Package[];
}

function exportCsv(packages: Package[], month: Date) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const filtered = packages.filter(p => {
    const d = new Date(p.created_at);
    return p.status === 'Done' && d >= monthStart && d <= monthEnd;
  });

  const header = 'Tanggal,Customer,Ekspedisi,Resi,Fee Jastip,Status\n';
  const rows = filtered.map(p =>
    `${format(new Date(p.created_at), 'yyyy-MM-dd')},${p.customer_name},${p.expedition_type},${p.tracking_number},${p.fee_jastip},${p.status}`
  ).join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `profit-${format(month, 'yyyy-MM')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProfitCalendar({ packages }: ProfitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const donePackages = useMemo(() => packages.filter(p => p.status === 'Done'), [packages]);

  const profitByDate = useMemo(() => {
    const map: Record<string, number> = {};
    donePackages.forEach(p => {
      const key = format(new Date(p.created_at), 'yyyy-MM-dd');
      map[key] = (map[key] || 0) + Number(p.fee_jastip);
    });
    return map;
  }, [donePackages]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const selectedPackages = selectedDate
    ? donePackages.filter(p => isSameDay(new Date(p.created_at), selectedDate))
    : [];

  const totalMonth = useMemo(() => {
    return days.reduce((sum, d) => {
      const key = format(d, 'yyyy-MM-dd');
      return sum + (profitByDate[key] || 0);
    }, 0);
  }, [days, profitByDate]);

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <>
      <Card className="shadow-card border">
        <CardHeader className="pb-2 px-4 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              History Profit
            </CardTitle>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-primary">
                Rp {totalMonth.toLocaleString('id-ID')}
              </p>
              <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => exportCsv(packages, currentMonth)}>
                <Download className="h-3 w-3 mr-1" /> CSV
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-semibold">{format(currentMonth, 'MMMM yyyy', { locale: idLocale })}</p>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayNames.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd');
              const profit = profitByDate[key] || 0;
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={key}
                  onClick={() => profit > 0 && setSelectedDate(day)}
                  className={`relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs transition-all
                    ${isToday ? 'ring-1 ring-primary' : ''}
                    ${profit > 0 ? 'bg-primary/10 hover:bg-primary/20 cursor-pointer' : 'hover:bg-muted cursor-default'}
                  `}
                >
                  <span className={`font-medium ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  {profit > 0 && (
                    <span className="text-[8px] font-bold text-primary leading-none mt-0.5">
                      {profit >= 1000000 ? `${(profit / 1000000).toFixed(1)}jt` : profit >= 1000 ? `${(profit / 1000).toFixed(0)}rb` : profit}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              Profit {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: idLocale })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm font-bold text-primary">
              Total: Rp {selectedPackages.reduce((s, p) => s + Number(p.fee_jastip), 0).toLocaleString('id-ID')}
            </p>
            {selectedPackages.map(pkg => (
              <div key={pkg.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border text-sm">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-primary-foreground ${EXPEDITION_COLORS[pkg.expedition_type]}`}>
                  {pkg.expedition_type}
                </span>
                <span className="flex-1 truncate font-medium">{pkg.customer_name}</span>
                <span className="font-bold text-primary text-xs">Rp {Number(pkg.fee_jastip).toLocaleString('id-ID')}</span>
              </div>
            ))}
            {selectedPackages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">Tidak ada paket selesai di tanggal ini</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
