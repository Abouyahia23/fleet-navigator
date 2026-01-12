import { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, User, Truck } from 'lucide-react';
import { ScheduledMaintenance } from '@/types/fleet';
import { mockScheduledMaintenance, mockVehicles, prestataires, chauffeurs, sites } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function PlanningCalendar() {
  const [events, setEvents] = useState<ScheduledMaintenance[]>(mockScheduledMaintenance);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dateRDV: '',
    heure: '',
    vehicleId: '',
    chauffeur: '',
    prestataire: '',
    typeAction: 'Dépôt' as const,
    commentaire: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = mockVehicles.find(v => v.id === formData.vehicleId);
    const newEvent: ScheduledMaintenance = {
      id: `P${String(events.length + 1).padStart(3, '0')}`,
      dateRDV: formData.dateRDV,
      heure: formData.heure,
      site: vehicle?.site || '',
      structure: vehicle?.structure || '',
      vehicleId: formData.vehicleId,
      immatriculation: vehicle?.immatriculation || '',
      chauffeur: formData.chauffeur,
      prestataire: formData.prestataire,
      typeAction: formData.typeAction,
      statutRDV: 'Planifié',
      commentaire: formData.commentaire,
    };
    setEvents([...events, newEvent]);
    setShowForm(false);
    setFormData({
      dateRDV: '',
      heure: '',
      vehicleId: '',
      chauffeur: '',
      prestataire: '',
      typeAction: 'Dépôt',
      commentaire: '',
    });
  };

  const updateStatus = (eventId: string, newStatus: ScheduledMaintenance['statutRDV']) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, statutRDV: newStatus } : e
    ));
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'Dépôt': return 'bg-primary text-primary-foreground';
      case 'Récupération': return 'bg-success text-success-foreground';
      case 'Diagnostic': return 'bg-warning text-warning-foreground';
      case 'Devis': return 'bg-accent text-accent-foreground';
      case 'Réparation': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Planifié': return 'badge-info';
      case 'En cours': return 'badge-warning';
      case 'Terminé': return 'badge-success';
      case 'Annulé': return 'badge-danger';
      default: return '';
    }
  };

  const typeActions = ['Dépôt', 'Récupération', 'Diagnostic', 'Devis', 'Réparation'];

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.dateRDV]) {
      acc[event.dateRDV] = [];
    }
    acc[event.dateRDV].push(event);
    return acc;
  }, {} as Record<string, ScheduledMaintenance[]>);

  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Planning Entretien</h2>
          <p className="text-sm text-muted-foreground">Gérer les rendez-vous de maintenance</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nouveau RDV
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-elevated p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Planifier un RDV</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Date RDV *</label>
                <input
                  type="date"
                  value={formData.dateRDV}
                  onChange={(e) => setFormData({ ...formData, dateRDV: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Heure *</label>
                <input
                  type="time"
                  value={formData.heure}
                  onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Type Action *</label>
                <select
                  value={formData.typeAction}
                  onChange={(e) => setFormData({ ...formData, typeAction: e.target.value as any })}
                  className="input-field"
                >
                  {typeActions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
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
                    <option key={v.id} value={v.id}>{v.immatriculation}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium mb-1.5">Prestataire</label>
                <select
                  value={formData.prestataire}
                  onChange={(e) => setFormData({ ...formData, prestataire: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sélectionner...</option>
                  {prestataires.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium mb-1.5">Commentaire</label>
                <input
                  type="text"
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  className="input-field"
                  placeholder="Notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary">
                <Calendar className="w-4 h-4" />
                Enregistrer RDV
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline View */}
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">
                  {new Date(date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <p className="text-sm text-muted-foreground">{eventsByDate[date].length} rendez-vous</p>
              </div>
            </div>

            <div className="ml-5 border-l-2 border-border pl-8 space-y-4">
              {eventsByDate[date].map((event) => (
                <div
                  key={event.id}
                  className="card-elevated p-5 relative before:absolute before:left-[-2.15rem] before:top-6 before:w-3 before:h-3 before:rounded-full before:bg-primary"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium",
                        getActionColor(event.typeAction)
                      )}>
                        {event.typeAction}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {event.heure}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" />
                        <span className="font-medium">{event.immatriculation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {event.prestataire}
                      </div>
                      {event.chauffeur && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          {event.chauffeur}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={getStatusStyle(event.statutRDV)}>
                        {event.statutRDV}
                      </span>
                      {event.statutRDV === 'Planifié' && (
                        <button
                          onClick={() => updateStatus(event.id, 'Terminé')}
                          className="btn-accent text-sm py-1.5"
                        >
                          Terminer
                        </button>
                      )}
                    </div>
                  </div>

                  {event.commentaire && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                      {event.commentaire}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Aucun RDV planifié</p>
          <p className="text-sm text-muted-foreground/70">Créez votre premier rendez-vous</p>
        </div>
      )}
    </div>
  );
}
