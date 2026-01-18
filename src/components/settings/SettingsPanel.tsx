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
  Tag,
  Moon,
  Sun,
  Monitor,
  Palette,
  Check,
  Shield,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme, colorSchemes, type ColorScheme, type Theme } from '@/hooks/use-theme';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from './UserManagement';
import { useUserRole } from '@/hooks/useUserRole';
import { useSites, useCreateSite, useUpdateSite, useDeleteSite } from '@/hooks/useSites';
import { useStructures, useCreateStructure, useUpdateStructure, useDeleteStructure } from '@/hooks/useStructures';
import { usePrestataires, useCreatePrestataire, useUpdatePrestataire, useDeletePrestataire } from '@/hooks/usePrestataires';
import { useChauffeurs, useCreateChauffeur, useUpdateChauffeur, useDeleteChauffeur } from '@/hooks/useChauffeurs';
import { useStations, useCreateStation, useUpdateStation, useDeleteStation } from '@/hooks/useStations';

type ReferentialType = 'sites' | 'structures' | 'chauffeurs' | 'prestataires' | 'stations';

interface ReferentialItem {
  id: string;
  value: string;
  parentId?: string;
}

const referentialConfig: Record<ReferentialType, { label: string; icon: React.ElementType; hasParent?: boolean; parentLabel?: string }> = {
  sites: { label: 'Sites', icon: MapPin },
  structures: { label: 'Structures', icon: Building2, hasParent: true, parentLabel: 'Site' },
  chauffeurs: { label: 'Chauffeurs', icon: Users },
  prestataires: { label: 'Prestataires', icon: Wrench },
  stations: { label: 'Stations', icon: Fuel },
};

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<ReferentialType>('sites');
  const [editingItem, setEditingItem] = useState<ReferentialItem | null>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemParent, setNewItemParent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { isAdmin } = useUserRole();

  // Hooks pour les données
  const { data: sites = [], isLoading: sitesLoading } = useSites();
  const { data: structures = [], isLoading: structuresLoading } = useStructures();
  const { data: chauffeurs = [], isLoading: chauffeursLoading } = useChauffeurs();
  const { data: prestataires = [], isLoading: prestatairesLoading } = usePrestataires();
  const { data: stations = [], isLoading: stationsLoading } = useStations();

  // Mutations
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  const deleteSite = useDeleteSite();
  const createStructure = useCreateStructure();
  const updateStructure = useUpdateStructure();
  const deleteStructure = useDeleteStructure();
  const createChauffeur = useCreateChauffeur();
  const updateChauffeur = useUpdateChauffeur();
  const deleteChauffeur = useDeleteChauffeur();
  const createPrestataire = useCreatePrestataire();
  const updatePrestataire = useUpdatePrestataire();
  const deletePrestataire = useDeletePrestataire();
  const createStation = useCreateStation();
  const updateStation = useUpdateStation();
  const deleteStation = useDeleteStation();

  const currentConfig = referentialConfig[activeTab];
  
  const getCurrentItems = (): ReferentialItem[] => {
    switch (activeTab) {
      case 'sites':
        return sites.map(s => ({ id: s.id, value: s.nom }));
      case 'structures':
        return structures.map(s => ({ id: s.id, value: s.nom, parentId: s.site_id || undefined }));
      case 'chauffeurs':
        return chauffeurs.map(c => ({ id: c.id, value: `${c.prenom || ''} ${c.nom}`.trim() }));
      case 'prestataires':
        return prestataires.map(p => ({ id: p.id, value: p.nom }));
      case 'stations':
        return stations.map(s => ({ id: s.id, value: s.nom }));
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();
  const isLoading = sitesLoading || structuresLoading || chauffeursLoading || prestatairesLoading || stationsLoading;

  const handleAdd = async () => {
    if (!newItemValue.trim()) return;
    
    try {
      switch (activeTab) {
        case 'sites':
          await createSite.mutateAsync({ nom: newItemValue.trim() });
          break;
        case 'structures':
          await createStructure.mutateAsync({ nom: newItemValue.trim(), site_id: newItemParent || null });
          break;
        case 'chauffeurs':
          await createChauffeur.mutateAsync({ nom: newItemValue.trim() });
          break;
        case 'prestataires':
          await createPrestataire.mutateAsync({ nom: newItemValue.trim() });
          break;
        case 'stations':
          await createStation.mutateAsync({ nom: newItemValue.trim() });
          break;
      }
      setNewItemValue('');
      setNewItemParent('');
      setIsAdding(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleEdit = (item: ReferentialItem) => {
    setEditingItem(item);
    setNewItemValue(item.value);
    setNewItemParent(item.parentId || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !newItemValue.trim()) return;

    try {
      switch (activeTab) {
        case 'sites':
          await updateSite.mutateAsync({ id: editingItem.id, nom: newItemValue.trim() });
          break;
        case 'structures':
          await updateStructure.mutateAsync({ id: editingItem.id, nom: newItemValue.trim(), site_id: newItemParent || null });
          break;
        case 'chauffeurs':
          await updateChauffeur.mutateAsync({ id: editingItem.id, nom: newItemValue.trim() });
          break;
        case 'prestataires':
          await updatePrestataire.mutateAsync({ id: editingItem.id, nom: newItemValue.trim() });
          break;
        case 'stations':
          await updateStation.mutateAsync({ id: editingItem.id, nom: newItemValue.trim() });
          break;
      }
      setEditingItem(null);
      setNewItemValue('');
      setNewItemParent('');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      switch (activeTab) {
        case 'sites':
          await deleteSite.mutateAsync(id);
          break;
        case 'structures':
          await deleteStructure.mutateAsync(id);
          break;
        case 'chauffeurs':
          await deleteChauffeur.mutateAsync(id);
          break;
        case 'prestataires':
          await deletePrestataire.mutateAsync(id);
          break;
        case 'stations':
          await deleteStation.mutateAsync(id);
          break;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewItemValue('');
    setNewItemParent('');
    setIsAdding(false);
  };

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

      <Tabs defaultValue="referentiels" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="referentiels">Référentiels</TabsTrigger>
          {isAdmin && <TabsTrigger value="users"><Shield className="w-4 h-4 mr-2" />Utilisateurs</TabsTrigger>}
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="referentiels">
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
                  const count = currentItems.length;

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
                          {sites.map(s => (
                            <option key={s.id} value={s.id}>{s.nom}</option>
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
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
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

                  {!isLoading && currentItems.length === 0 && (
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
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Appearance Settings Component
function AppearanceSettings() {
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ];

  const colorOptions: { value: ColorScheme; label: string; color: string }[] = [
    { value: 'blue', label: 'Bleu', color: 'hsl(215, 80%, 45%)' },
    { value: 'green', label: 'Vert', color: 'hsl(145, 65%, 40%)' },
    { value: 'orange', label: 'Orange', color: 'hsl(25, 95%, 50%)' },
    { value: 'purple', label: 'Violet', color: 'hsl(270, 70%, 50%)' },
    { value: 'red', label: 'Rouge', color: 'hsl(0, 75%, 50%)' },
    { value: 'teal', label: 'Turquoise', color: 'hsl(175, 70%, 40%)' },
  ];

  return (
    <div className="card-elevated p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        Apparence
      </h3>
      
      {/* Theme Selection */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Thème</Label>
        <div className="flex gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                  theme === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{option.label}</span>
                {theme === option.value && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Scheme Selection */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Couleur d'accent</Label>
        <div className="flex flex-wrap gap-3">
          {colorOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setColorScheme(option.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                colorScheme === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: option.color }}
              />
              <span className="text-sm">{option.label}</span>
              {colorScheme === option.value && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// System Settings Component
function SystemSettings() {
  return (
    <div className="card-elevated p-6">
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
  );
}
