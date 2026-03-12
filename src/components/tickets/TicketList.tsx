import { useState } from 'react';
import { Plus, Wrench, AlertCircle, Clock, CheckCircle, ArrowRight, Loader2, Download } from 'lucide-react';
import { useRepairTickets, useCreateRepairTicket, useUpdateRepairTicket } from '@/hooks/useRepairTickets';
import { useVehicles } from '@/hooks/useVehicles';
import { useChauffeurs } from '@/hooks/useChauffeurs';
import { usePrestataires } from '@/hooks/usePrestataires';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { exportToCsv } from '@/lib/exportUtils';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TicketStatus = Database['public']['Enums']['ticket_status'];
type TicketPriority = Database['public']['Enums']['ticket_priority'];

export function TicketList() {
  const { data: tickets = [], isLoading } = useRepairTickets();
  const { data: vehicles = [] } = useVehicles();
  const { data: chauffeurs = [] } = useChauffeurs();
  const { data: prestataires = [] } = usePrestataires();
  const createTicket = useCreateRepairTicket();
  const updateTicket = useUpdateRepairTicket();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [filterStatut, setFilterStatut] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '',
    km: '',
    symptome: '',
    priorite: 'Normale' as TicketPriority,
    chauffeurId: '',
    prestataireId: '',
    observations: '',
  });

  const filteredTickets = filterStatut
    ? tickets.filter(t => t.statut === filterStatut)
    : tickets;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate({
      vehicle_id: formData.vehicleId,
      km: parseInt(formData.km) || null,
      symptome: formData.symptome,
      priorite: formData.priorite,
      chauffeur_id: formData.chauffeurId || null,
      prestataire_id: formData.prestataireId || null,
      observations: formData.observations || null,
      created_by: user?.id || null,
    }, {
      onSuccess: () => {
        toast.success('Ticket créé');
        setShowForm(false);
        setFormData({ vehicleId: '', km: '', symptome: '', priorite: 'Normale', chauffeurId: '', prestataireId: '', observations: '' });
      },
      onError: (error) => {
        toast.error('Erreur', { description: error.message });
      },
    });
  };

  const updateStatus = (ticketId: string, newStatus: TicketStatus) => {
    updateTicket.mutate({ id: ticketId, statut: newStatus }, {
      onSuccess: () => toast.success(`Ticket mis à jour: ${newStatus}`),
      onError: (error) => toast.error('Erreur', { description: error.message }),
    });
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'Urgente': return 'bg-destructive text-destructive-foreground';
      case 'Haute': return 'bg-warning text-warning-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'Ouvert': return <AlertCircle className="w-4 h-4" />;
      case 'En cours': return <Clock className="w-4 h-4" />;
      case 'Clôturé': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusStyle = (statut: string) => {
    switch (statut) {
      case 'Ouvert': return 'badge-warning';
      case 'En cours': return 'badge-info';
      case 'Clôturé': return 'badge-success';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tickets Réparation</h2>
          <p className="text-sm text-muted-foreground">Gérer les demandes de réparation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const data = filteredTickets.map(t => ({
                'Numéro': t.numero, 'Date': t.date_demande,
                'Véhicule': (t as any).vehicle?.immatriculation || '',
                'Symptôme': t.symptome, 'Priorité': t.priorite,
                'Statut': t.statut, 'Km': t.km || '',
              }));
              if (!data.length) { toast.info('Aucune donnée à exporter'); return; }
              exportToCsv(data, 'tickets_reparation');
              toast.success('Export CSV généré');
            }}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nouveau Ticket
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'Ouvert', 'En cours', 'Clôturé'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatut(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filterStatut === status
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {status || 'Tous'} ({status ? tickets.filter(t => t.statut === status).length : tickets.length})
          </button>
        ))}
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="card-elevated p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Créer un Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Véhicule *</label>
                <select value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} className="input-field" required>
                  <option value="">Sélectionner...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.immatriculation} - {v.marque} {v.modele}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Kilométrage</label>
                <input type="number" value={formData.km} onChange={(e) => setFormData({ ...formData, km: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Priorité</label>
                <select value={formData.priorite} onChange={(e) => setFormData({ ...formData, priorite: e.target.value as TicketPriority })} className="input-field">
                  <option value="Normale">Normale</option>
                  <option value="Haute">Haute</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium mb-1.5">Symptôme / Description *</label>
                <textarea value={formData.symptome} onChange={(e) => setFormData({ ...formData, symptome: e.target.value })} className="input-field min-h-[80px]" placeholder="Décrivez le problème..." required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Chauffeur</label>
                <select value={formData.chauffeurId} onChange={(e) => setFormData({ ...formData, chauffeurId: e.target.value })} className="input-field">
                  <option value="">Sélectionner...</option>
                  {chauffeurs.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Prestataire pressenti</label>
                <select value={formData.prestataireId} onChange={(e) => setFormData({ ...formData, prestataireId: e.target.value })} className="input-field">
                  <option value="">Sélectionner...</option>
                  {prestataires.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary" disabled={createTicket.isPending}>
                <Wrench className="w-4 h-4" />
                Créer Ticket
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="card-elevated p-5 hover:shadow-card-hover transition-all animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold", getPriorityColor(ticket.priorite))}>
                  {ticket.priorite[0]}
                </div>
                <div>
                  <p className="font-bold">{ticket.numero}</p>
                  <p className="text-sm text-muted-foreground">{ticket.date_demande}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium">{ticket.symptome}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span>🚗 {(ticket as any).vehicle?.immatriculation || '-'}</span>
                  <span>📊 {ticket.km || '-'} km</span>
                  {(ticket as any).chauffeur && <span>👤 {(ticket as any).chauffeur.nom} {(ticket as any).chauffeur.prenom || ''}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("flex items-center gap-1.5", getStatusStyle(ticket.statut))}>
                  {getStatusIcon(ticket.statut)}
                  {ticket.statut}
                </span>
                {ticket.statut !== 'Clôturé' && (
                  <div className="flex gap-2">
                    {ticket.statut === 'Ouvert' && (
                      <button onClick={() => updateStatus(ticket.id, 'En cours')} className="btn-secondary text-sm py-1.5">
                        Démarrer
                      </button>
                    )}
                    {ticket.statut === 'En cours' && (
                      <button onClick={() => updateStatus(ticket.id, 'Clôturé')} className="btn-accent text-sm py-1.5">
                        Clôturer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Aucun ticket trouvé</p>
        </div>
      )}
    </div>
  );
}
