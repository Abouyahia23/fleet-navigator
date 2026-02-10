import { useState, useEffect } from 'react';
import { Save, Plus, History, Fuel, AlertTriangle, Loader2 } from 'lucide-react';
import { useFuelEntries, useCreateFuelEntry } from '@/hooks/useFuelEntries';
import { useVehicles } from '@/hooks/useVehicles';
import { useStations } from '@/hooks/useStations';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function FuelEntry() {
  const { data: entries = [], isLoading } = useFuelEntries();
  const { data: vehicles = [] } = useVehicles();
  const { data: stations = [] } = useStations();
  const createFuelEntry = useCreateFuelEntry();
  const { user } = useAuth();

  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicleId: '',
    kmCompteur: '',
    kmPrecedent: 0,
    litres: '',
    montant: '',
    stationId: '',
    modePaiement: 'Carte' as 'Cash' | 'Carte' | 'Bon' | 'Virement',
    observations: '',
  });

  const [calculatedValues, setCalculatedValues] = useState({
    distance: 0,
    consommation: 0,
    coutKm: 0,
  });

  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (formData.vehicleId) {
      const vehicleEntries = entries.filter(e => e.vehicle_id === formData.vehicleId);
      if (vehicleEntries.length > 0) {
        const lastEntry = vehicleEntries[0]; // Already sorted desc
        setFormData(prev => ({ ...prev, kmPrecedent: lastEntry.km_compteur }));
      } else {
        setFormData(prev => ({ ...prev, kmPrecedent: 0 }));
      }
    }
  }, [formData.vehicleId, entries]);

  useEffect(() => {
    const km = parseInt(formData.kmCompteur) || 0;
    const litres = parseFloat(formData.litres) || 0;
    const montant = parseFloat(formData.montant) || 0;
    const distance = km - formData.kmPrecedent;

    if (distance < 0 && formData.kmCompteur) {
      setWarning('Attention: Le kilométrage est inférieur au précédent!');
    } else {
      setWarning('');
    }

    const consommation = distance > 0 && litres > 0 ? (litres / distance) * 100 : 0;
    const coutKm = distance > 0 && montant > 0 ? montant / distance : 0;

    setCalculatedValues({
      distance: Math.max(0, distance),
      consommation: parseFloat(consommation.toFixed(2)),
      coutKm: parseFloat(coutKm.toFixed(2)),
    });
  }, [formData.kmCompteur, formData.kmPrecedent, formData.litres, formData.montant]);

  const resetForm = (keepVehicle = false) => {
    setFormData(prev => ({
      date: new Date().toISOString().split('T')[0],
      vehicleId: keepVehicle ? prev.vehicleId : '',
      kmCompteur: '',
      kmPrecedent: keepVehicle ? prev.kmPrecedent : 0,
      litres: '',
      montant: '',
      stationId: keepVehicle ? prev.stationId : '',
      modePaiement: 'Carte',
      observations: '',
    }));
  };

  const handleSubmit = (e: React.FormEvent, addNew: boolean = false) => {
    e.preventDefault();
    createFuelEntry.mutate({
      date: formData.date,
      vehicle_id: formData.vehicleId,
      km_compteur: parseInt(formData.kmCompteur),
      km_precedent: formData.kmPrecedent,
      litres: parseFloat(formData.litres),
      montant: parseFloat(formData.montant),
      station_id: formData.stationId || null,
      mode_paiement: formData.modePaiement,
      observations: formData.observations || null,
      created_by: user?.id || null,
    }, {
      onSuccess: () => {
        toast.success('Entrée carburant enregistrée');
        resetForm(addNew);
      },
      onError: (error) => {
        toast.error('Erreur lors de l\'enregistrement', { description: error.message });
      },
    });
  };

  const selectedVehicleEntries = entries.filter(e => e.vehicle_id === formData.vehicleId);

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
          <h2 className="text-xl font-semibold">Saisie Carburant</h2>
          <p className="text-sm text-muted-foreground">Enregistrer un plein de carburant</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-secondary"
        >
          <History className="w-4 h-4" />
          {showHistory ? 'Masquer' : 'Historique'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 card-elevated p-6">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Véhicule <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.immatriculation} - {v.marque} {v.modele}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Km Précédent</label>
                <input
                  type="number"
                  value={formData.kmPrecedent}
                  className="input-field bg-muted"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Km Compteur <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={formData.kmCompteur}
                  onChange={(e) => setFormData({ ...formData, kmCompteur: e.target.value })}
                  className="input-field"
                  placeholder="45230"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Litres <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.litres}
                  onChange={(e) => setFormData({ ...formData, litres: e.target.value })}
                  className="input-field"
                  placeholder="42"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Montant (DZD) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  className="input-field"
                  placeholder="5880"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Station</label>
                <select
                  value={formData.stationId}
                  onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sélectionner...</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Mode Paiement</label>
                <select
                  value={formData.modePaiement}
                  onChange={(e) => setFormData({ ...formData, modePaiement: e.target.value as any })}
                  className="input-field"
                >
                  <option value="Cash">Cash</option>
                  <option value="Carte">Carte</option>
                  <option value="Bon">Bon</option>
                  <option value="Virement">Virement</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-1.5">Observations</label>
                <input
                  type="text"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="input-field"
                  placeholder="Notes..."
                />
              </div>
            </div>

            {warning && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">{warning}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={createFuelEntry.isPending}>
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any, true)}
                className="btn-accent"
                disabled={createFuelEntry.isPending}
              >
                <Plus className="w-4 h-4" />
                Enregistrer & Nouveau
              </button>
            </div>
          </form>
        </div>

        {/* Calculated Values Card */}
        <div className="card-elevated p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-primary" />
            Calculs Instantanés
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Distance parcourue</p>
              <p className="text-2xl font-bold">{calculatedValues.distance} km</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10">
              <p className="text-sm text-muted-foreground">Consommation</p>
              <p className="text-2xl font-bold text-primary">{calculatedValues.consommation} L/100km</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10">
              <p className="text-sm text-muted-foreground">Coût par km</p>
              <p className="text-2xl font-bold text-accent">{calculatedValues.coutKm} DZD</p>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      {showHistory && selectedVehicleEntries.length > 0 && (
        <div className="card-elevated p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Historique du véhicule</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header text-left py-3 px-4">Date</th>
                  <th className="table-header text-left py-3 px-4">Km</th>
                  <th className="table-header text-left py-3 px-4">Litres</th>
                  <th className="table-header text-left py-3 px-4">Montant</th>
                  <th className="table-header text-left py-3 px-4">Conso.</th>
                  <th className="table-header text-left py-3 px-4">Station</th>
                </tr>
              </thead>
              <tbody>
                {selectedVehicleEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 text-sm">{entry.date}</td>
                    <td className="py-3 px-4 text-sm font-medium">{entry.km_compteur}</td>
                    <td className="py-3 px-4 text-sm">{entry.litres} L</td>
                    <td className="py-3 px-4 text-sm">{Number(entry.montant).toLocaleString()} DZD</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="badge-info">{entry.consommation ? Number(entry.consommation).toFixed(2) : '-'} L/100km</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{(entry as any).station?.nom || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
