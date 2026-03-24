import { Package } from 'lucide-react';
import { DashboardCards } from '@/components/DashboardCards';
import { PackageForm } from '@/components/PackageForm';
import { PackageList } from '@/components/PackageList';
import { usePackages } from '@/hooks/usePackages';

const Index = () => {
  const { data: packages = [], isLoading } = usePackages();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 shadow-elevated">
        <div className="container max-w-lg mx-auto flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h1 className="text-lg font-bold tracking-tight">Alam Jastip</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4 pb-8">
        <DashboardCards packages={packages} />
        <PackageForm />
        <PackageList packages={packages} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default Index;
