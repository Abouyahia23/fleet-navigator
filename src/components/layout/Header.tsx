import { Bell, Search } from 'lucide-react';
import { AlertBadge } from '@/components/alerts/AlertBadge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNavigateToAlerts?: () => void;
}

export function Header({ title, subtitle, onNavigateToAlerts }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input-field pl-10 w-64"
            />
          </div>

          {/* Notifications with real count */}
          <AlertBadge onClick={onNavigateToAlerts} />
        </div>
      </div>
    </header>
  );
}
