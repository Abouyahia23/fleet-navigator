export interface Vehicle {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  energie: 'Diesel' | 'Essence' | 'GPL';
  categorie: string;
  annee?: number;
  vin?: string;
  structure: string;
  site: string;
  affectataire: string;
  affectataireEmail?: string;
  gestionnaireParc: string;
  gestionnaireEmail?: string;
  chauffeurReferent?: string;
  statut: 'Actif' | 'Immobilisé' | 'Sorti';
  dateMiseEnService?: string;
  observations?: string;
  finAssurance?: string;
  finCT?: string;
  finGPL?: string;
  vignetteAnnee?: number;
}

export interface FuelEntry {
  id: string;
  date: string;
  vehicleId: string;
  immatriculation: string;
  kmCompteur: number;
  kmPrecedent: number;
  distance: number;
  litres: number;
  montant: number;
  station: string;
  modePaiement: 'Cash' | 'Carte' | 'Bon';
  observations?: string;
  consommation: number;
  coutKm: number;
}

export interface RepairTicket {
  id: string;
  dateDemande: string;
  site: string;
  structure: string;
  vehicleId: string;
  immatriculation: string;
  km: number;
  symptome: string;
  priorite: 'Urgente' | 'Haute' | 'Normale';
  statut: 'Ouvert' | 'En cours' | 'Clôturé';
  chauffeur?: string;
  prestataire?: string;
  observations?: string;
}

export interface WorkOrder {
  id: string;
  ticketId?: string;
  dateOuverture: string;
  vehicleId: string;
  immatriculation: string;
  type: 'Préventif' | 'Correctif';
  categorie: string;
  prestataire: string;
  description: string;
  dateRDV?: string;
  dateEntree?: string;
  dateSortie?: string;
  statut: 'Ouvert' | 'En cours' | 'Clôturé';
  montantDevis?: number;
  montantFacture?: number;
  garantie: boolean;
  dateFinGarantie?: string;
  joursImmobilisation?: number;
}

export interface Expense {
  id: string;
  date: string;
  vehicleId: string;
  immatriculation: string;
  lieLa: 'OT' | 'Ticket' | 'Libre';
  referenceOTTicket?: string;
  categorie: 'Pièces' | 'Main d\'œuvre' | 'Diagnostic' | 'Remorquage' | 'Divers';
  prestataire: string;
  montant: number;
  numeroFacture?: string;
  modePaiement: 'Cash' | 'Carte' | 'Virement';
  observations?: string;
}

export interface ScheduledMaintenance {
  id: string;
  dateRDV: string;
  heure: string;
  site: string;
  structure: string;
  vehicleId: string;
  immatriculation: string;
  chauffeur: string;
  prestataire: string;
  typeAction: 'Dépôt' | 'Récupération' | 'Diagnostic' | 'Devis' | 'Réparation';
  statutRDV: 'Planifié' | 'En cours' | 'Terminé' | 'Annulé';
  commentaire?: string;
}

export interface User {
  id: string;
  nom: string;
  email: string;
  role: 'gestionnaire' | 'utilisateur';
}

export interface Gestionnaire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  site: string;
  structure: string;
  actif: boolean;
  dateAffectation: string;
  observations?: string;
}

export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
  requiresGestionnaire?: boolean;
};
