import { useState } from 'react';
import { Plus, Wrench, AlertCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { RepairTicket } from '@/types/fleet';
import { mockRepairTickets, mockVehicles, prestataires, chauffeurs, sites, structures } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function TicketList() {
  const [tickets, setTickets] = useState<RepairTicket[]>(mockRepairTickets);
  const [showForm, setShowForm] = useState(false);
  const [filterStatut, setFilterStatut] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '',
    km: '',
    symptome: '',
    priorite: 'Normale' as const,
    chauffeur: '',
    prestataire: '',
    observations: '',
  });

  const filteredTickets = filterStatut 
    ? tickets.filter(t => t.statut === filterStatut)
    : tickets;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = mockVehicles.find(v => v.id === formData.vehicleId);
    const newTicket: RepairTicket = {
      id: `T${String(tickets.length + 1).padStart(3, '0')}`,
      dateDemande: new Date().toISOString().split('T')[0],
      site: vehicle?.site || '',
      structure: vehicle?.structure || '',
      vehicleId: formData.vehicleId,
      immatriculation: vehicle?.immatriculation || '',
      km: parseInt(formData.km),
      symptome: formData.symptome,
      priorite: formData.priorite,
      statut: 'Ouvert',
      chauffeur: formData.chauffeur,
      prestataire: formData.prestataire,
      observations: formData.observations,
    };
    setTickets([newTicket, ...tickets]);
    setShowForm(false);
    setFormData({
      vehicleId: '',
      km: '',
      symptome: '',
      priorite: 'Normale',
      chauffeur: '',
      prestataire: '',
      observations: '',
    });
  };

  const updateStatus = (ticketId: string, newStatus: RepairTicket['statut']) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, statut: newStatus } : t
    ));
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tickets Réparation</h2>
          <p className="text-sm text-muted-foreground">Gérer les demandes de réparation</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nouveau Ticket
        </button>
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
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {mockVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.immatriculation} - {v.marque}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Kilométrage *</label>
                <input
                  type="number"
                  value={formData.km}
                  onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Priorité</label>
                <select
                  value={formData.priorite}
                  onChange={(e) => setFormData({ ...formData, priorite: e.target.value as any })}
                  className="input-field"
                >
                  <option value="Normale">Normale</option>
                  <option value="Haute">Haute</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium mb-1.5">Symptôme / Description *</label>
                <textarea
                  value={formData.symptome}
                  onChange={(e) => setFormData({ ...formData, symptome: e.target.value })}
                  className="input-field min-h-[80px]"
                  placeholder="Décrivez le problème..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Chauffeur</label>
                <select
                  value={formData.chauffeur}
                  onChange={(e) => setFormData({ ...formData, chauffeur: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sélectionner...</option>
                  {chauffeurs.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Prestataire pressenti</label>
                <select
                  value={formData.prestataire}
                  onChange={(e) => setFormData({ ...formData, prestataire: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sélectionner...</option>
                  {prestataires.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary">
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
          <div
            key={ticket.id}
            className="card-elevated p-5 hover:shadow-card-hover transition-all animate-fade-in"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Left: Priority & ID */}
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold",
                  getPriorityColor(ticket.priorite)
                )}>
                  {ticket.priorite[0]}
                </div>
                <div>
                  <p className="font-bold">{ticket.id}</p>
                  <p className="text-sm text-muted-foreground">{ticket.dateDemande}</p>
                </div>
              </div>

              {/* Center: Details */}
              <div className="flex-1">
                <p className="font-medium">{ticket.symptome}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span>🚗 {ticket.immatriculation}</span>
                  <span>📍 {ticket.site}</span>
                  <span>📊 {ticket.km} km</span>
                  {ticket.chauffeur && <span>👤 {ticket.chauffeur}</span>}
                </div>
              </div>

              {/* Right: Status & Actions */}
              <div className="flex items-center gap-3">
                <span className={cn("flex items-center gap-1.5", getStatusStyle(ticket.statut))}>
                  {getStatusIcon(ticket.statut)}
                  {ticket.statut}
                </span>
                {ticket.statut !== 'Clôturé' && (
                  <div className="flex gap-2">
                    {ticket.statut === 'Ouvert' && (
                      <button
                        onClick={() => updateStatus(ticket.id, 'En cours')}
                        className="btn-secondary text-sm py-1.5"
                      >
                        Démarrer
                      </button>
                    )}
                    {ticket.statut === 'En cours' && (
                      <button
                        onClick={() => updateStatus(ticket.id, 'Clôturé')}
                        className="btn-accent text-sm py-1.5"
                      >
                        Clôturer
                      </button>
                    )}
                    <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
