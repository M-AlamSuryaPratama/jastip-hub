import { useState, useEffect } from 'react';

export function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-80">
      <span className={`h-2 w-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
      {online ? 'Online' : 'Offline'}
    </div>
  );
}
