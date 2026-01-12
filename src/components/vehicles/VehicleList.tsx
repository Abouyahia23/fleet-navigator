import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Car, Edit, Trash2, Eye } from 'lucide-react';
import { mockVehicles, sites, structures } from '@/data/mockData';
import { Vehicle } from '@/types/fleet';
import { VehicleForm } from './VehicleForm';
import { cn } from '@/lib/utils';

export function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
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
    const matchesSite = !filterSite || v.site === filterSite;
    const matchesStatut = !filterStatut || v.statut === filterStatut;
    return matchesSearch && matchesSite && matchesStatut;
  });

  const handleSave = (vehicle: Vehicle) => {
    if (editingVehicle) {
      setVehicles(vehicles.map(v => v.id === vehicle.id ? vehicle : v));
    } else {
      setVehicles([...vehicles, { ...vehicle, id: `V${String(vehicles.length + 1).padStart(3, '0')}` }]);
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

  if (showForm) {
    return (
      <VehicleForm
        vehicle={editingVehicle}
        onSave={handleSave}
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
              <option key={site} value={site}>{site}</option>
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
            className="card-elevated p-5 hover:shadow-card-hover transition-all duration-200 animate-fade-in"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{vehicle.immatriculation}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.marque} {vehicle.modele}</p>
                </div>
              </div>
              <span className={cn("text-xs", getStatusBadge(vehicle.statut))}>
                {vehicle.statut}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Énergie</span>
                <span className="font-medium">{vehicle.energie}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Site</span>
                <span className="font-medium">{vehicle.site}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Affectataire</span>
                <span className="font-medium truncate max-w-[150px]">{vehicle.affectataire}</span>
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
