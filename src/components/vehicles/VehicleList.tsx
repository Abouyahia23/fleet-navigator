import { useState } from 'react';
import { Plus, Search, Car, Edit, Eye, Loader2 } from 'lucide-react';
import { VehicleForm } from './VehicleForm';
import { cn } from '@/lib/utils';
import { useVehicles, useCreateVehicle, useUpdateVehicle } from '@/hooks/useVehicles';
import { useSites } from '@/hooks/useSites';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;

export function VehicleList() {
  const { data: vehicles = [], isLoading, error } = useVehicles();
  const { data: sites = [] } = useSites();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modele.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = !filterSite || v.site_id === filterSite;
    const matchesStatut = !filterStatut || v.statut === filterStatut;
    return matchesSearch && matchesSite && matchesStatut;
  });

  const handleSave = async (vehicleData: TablesInsert<'vehicles'>) => {
    if (editingVehicle) {
      await updateVehicle.mutateAsync({ id: editingVehicle.id, ...vehicleData });
    } else {
      await createVehicle.mutateAsync(vehicleData);
    }
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'Actif':
        return 'badge-success';
      case 'Immobilisé':
        return 'badge-warning';
      case 'Sorti':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  const getSiteName = (siteId: string | null) => {
    if (!siteId) return 'Non assigné';
    const site = sites.find(s => s.id === siteId);
    return site?.nom || 'Inconnu';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Erreur lors du chargement des véhicules</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <VehicleForm
        vehicle={editingVehicle as any}
        onSave={handleSave as any}
        onCancel={() => {
          setShowForm(false);
          setEditingVehicle(null);
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Liste des Véhicules</h2>
          <p className="text-sm text-muted-foreground">{filteredVehicles.length} véhicules trouvés</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nouveau Véhicule
        </button>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par immatriculation, marque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            <option value="">Tous les sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.nom}</option>
            ))}
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="input-field w-full sm:w-40"
          >
            <option value="">Tous statuts</option>
            <option value="Actif">Actif</option>
            <option value="Immobilisé">Immobilisé</option>
            <option value="Sorti">Sorti</option>
          </select>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="card-elevated overflow-hidden hover:shadow-card-hover transition-all duration-200 animate-fade-in"
          >
            {/* Vehicle Image */}
            <div className="w-full h-36 bg-muted/30 relative">
              {vehicle.image_url ? (
                <img
                  src={vehicle.image_url}
                  alt={`${vehicle.marque} ${vehicle.modele}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
              <span className={cn("absolute top-2 right-2 text-xs", getStatusBadge(vehicle.statut))}>
                {vehicle.statut}
              </span>
            </div>

            <div className="p-5">
              <div className="mb-4">
                <p className="font-bold text-lg">{vehicle.immatriculation}</p>
                <p className="text-sm text-muted-foreground">{vehicle.marque} {vehicle.modele}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Énergie</span>
                  <span className="font-medium">{vehicle.energie}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Site</span>
                  <span className="font-medium">{getSiteName(vehicle.site_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Affectataire</span>
                  <span className="font-medium truncate max-w-[150px]">{vehicle.affectataire || '-'}</span>
                </div>
                {vehicle.annee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Année</span>
                    <span className="font-medium">{vehicle.annee}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <Eye className="w-4 h-4 text-secondary-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Aucun véhicule trouvé</p>
          <p className="text-sm text-muted-foreground/70">Essayez de modifier vos filtres</p>
        </div>
      )}
    </div>
  );
}
