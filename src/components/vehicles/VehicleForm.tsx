import { useState, useEffect } from 'react';
import { Save, RotateCcw, ArrowLeft, Car, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Vehicle } from '@/types/fleet';
import { marques, modelesByMarque, sites, structures, chauffeurs } from '@/data/mockData';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSave: (vehicle: Vehicle) => void;
  onCancel: () => void;
}

export function VehicleForm({ vehicle, onSave, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    immatriculation: '',
    marque: '',
    modele: '',
    energie: 'Diesel',
    categorie: '',
    annee: undefined,
    vin: '',
    structure: '',
    site: '',
    affectataire: '',
    gestionnaireParc: '',
    chauffeurReferent: '',
    statut: 'Actif',
    dateMiseEnService: '',
    observations: '',
    imageUrl: '',
    ...vehicle,
  });
  const [imagePreview, setImagePreview] = useState<string>(vehicle?.imageUrl || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableModeles, setAvailableModeles] = useState<string[]>([]);

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
    if (!formData.site) newErrors.site = 'Site requis';
    if (!formData.structure) newErrors.structure = 'Structure requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData as Vehicle);
    }
  };

  const handleReset = () => {
    setFormData({
      immatriculation: '',
      marque: '',
      modele: '',
      energie: 'Diesel',
      categorie: '',
      structure: '',
      site: '',
      affectataire: '',
      gestionnaireParc: '',
      statut: 'Actif',
      imageUrl: '',
    });
    setErrors({});
    setImagePreview('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    setImagePreview('');
  };

  const categories = ['Pick-up', 'Utilitaire', 'SUV', 'Berline', 'Camion', 'Minibus'];
  const energies = ['Diesel', 'Essence', 'GPL'];
  const statuts = ['Actif', 'Immobilisé', 'Sorti'];

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
          <div>
            <h2 className="text-xl font-bold">
              {vehicle ? 'Modifier le Véhicule' : 'Nouveau Véhicule'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {vehicle ? `ID: ${vehicle.id}` : 'Remplissez les informations du véhicule'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image du Véhicule */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Photo du Véhicule
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image Preview */}
              <div className="relative w-full md:w-64 h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Véhicule"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview('')}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    >
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

              {/* Upload Options */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Télécharger une image
                  </label>
                  <label className="btn-secondary cursor-pointer inline-flex">
                    <Upload className="w-4 h-4" />
                    Choisir un fichier
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG ou WebP (max 5 Mo)
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="input-field"
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Zone A - Identification */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Immatriculation <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.immatriculation}
                  onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                  className={`input-field ${errors.immatriculation ? 'border-destructive ring-destructive' : ''}`}
                  placeholder="00123-116-16"
                />
                {errors.immatriculation && (
                  <p className="text-xs text-destructive mt-1">{errors.immatriculation}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Marque <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.marque}
                  onChange={(e) => setFormData({ ...formData, marque: e.target.value, modele: '' })}
                  className={`input-field ${errors.marque ? 'border-destructive' : ''}`}
                >
                  <option value="">Sélectionner...</option>
                  {marques.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Modèle <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.modele}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                  className={`input-field ${errors.modele ? 'border-destructive' : ''}`}
                  disabled={!formData.marque}
                >
                  <option value="">Sélectionner...</option>
                  {availableModeles.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Énergie</label>
                <select
                  value={formData.energie}
                  onChange={(e) => setFormData({ ...formData, energie: e.target.value as Vehicle['energie'] })}
                  className="input-field"
                >
                  {energies.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Catégorie</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Année</label>
                <input
                  type="number"
                  value={formData.annee || ''}
                  onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) || undefined })}
                  className="input-field"
                  placeholder="2024"
                  min="1990"
                  max="2030"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1.5">VIN (Optionnel)</label>
                <input
                  type="text"
                  value={formData.vin || ''}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  className="input-field"
                  placeholder="Numéro de châssis"
                />
              </div>
            </div>
          </section>

          {/* Zone B - Organisation */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Organisation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Structure <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.structure}
                  onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                  className={`input-field ${errors.structure ? 'border-destructive' : ''}`}
                >
                  <option value="">Sélectionner...</option>
                  {structures.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Site <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  className={`input-field ${errors.site ? 'border-destructive' : ''}`}
                >
                  <option value="">Sélectionner...</option>
                  {sites.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Affectataire</label>
                <input
                  type="text"
                  value={formData.affectataire}
                  onChange={(e) => setFormData({ ...formData, affectataire: e.target.value })}
                  className="input-field"
                  placeholder="Nom de l'affectataire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Gestionnaire Parc</label>
                <input
                  type="text"
                  value={formData.gestionnaireParc}
                  onChange={(e) => setFormData({ ...formData, gestionnaireParc: e.target.value })}
                  className="input-field"
                  placeholder="Nom du gestionnaire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Chauffeur Référent</label>
                <select
                  value={formData.chauffeurReferent}
                  onChange={(e) => setFormData({ ...formData, chauffeurReferent: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sélectionner...</option>
                  {chauffeurs.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Zone C - Statut */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Statut
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Statut Véhicule</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value as Vehicle['statut'] })}
                  className="input-field"
                >
                  {statuts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Date Mise en Service</label>
                <input
                  type="date"
                  value={formData.dateMiseEnService || ''}
                  onChange={(e) => setFormData({ ...formData, dateMiseEnService: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-1.5">Observations</label>
                <textarea
                  value={formData.observations || ''}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Notes diverses..."
                />
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
