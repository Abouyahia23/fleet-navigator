import { useState, useEffect } from 'react';
import { Save, RotateCcw, ArrowLeft, Car, Upload, X, Image as ImageIcon, History } from 'lucide-react';
import { marques, modelesByMarque } from '@/data/mockData';
import { useSites } from '@/hooks/useSites';
import { useStructures } from '@/hooks/useStructures';
import { useChauffeurs } from '@/hooks/useChauffeurs';
import { useGestionnaires } from '@/hooks/useGestionnaires';
import { useAssignmentHistory, useCreateAssignment } from '@/hooks/useAssignmentHistory';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { uploadVehicleImage, deleteVehicleImage } from '@/lib/vehicleImageStorage';
import { toast } from 'sonner';
import type { TablesInsert } from '@/integrations/supabase/types';

type VehicleInsert = TablesInsert<'vehicles'>;

const AFFECTATAIRE_TYPES = ['Chauffeur', 'Cadre', 'Parc auto de direction', 'Parc auto centrale'] as const;
type AffectatireType = typeof AFFECTATAIRE_TYPES[number];

interface VehicleFormProps {
  vehicle?: any;
  onSave: (vehicle: any) => void;
  onCancel: () => void;
}

export function VehicleForm({ vehicle, onSave, onCancel }: VehicleFormProps) {
  const { data: sites = [] } = useSites();
  const { data: structures = [] } = useStructures();
  const { data: chauffeursList = [] } = useChauffeurs();
  const { data: gestionnaires = [] } = useGestionnaires(true);
  const { data: history = [] } = useAssignmentHistory(vehicle?.id);
  const createAssignment = useCreateAssignment();
  const { profileId } = useMyProfile();
  const { isAdmin } = useUserRole();

  const [formData, setFormData] = useState<Record<string, any>>({
    immatriculation: '',
    marque: '',
    modele: '',
    energie: 'Diesel',
    categorie: '',
    annee: undefined,
    vin: '',
    structure_id: '',
    site_id: '',
    affectataire: '',
    affectataire_type: '',
    gestionnaire_id: '',
    chauffeur_referent_id: '',
    statut: 'Actif',
    date_mise_en_service: '',
    observations: '',
    image_url: '',
    ...vehicle,
  });
  const [imagePreview, setImagePreview] = useState<string>(vehicle?.image_url || '');
  const [showHistory, setShowHistory] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableModeles, setAvailableModeles] = useState<string[]>([]);

  // Auto-set gestionnaire_id for gestionnaire role
  useEffect(() => {
    if (!isAdmin && profileId && !vehicle) {
      setFormData(prev => ({ ...prev, gestionnaire_id: profileId }));
    }
  }, [isAdmin, profileId, vehicle]);

  useEffect(() => {
    if (formData.marque) {
      setAvailableModeles(modelesByMarque[formData.marque] || []);
    } else {
      setAvailableModeles([]);
    }
  }, [formData.marque]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.immatriculation) newErrors.immatriculation = 'Immatriculation requise';
    if (!formData.marque) newErrors.marque = 'Marque requise';
    if (!formData.modele) newErrors.modele = 'Modèle requis';
    if (!formData.site_id) newErrors.site_id = 'Site requis';
    if (!formData.structure_id) newErrors.structure_id = 'Structure requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      let finalData = { ...formData };

      // Upload image to Storage if a new file was selected
      if (imageFile) {
        try {
          const vehicleId = vehicle?.id || crypto.randomUUID();
          if (!vehicle) finalData.id = vehicleId;
          // Delete old image if replacing
          if (vehicle?.image_url && !vehicle.image_url.startsWith('data:')) {
            await deleteVehicleImage(vehicle.image_url);
          }
          const publicUrl = await uploadVehicleImage(imageFile, vehicleId);
          finalData.image_url = publicUrl;
        } catch (err) {
          console.error('Error uploading image:', err);
          toast.error("Erreur lors de l'upload de l'image");
          return;
        }
      }

      // If affectataire changed, create history entry
      if (vehicle && finalData.affectataire && finalData.affectataire !== vehicle.affectataire && finalData.affectataire_type) {
        try {
          await createAssignment.mutateAsync({
            vehicle_id: vehicle.id,
            affectataire: finalData.affectataire,
            affectataire_type: finalData.affectataire_type as AffectatireType,
            date_debut: new Date().toISOString().split('T')[0],
          });
        } catch (err) {
          console.error('Error creating assignment history:', err);
        }
      }
      onSave(finalData);
    }
  };

  const handleReset = () => {
    setFormData({
      immatriculation: '',
      marque: '',
      modele: '',
      energie: 'Diesel',
      categorie: '',
      structure_id: '',
      site_id: '',
      affectataire: '',
      affectataire_type: '',
      gestionnaire_id: '',
      statut: 'Actif',
      image_url: '',
    });
    setErrors({});
    setImagePreview('');
  };

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image trop volumineuse (max 5 Mo)');
        return;
      }
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' });
    setImagePreview('');
  };

  const categories = ['Pick-up', 'Utilitaire', 'SUV', 'Berline', 'Camion', 'Minibus'];
  const energies = ['Diesel', 'Essence', 'GPL'];
  const statuts = ['Actif', 'Immobilisé', 'Sorti'];

  const activeGestionnaires = gestionnaires.filter(g => g.actif);

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </button>

      <div className="card-elevated p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <Car className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {vehicle ? 'Modifier le Véhicule' : 'Nouveau Véhicule'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {vehicle ? `Immatriculation: ${vehicle.immatriculation}` : 'Remplissez les informations du véhicule'}
            </p>
          </div>
          {vehicle && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary text-sm"
            >
              <History className="w-4 h-4" />
              Historique affectations
            </button>
          )}
        </div>

        {/* Assignment History */}
        {showHistory && vehicle && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Historique des Affectations
            </h3>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun historique d'affectation</p>
            ) : (
              <div className="space-y-2">
                {history.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <div>
                      <p className="font-medium">{h.affectataire}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.affectataire_type} • Du {h.date_debut}{h.date_fin ? ` au ${h.date_fin}` : ' (en cours)'}
                      </p>
                    </div>
                    {h.observations && (
                      <span className="text-xs text-muted-foreground">{h.observations}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image du Véhicule */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Photo du Véhicule
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-64 h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Véhicule" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune image</p>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Télécharger une image</label>
                  <label className="btn-secondary cursor-pointer inline-flex">
                    <Upload className="w-4 h-4" />
                    Choisir un fichier
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou WebP (max 5 Mo)</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">URL de l'image</label>
                  <input type="url" value={formData.image_url || ''} onChange={(e) => handleImageUrlChange(e.target.value)} className="input-field" placeholder="https://exemple.com/image.jpg" />
                </div>
              </div>
            </div>
          </section>

          {/* Zone A - Identification */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Immatriculation <span className="text-destructive">*</span></label>
                <input type="text" value={formData.immatriculation} onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })} className={`input-field ${errors.immatriculation ? 'border-destructive ring-destructive' : ''}`} placeholder="00123-116-16" />
                {errors.immatriculation && <p className="text-xs text-destructive mt-1">{errors.immatriculation}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Marque <span className="text-destructive">*</span></label>
                <select value={formData.marque} onChange={(e) => setFormData({ ...formData, marque: e.target.value, modele: '' })} className={`input-field ${errors.marque ? 'border-destructive' : ''}`}>
                  <option value="">Sélectionner...</option>
                  {marques.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Modèle <span className="text-destructive">*</span></label>
                <select value={formData.modele} onChange={(e) => setFormData({ ...formData, modele: e.target.value })} className={`input-field ${errors.modele ? 'border-destructive' : ''}`} disabled={!formData.marque}>
                  <option value="">Sélectionner...</option>
                  {availableModeles.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Énergie</label>
                <select value={formData.energie} onChange={(e) => setFormData({ ...formData, energie: e.target.value })} className="input-field">
                  {energies.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Catégorie</label>
                <select value={formData.categorie || ''} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} className="input-field">
                  <option value="">Sélectionner...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Année</label>
                <input type="number" value={formData.annee || ''} onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) || undefined })} className="input-field" placeholder="2024" min="1990" max="2030" />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1.5">VIN (Optionnel)</label>
                <input type="text" value={formData.vin || ''} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} className="input-field" placeholder="Numéro de châssis" />
              </div>
            </div>
          </section>

          {/* Zone B - Organisation */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Organisation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Structure <span className="text-destructive">*</span></label>
                <select value={formData.structure_id || ''} onChange={(e) => setFormData({ ...formData, structure_id: e.target.value || null })} className={`input-field ${errors.structure_id ? 'border-destructive' : ''}`}>
                  <option value="">Sélectionner...</option>
                  {structures.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                {errors.structure_id && <p className="text-xs text-destructive mt-1">{errors.structure_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Site <span className="text-destructive">*</span></label>
                <select value={formData.site_id || ''} onChange={(e) => setFormData({ ...formData, site_id: e.target.value || null })} className={`input-field ${errors.site_id ? 'border-destructive' : ''}`}>
                  <option value="">Sélectionner...</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                {errors.site_id && <p className="text-xs text-destructive mt-1">{errors.site_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Gestionnaire du Parc</label>
                <select
                  value={formData.gestionnaire_id || ''}
                  onChange={(e) => setFormData({ ...formData, gestionnaire_id: e.target.value || null })}
                  className="input-field"
                  disabled={!isAdmin}
                >
                  <option value="">Sélectionner...</option>
                  {activeGestionnaires.map(g => (
                    <option key={g.id} value={g.profile_id}>
                      {g.profile?.nom || ''} {g.profile?.prenom || ''}
                    </option>
                  ))}
                </select>
                {!isAdmin && <p className="text-xs text-muted-foreground mt-1">Assigné automatiquement</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Type d'affectataire</label>
                <select value={formData.affectataire_type || ''} onChange={(e) => setFormData({ ...formData, affectataire_type: e.target.value || null })} className="input-field">
                  <option value="">Sélectionner...</option>
                  {AFFECTATAIRE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Affectataire</label>
                {formData.affectataire_type === 'Chauffeur' ? (
                  <select value={formData.affectataire || ''} onChange={(e) => setFormData({ ...formData, affectataire: e.target.value })} className="input-field">
                    <option value="">Sélectionner...</option>
                    {chauffeursList.filter(c => c.actif).map(c => (
                      <option key={c.id} value={`${c.prenom || ''} ${c.nom}`.trim()}>
                        {c.prenom || ''} {c.nom}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={formData.affectataire || ''} onChange={(e) => setFormData({ ...formData, affectataire: e.target.value })} className="input-field" placeholder={
                    formData.affectataire_type === 'Cadre' ? 'Nom du cadre' :
                    formData.affectataire_type === 'Parc auto de direction' ? 'Direction concernée' :
                    formData.affectataire_type === 'Parc auto centrale' ? 'Parc auto centrale' :
                    "Nom de l'affectataire"
                  } />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Chauffeur Référent</label>
                <select value={formData.chauffeur_referent_id || ''} onChange={(e) => setFormData({ ...formData, chauffeur_referent_id: e.target.value || null })} className="input-field">
                  <option value="">Sélectionner...</option>
                  {chauffeursList.filter(c => c.actif).map(c => (
                    <option key={c.id} value={c.id}>{c.prenom || ''} {c.nom}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Zone C - Statut */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Statut</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Statut Véhicule</label>
                <select value={formData.statut} onChange={(e) => setFormData({ ...formData, statut: e.target.value })} className="input-field">
                  {statuts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date Mise en Service</label>
                <input type="date" value={formData.date_mise_en_service || ''} onChange={(e) => setFormData({ ...formData, date_mise_en_service: e.target.value })} className="input-field" />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-1.5">Observations</label>
                <textarea value={formData.observations || ''} onChange={(e) => setFormData({ ...formData, observations: e.target.value })} className="input-field min-h-[80px] resize-none" placeholder="Notes diverses..." />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            <button type="submit" className="btn-primary flex-1 sm:flex-none">
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
            <button type="button" onClick={handleReset} className="btn-secondary">
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary sm:ml-auto">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
