import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { VehicleList } from '@/components/vehicles/VehicleList';
import { FuelEntry } from '@/components/fuel/FuelEntry';
import { TicketList } from '@/components/tickets/TicketList';
import { WorkOrderList } from '@/components/workorders/WorkOrderList';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { PlanningCalendar } from '@/components/planning/PlanningCalendar';
import { AdminDocuments } from '@/components/admin/AdminDocuments';
import { GestionnaireList } from '@/components/gestionnaires/GestionnaireList';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { mockUsers } from '@/data/mockData';

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Tableau de Bord', subtitle: 'Vue d\'ensemble de votre parc automobile' },
  vehicles: { title: 'Véhicules', subtitle: 'Gestion du parc automobile' },
  fuel: { title: 'Carburant', subtitle: 'Suivi des consommations' },
  tickets: { title: 'Tickets Réparation', subtitle: 'Demandes de réparation' },
  workorders: { title: 'Ordres de Travail', subtitle: 'Entretien et réparations' },
  expenses: { title: 'Dépenses', subtitle: 'Suivi des coûts' },
  planning: { title: 'Planning', subtitle: 'Rendez-vous d\'entretien' },
  gestionnaires: { title: 'Gestionnaires', subtitle: 'Responsables du parc automobile' },
  admin: { title: 'Administratif', subtitle: 'Documents et échéances' },
  alerts: { title: 'Alertes', subtitle: 'Notifications système' },
  search: { title: 'Recherche', subtitle: 'Recherche dans le parc' },
  settings: { title: 'Paramètres', subtitle: 'Configuration système' },
};

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentUser] = useState(mockUsers[0]); // Gestionnaire by default

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'vehicles':
        return <VehicleList />;
      case 'fuel':
        return <FuelEntry />;
      case 'tickets':
        return <TicketList />;
      case 'workorders':
        return <WorkOrderList />;
      case 'expenses':
        return <ExpenseList />;
      case 'planning':
        return <PlanningCalendar />;
      case 'gestionnaires':
        return <GestionnaireList />;
      case 'admin':
        return <AdminDocuments />;
      case 'settings':
        return <SettingsPanel />;
      case 'alerts':
      case 'search':
        return (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-muted-foreground">
                {pageConfig[currentPage].title}
              </h2>
              <p className="text-muted-foreground/70 mt-2">Fonctionnalité en cours de développement</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const config = pageConfig[currentPage] || pageConfig.dashboard;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userRole={currentUser.role}
        userName={currentUser.nom}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={config.title} subtitle={config.subtitle} />
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default Index;
