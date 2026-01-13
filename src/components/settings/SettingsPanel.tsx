import { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Car, 
  MapPin, 
  Building2, 
  Wrench, 
  Users,
  Fuel,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { marques, modelesByMarque, sites, structures, chauffeurs, prestataires } from '@/data/mockData';

type ReferentialType = 'marques' | 'modeles' | 'sites' | 'structures' | 'chauffeurs' | 'prestataires' | 'energies' | 'categories';

interface ReferentialItem {
  id: string;
  value: string;
  parentId?: string;
}

const referentialConfig: Record<ReferentialType, { label: string; icon: React.ElementType; hasParent?: boolean; parentLabel?: string }> = {
  marques: { label: 'Marques', icon: Car },
  modeles: { label: 'Modèles', icon: Tag, hasParent: true, parentLabel: 'Marque' },
  sites: { label: 'Sites', icon: MapPin },
  structures: { label: 'Structures', icon: Building2 },
  chauffeurs: { label: 'Chauffeurs', icon: Users },
  prestataires: { label: 'Prestataires', icon: Wrench },
  energies: { label: 'Types d\'énergie', icon: Fuel },
  categories: { label: 'Catégories véhicule', icon: Car },
};

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<ReferentialType>('marques');
  const [editingItem, setEditingItem] = useState<ReferentialItem | null>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemParent, setNewItemParent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Mock state for referentials
  const [referentials, setReferentials] = useState<Record<ReferentialType, ReferentialItem[]>>({
    marques: marques.map((m, i) => ({ id: `m${i}`, value: m })),
    modeles: Object.entries(modelesByMarque).flatMap(([marque, modeles]) => 
      modeles.map((m, i) => ({ id: `mod${marque}${i}`, value: m, parentId: marque }))
    ),
    sites: sites.map((s, i) => ({ id: `s${i}`, value: s })),
    structures: structures.map((s, i) => ({ id: `st${i}`, value: s })),
    chauffeurs: chauffeurs.map((c, i) => ({ id: `c${i}`, value: c })),
    prestataires: prestataires.map((p, i) => ({ id: `p${i}`, value: p })),
    energies: ['Diesel', 'Essence', 'GPL', 'Électrique', 'Hybride'].map((e, i) => ({ id: `e${i}`, value: e })),
    categories: ['Pick-up', 'Utilitaire', 'SUV', 'Berline', 'Camion', 'Minibus', 'Fourgon'].map((c, i) => ({ id: `cat${i}`, value: c })),
  });

  const currentConfig = referentialConfig[activeTab];
  const currentItems = referentials[activeTab];

  const handleAdd = () => {
    if (!newItemValue.trim()) return;
    
    const newItem: ReferentialItem = {
      id: `new${Date.now()}`,
      value: newItemValue.trim(),
      ...(currentConfig.hasParent && newItemParent ? { parentId: newItemParent } : {}),
    };

    setReferentials({
      ...referentials,
      [activeTab]: [...referentials[activeTab], newItem],
    });

    setNewItemValue('');
    setNewItemParent('');
    setIsAdding(false);
  };

  const handleEdit = (item: ReferentialItem) => {
    setEditingItem(item);
    setNewItemValue(item.value);
    setNewItemParent(item.parentId || '');
  };

  const handleSaveEdit = () => {
    if (!editingItem || !newItemValue.trim()) return;

    setReferentials({
      ...referentials,
      [activeTab]: referentials[activeTab].map(item =>
        item.id === editingItem.id
          ? { ...item, value: newItemValue.trim(), parentId: newItemParent || undefined }
          : item
      ),
    });

    setEditingItem(null);
    setNewItemValue('');
    setNewItemParent('');
  };

  const handleDelete = (id: string) => {
    setReferentials({
      ...referentials,
      [activeTab]: referentials[activeTab].filter(item => item.id !== id),
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewItemValue('');
    setNewItemParent('');
    setIsAdding(false);
  };

  // Group modeles by marque for display
  const getGroupedItems = () => {
    if (activeTab === 'modeles') {
      const grouped: Record<string, ReferentialItem[]> = {};
      currentItems.forEach(item => {
        const parent = item.parentId || 'Sans marque';
        if (!grouped[parent]) grouped[parent] = [];
        grouped[parent].push(item);
      });
      return grouped;
    }
    return null;
  };

  const groupedItems = getGroupedItems();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
          <Settings className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Paramètres</h2>
          <p className="text-sm text-muted-foreground">
            Gestion des référentiels et configuration du système
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Referential Tabs */}
        <div className="lg:col-span-1">
          <div className="card-elevated p-4 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Référentiels
            </h3>
            {(Object.keys(referentialConfig) as ReferentialType[]).map((key) => {
              const config = referentialConfig[key];
              const Icon = config.icon;
              const count = referentials[key].length;

              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    handleCancelEdit();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                    activeTab === key
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 truncate">{config.label}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    activeTab === key 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="card-elevated">
            {/* Content Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = currentConfig.icon;
                  return <Icon className="w-5 h-5 text-primary" />;
                })()}
                <h3 className="font-semibold">{currentConfig.label}</h3>
                <span className="text-sm text-muted-foreground">
                  ({currentItems.length} éléments)
                </span>
              </div>
              {!isAdding && !editingItem && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              )}
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingItem) && (
              <div className="p-4 bg-muted/30 border-b border-border">
                <div className="flex flex-col sm:flex-row gap-3">
                  {currentConfig.hasParent && (
                    <select
                      value={newItemParent}
                      onChange={(e) => setNewItemParent(e.target.value)}
                      className="input-field sm:w-48"
                    >
                      <option value="">Sélectionner {currentConfig.parentLabel}...</option>
                      {referentials.marques.map(m => (
                        <option key={m.id} value={m.value}>{m.value}</option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    placeholder={`Nom ${currentConfig.label.toLowerCase().slice(0, -1)}...`}
                    className="input-field flex-1"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={editingItem ? handleSaveEdit : handleAdd}
                      className="btn-primary"
                      disabled={!newItemValue.trim()}
                    >
                      <Save className="w-4 h-4" />
                      {editingItem ? 'Modifier' : 'Ajouter'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-secondary"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {groupedItems ? (
                // Grouped display for modeles
                <div className="space-y-4">
                  {Object.entries(groupedItems).map(([parent, items]) => (
                    <div key={parent}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        {parent}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ml-6">
                        {items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg group"
                          >
                            <span className="truncate">{item.value}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 rounded-md hover:bg-primary/10 text-primary"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Simple list display
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {currentItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg group hover:bg-secondary transition-colors"
                    >
                      <span className="truncate">{item.value}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-md hover:bg-primary/10 text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentItems.length === 0 && (
                <div className="text-center py-12">
                  {(() => {
                    const Icon = currentConfig.icon;
                    return <Icon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />;
                  })()}
                  <p className="text-muted-foreground">Aucun élément</p>
                  <p className="text-sm text-muted-foreground/70">
                    Cliquez sur "Ajouter" pour créer un nouvel élément
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* System Settings */}
          <div className="card-elevated mt-6 p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configuration Système
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Délai d'alerte avant échéance (jours)
                </label>
                <input
                  type="number"
                  defaultValue={30}
                  className="input-field"
                  min={1}
                  max={90}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nombre de jours avant l'échéance pour déclencher une alerte
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Consommation max acceptable (L/100km)
                </label>
                <input
                  type="number"
                  defaultValue={15}
                  className="input-field"
                  step={0.5}
                  min={5}
                  max={30}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Seuil au-delà duquel une alerte de surconsommation est générée
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email notifications
                </label>
                <input
                  type="email"
                  defaultValue="parc@entreprise.dz"
                  className="input-field"
                  placeholder="email@exemple.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email principal pour recevoir les alertes système
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Format immatriculation
                </label>
                <input
                  type="text"
                  defaultValue="00000-000-00"
                  className="input-field"
                  placeholder="Format attendu"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Masque de validation des immatriculations
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-border">
              <button className="btn-primary">
                <Save className="w-4 h-4" />
                Enregistrer la configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}