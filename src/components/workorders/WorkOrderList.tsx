import { useState } from 'react';
import { Plus, ClipboardList, Wrench, Calendar, Receipt, Lock, Loader2 } from 'lucide-react';
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder } from '@/hooks/useWorkOrders';
import { useVehicles } from '@/hooks/useVehicles';
import { usePrestataires } from '@/hooks/usePrestataires';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type WorkOrderType = Database['public']['Enums']['work_order_type'];
type WorkOrderStatus = Database['public']['Enums']['work_order_status'];

export function WorkOrderList() {
  const { data: workOrders = [], isLoading } = useWorkOrders();
  const { data: vehicles = [] } = useVehicles();
  const { data: prestataires = [] } = usePrestataires();
  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'Correctif' as WorkOrderType,
    categorie: '',
    prestataireId: '',
    description: '',
    dateRDV: '',
    montantDevis: '',
    garantie: false,
    dateFinGarantie: '',
  });

  const categories = ['Moteur', 'Freins', 'Pneus', 'Vidange', 'Électrique', 'Carrosserie', 'Climatisation', 'Suspension'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWorkOrder.mutate({
      vehicle_id: formData.vehicleId,
      type: formData.type,
      categorie: formData.categorie || null,
      prestataire_id: formData.prestataireId || null,
      description: formData.description,
      date_rdv: formData.dateRDV || null,
      montant_devis: formData.montantDevis ? parseFloat(formData.montantDevis) : null,
      garantie: formData.garantie,
      date_fin_garantie: formData.dateFinGarantie || null,
      created_by: user?.id || null,
    }, {
      onSuccess: () => {
        toast.success('Ordre de travail créé');
        setShowForm(false);
        setFormData({ vehicleId: '', type: 'Correctif', categorie: '', prestataireId: '', description: '', dateRDV: '', montantDevis: '', garantie: false, dateFinGarantie: '' });
      },
      onError: (error) => {
        toast.error('Erreur', { description: error.message });
      },
    });
  };

  const updateStatus = (woId: string, newStatus: WorkOrderStatus) => {
    updateWorkOrder.mutate({ id: woId, statut: newStatus }, {
      onSuccess: () => toast.success(`OT mis à jour: ${newStatus}`),
      onError: (error) => toast.error('Erreur', { description: error.message }),
    });
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
          <h2 className="text-xl font-semibold">Ordres de Travail</h2>
          <p className="text-sm text-muted-foreground">Suivi des travaux d'entretien et réparation</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nouvel OT
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['Ouvert', 'En cours', 'Clôturé'] as WorkOrderStatus[]).map((status) => {
          const count = workOrders.filter(wo => wo.statut === status).length;
          return (
            <div key={status} className="card-elevated p-4">
              <p className="text-sm text-muted-foreground">{status}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
        <div className="card-elevated p-4 gradient-accent text-accent-foreground">
          <p className="text-sm opacity-80">Sous Garantie</p>
          <p className="text-2xl font-bold">{workOrders.filter(wo => wo.garantie).length}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-elevated p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Créer un Ordre de Travail</h3>
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
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkOrderType })} className="input-field">
                  <option value="Préventif">Préventif</option>
                  <option value="Correctif">Correctif</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Catégorie *</label>
                <select value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} className="input-field" required>
                  <option value="">Sélectionner...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Prestataire</label>
                <select value={formData.prestataireId} onChange={(e) => setFormData({ ...formData, prestataireId: e.target.value })} className="input-field">
                  <option value="">Sélectionner...</option>
                  {prestataires.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date RDV</label>
                <input type="date" value={formData.dateRDV} onChange={(e) => setFormData({ ...formData, dateRDV: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Montant Devis (DZD)</label>
                <input type="number" value={formData.montantDevis} onChange={(e) => setFormData({ ...formData, montantDevis: e.target.value })} className="input-field" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium mb-1.5">Description Travaux *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field min-h-[80px]" required />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.garantie} onChange={(e) => setFormData({ ...formData, garantie: e.target.checked })} className="w-4 h-4 rounded border-border" />
                  <span className="text-sm font-medium">Sous Garantie</span>
                </label>
              </div>
              {formData.garantie && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fin Garantie</label>
                  <input type="date" value={formData.dateFinGarantie} onChange={(e) => setFormData({ ...formData, dateFinGarantie: e.target.value })} className="input-field" />
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary" disabled={createWorkOrder.isPending}>
                <ClipboardList className="w-4 h-4" />
                Créer OT
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Work Orders List */}
      <div className="space-y-4">
        {workOrders.map((wo) => (
          <div key={wo.id} className="card-elevated p-5 hover:shadow-card-hover transition-all animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", wo.type === 'Préventif' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{wo.numero}</p>
                    {wo.garantie && <span className="badge-info text-xs">Garantie</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{wo.date_ouverture}</p>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", wo.type === 'Préventif' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>
                    {wo.type}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">{wo.categorie}</span>
                </div>
                <p className="font-medium">{wo.description}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span>🚗 {(wo as any).vehicle?.immatriculation || '-'}</span>
                  <span>🏭 {(wo as any).prestataire?.nom || '-'}</span>
                  {wo.date_rdv && <span>📅 RDV: {wo.date_rdv}</span>}
                  {wo.montant_devis && <span>💰 {Number(wo.montant_devis).toLocaleString()} DZD</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  wo.statut === 'Ouvert' && 'badge-warning',
                  wo.statut === 'En cours' && 'badge-info',
                  wo.statut === 'Clôturé' && 'badge-success'
                )}>
                  {wo.statut}
                </span>
                {wo.statut !== 'Clôturé' && (
                  <div className="flex gap-2">
                    {wo.statut === 'Ouvert' && (
                      <button onClick={() => updateStatus(wo.id, 'En cours')} className="btn-secondary text-sm py-1.5">
                        <Calendar className="w-4 h-4" />
                        Démarrer
                      </button>
                    )}
                    {wo.statut === 'En cours' && (
                      <button onClick={() => updateStatus(wo.id, 'Clôturé')} className="btn-accent text-sm py-1.5">
                        <Lock className="w-4 h-4" />
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

      {workOrders.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Aucun ordre de travail</p>
        </div>
      )}
    </div>
  );
}
