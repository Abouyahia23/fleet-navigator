import { useState } from 'react';
import { 
  Car, 
  Fuel, 
  Wrench, 
  ClipboardList, 
  Receipt, 
  Calendar, 
  FileText, 
  BarChart3, 
  Mail, 
  Search, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Truck,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: 'gestionnaire' | 'utilisateur';
  userName: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
  { id: 'vehicles', label: 'Véhicules', icon: Car },
  { id: 'fuel', label: 'Carburant', icon: Fuel },
  { id: 'tickets', label: 'Tickets Réparation', icon: Wrench },
  { id: 'workorders', label: 'Ordres de Travail', icon: ClipboardList },
  { id: 'expenses', label: 'Dépenses', icon: Receipt },
  { id: 'planning', label: 'Planning Entretien', icon: Calendar },
  { id: 'gestionnaires', label: 'Gestionnaires', icon: UserCog },
  { id: 'admin', label: 'Administratif', icon: FileText },
];

const bottomNavItems = [
  { id: 'alerts', label: 'Alertes', icon: Mail, requiresGestionnaire: true },
  { id: 'search', label: 'Rechercher', icon: Search },
  { id: 'settings', label: 'Paramètres', icon: Settings, requiresGestionnaire: true },
];

export function Sidebar({ currentPage, onNavigate, userRole, userName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "gradient-sidebar h-screen flex flex-col transition-all duration-300 relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo & Title */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5 text-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-sidebar-foreground">Parc Auto</h1>
              <p className="text-xs text-sidebar-foreground/60">Gestion de flotte</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <div className="px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "nav-item w-full",
                  isActive && "active"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border py-4">
        <div className="px-3 space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isDisabled = item.requiresGestionnaire && userRole !== 'gestionnaire';
            
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && onNavigate(item.id)}
                disabled={isDisabled}
                className={cn(
                  "nav-item w-full",
                  isActive && "active",
                  isDisabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-sidebar-foreground">
              {userName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{userRole}</p>
            </div>
          )}
          {!collapsed && (
            <button className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
