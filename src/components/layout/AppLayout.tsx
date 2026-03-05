import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Tableau de Bord', subtitle: 'Vue d\'ensemble de votre parc automobile' },
  '/dashboard': { title: 'Tableau de Bord', subtitle: 'Vue d\'ensemble de votre parc automobile' },
  '/vehicles': { title: 'Véhicules', subtitle: 'Gestion du parc automobile' },
  '/fuel': { title: 'Carburant', subtitle: 'Suivi des consommations' },
  '/tickets': { title: 'Tickets Réparation', subtitle: 'Demandes de réparation' },
  '/workorders': { title: 'Ordres de Travail', subtitle: 'Entretien et réparations' },
  '/expenses': { title: 'Dépenses', subtitle: 'Suivi des coûts' },
  '/planning': { title: 'Planning', subtitle: 'Rendez-vous d\'entretien' },
  '/gestionnaires': { title: 'Gestionnaires', subtitle: 'Responsables du parc automobile' },
  '/admin': { title: 'Administratif', subtitle: 'Documents et échéances' },
  '/statistics': { title: 'États Statistiques', subtitle: 'Analyses et rapports du parc' },
  '/alerts': { title: 'Alertes', subtitle: 'Notifications et échéances du système' },
  '/settings': { title: 'Paramètres', subtitle: 'Configuration système' },
};

// Map route paths to sidebar page IDs
function routeToPageId(pathname: string): string {
  if (pathname === '/') return 'dashboard';
  return pathname.replace('/', '');
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { isGestionnaire } = useUserRole();

  const userName = profile ? `${profile.prenom || ''} ${profile.nom}`.trim() : 'Utilisateur';
  const userRole = isGestionnaire ? 'gestionnaire' as const : 'utilisateur' as const;

  const config = pageConfig[location.pathname] || pageConfig['/'];
  const currentPage = routeToPageId(location.pathname);

  const handleNavigate = (page: string) => {
    navigate(page === 'dashboard' ? '/' : `/${page}`);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userRole={userRole}
        userName={userName}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={config.title}
          subtitle={config.subtitle}
          onNavigateToAlerts={() => navigate('/alerts')}
        />
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
