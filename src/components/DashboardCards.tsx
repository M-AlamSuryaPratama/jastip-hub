import { Package as PackageIcon, Truck, CircleDollarSign, Warehouse } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Package } from '@/lib/types';
import { EXPEDITION_TYPES, EXPEDITION_COLORS } from '@/lib/types';

interface DashboardCardsProps {
  packages: Package[];
}

export function DashboardCards({ packages }: DashboardCardsProps) {
  const today = new Date().toDateString();
  const totalPending = packages.filter(p => p.status === 'Pending').length;
  const totalPickedUp = packages.filter(p => p.status === 'Picked Up').length;
  const profitToday = packages
    .filter(p => p.status === 'Done' && new Date(p.created_at).toDateString() === today)
    .reduce((sum, p) => sum + Number(p.fee_jastip), 0);

  const pendingByExpedition = EXPEDITION_TYPES.map(t => ({
    type: t,
    count: packages.filter(p => p.status === 'Pending' && p.expedition_type === t).length,
  })).filter(e => e.count > 0);

  const cards = [
    {
      title: 'Pending',
      value: totalPending,
      icon: PackageIcon,
      color: 'text-status-pending',
      bgColor: 'bg-status-pending/10',
      borderColor: 'border-status-pending/20',
    },
    {
      title: 'Picked Up',
      value: totalPickedUp,
      icon: Truck,
      color: 'text-status-picked',
      bgColor: 'bg-status-picked/10',
      borderColor: 'border-status-picked/20',
    },
    {
      title: 'Profit Hari Ini',
      value: `Rp ${profitToday.toLocaleString('id-ID')}`,
      icon: CircleDollarSign,
      color: 'text-status-done',
      bgColor: 'bg-status-done/10',
      borderColor: 'border-status-done/20',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {cards.map(card => (
          <Card key={card.title} className={`shadow-card hover:shadow-card-hover transition-shadow border ${card.borderColor} animate-slide-up`}>
            <CardContent className="p-3 sm:p-4">
              <div className={`inline-flex p-2 rounded-lg ${card.bgColor} mb-2`}>
                <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
              </div>
              <p className="text-[11px] font-medium text-muted-foreground truncate">{card.title}</p>
              <p className="text-lg sm:text-2xl font-bold tracking-tight mt-0.5">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warehouse Summary */}
      {pendingByExpedition.length > 0 && (
        <Card className="shadow-card border animate-slide-up">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Warehouse className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">Warehouse Summary</p>
              <span className="text-[10px] text-muted-foreground">({totalPending} pending)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pendingByExpedition.map(e => (
                <span key={e.type} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-primary-foreground ${EXPEDITION_COLORS[e.type]}`}>
                  {e.type}: {e.count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
