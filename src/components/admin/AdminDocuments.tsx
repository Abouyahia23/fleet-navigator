import { useState } from 'react';
import { Save, AlertTriangle, Shield, FileCheck, Car, Loader2 } from 'lucide-react';
import { useVehicles, useUpdateVehicle } from '@/hooks/useVehicles';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function AdminDocuments() {
  const { data: vehicles = [], isLoading } = useVehicles();
  const updateVehicle = useUpdateVehicle();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    finAssurance: '',
    finCT: '',
    finGPL: '',
    vignetteAnnee: '',
    observations: '',
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;

  const today = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  const getAlertStatus = (dateStr?: string | null) => {
    if (!dateStr) return 'none';
    const date = new Date(dateStr);
    const diff = date.getTime() - today.getTime();
    if (diff < 0) return 'expired';
    if (diff < thirtyDays) return 'warning';
    return 'ok';
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicleId(vehicle.id);
      setFormData({
        finAssurance: vehicle.fin_assurance || '',
        finCT: vehicle.fin_ct || '',
        finGPL: vehicle.fin_gpl || '',
        vignetteAnnee: vehicle.vignette_annee?.toString() || '',
        observations: vehicle.observations || '',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return;

    updateVehicle.mutate({
      id: selectedVehicleId,
      fin_assurance: formData.finAssurance || null,
      fin_ct: formData.finCT || null,
      fin_gpl: formData.finGPL || null,
      vignette_annee: parseInt(formData.vignetteAnnee) || null,
      observations: formData.observations || null,
    }, {
      onSuccess: () => toast.success('Documents mis à jour'),
      onError: (error) => toast.error('Erreur', { description: error.message }),
    });
  };

  const alertsCount = vehicles.reduce((count, v) => {
    if (getAlertStatus(v.fin_assurance) !== 'ok') count++;
    if (getAlertStatus(v.fin_ct) !== 'ok') count++;
    if (v.energie === 'GPL' && getAlertStatus(v.fin_gpl) !== 'ok') count++;
    return count;
  }, 0);

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 1 + i);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Documents Administratifs</h2>
          <p className="text-sm text-muted-foreground">Assurance, Contrôle Technique, Vignette, GPL</p>
        </div>
        {alertsCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 text-warning">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{alertsCount} alertes</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated p-6">
          <h3 className="text-lg font-semibold mb-4">État des Documents</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header text-left py-3 px-3">Véhicule</th>
                  <th className="table-header text-center py-3 px-3">Assurance</th>
                  <th className="table-header text-center py-3 px-3">CT</th>
                  <th className="table-header text-center py-3 px-3">GPL</th>
                  <th className="table-header text-center py-3 px-3">Vignette</th>
                  <th className="table-header text-left py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const assuranceStatus = getAlertStatus(vehicle.fin_assurance);
                  const ctStatus = getAlertStatus(vehicle.fin_ct);
                  const gplStatus = vehicle.energie === 'GPL' ? getAlertStatus(vehicle.fin_gpl) : 'none';

                  return (
                    <tr 
                      key={vehicle.id} 
                      className={cn(
                        "border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer",
                        selectedVehicleId === vehicle.id && "bg-primary/5"
                      )}
                      onClick={() => handleVehicleSelect(vehicle.id)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Car className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{vehicle.immatriculation}</p>
                            <p className="text-xs text-muted-foreground">{vehicle.marque}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={assuranceStatus} date={vehicle.fin_assurance} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={ctStatus} date={vehicle.fin_ct} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        {vehicle.energie === 'GPL' ? (
                          <StatusBadge status={gplStatus} date={vehicle.fin_gpl} />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {vehicle.vignette_annee ? (
                          <span className={cn(
                            "badge-info",
                            vehicle.vignette_annee < today.getFullYear() && "badge-danger"
                          )}>
                            {vehicle.vignette_annee}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button className="text-primary text-sm hover:underline">
                          Modifier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-elevated p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Mise à jour
          </h3>
          
          {selectedVehicle ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50 mb-4">
                <p className="font-medium">{selectedVehicle.immatriculation}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedVehicle.marque} {selectedVehicle.modele}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Fin Assurance</label>
                <input
                  type="date"
                  value={formData.finAssurance}
                  onChange={(e) => setFormData({ ...formData, finAssurance: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Fin Contrôle Technique</label>
                <input
                  type="date"
                  value={formData.finCT}
                  onChange={(e) => setFormData({ ...formData, finCT: e.target.value })}
                  className="input-field"
                />
              </div>

              {selectedVehicle.energie === 'GPL' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fin GPL</label>
                  <input
                    type="date"
                    value={formData.finGPL}
                    onChange={(e) => setFormData({ ...formData, finGPL: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">Année Vignette</label>
                <select
                  value={formData.vignetteAnnee}
                  onChange={(e) => setFormData({ ...formData, vignetteAnnee: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sélectionner...</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Observations</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="input-field min-h-[80px]"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="btn-primary w-full" disabled={updateVehicle.isPending}>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <FileCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Sélectionnez un véhicule pour modifier ses documents
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, date }: { status: string; date?: string | null }) {
  if (status === 'none' || !date) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });

  return (
    <span className={cn(
      "text-xs font-medium",
      status === 'ok' && "badge-success",
      status === 'warning' && "badge-warning",
      status === 'expired' && "badge-danger"
    )}>
      {formattedDate}
    </span>
  );
}
