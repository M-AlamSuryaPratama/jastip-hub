import { Package as PackageIcon, Truck, CircleDollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Package } from '@/lib/types';

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
  );
}
