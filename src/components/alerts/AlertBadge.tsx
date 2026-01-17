import { Bell } from 'lucide-react';
import { useActiveAlertsCount } from '@/hooks/useAlerts';

interface AlertBadgeProps {
  onClick?: () => void;
}

export function AlertBadge({ onClick }: AlertBadgeProps) {
  const { data: count } = useActiveAlertsCount();

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-accent transition-colors"
    >
      <Bell className="h-5 w-5" />
      {count && count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
