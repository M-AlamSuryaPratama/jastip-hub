import { DashboardCards } from '@/components/DashboardCards';
import { PackageForm } from '@/components/PackageForm';
import { PackageList } from '@/components/PackageList';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { usePackages } from '@/hooks/usePackages';
import logoSrc from '/logo.png';

const Index = () => {
  const { data: packages = [], isLoading } = usePackages();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-elevated">
        <div className="container max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <img src={logoSrc} alt="Alam Jastip Logo" width={32} height={32} className="h-8 w-8 rounded-md bg-primary-foreground/10 p-0.5" />
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">Alam Jastip</h1>
            <p className="text-[10px] font-medium opacity-80 leading-none">Last-Mile Management</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 py-5 space-y-5 pb-10">
        <DashboardCards packages={packages} />
        <PackageForm />
        <PackageList packages={packages} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default Index;
