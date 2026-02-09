export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          message: string
          priority: string
          status: string
          type: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          message: string
          priority?: string
          status?: string
          type: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          message?: string
          priority?: string
          status?: string
          type?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      chauffeurs: {
        Row: {
          actif: boolean
          created_at: string
          email: string | null
          id: string
          nom: string
          permis: string | null
          prenom: string | null
          site_id: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nom: string
          permis?: string | null
          prenom?: string | null
          site_id?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          permis?: string | null
          prenom?: string | null
          site_id?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chauffeurs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          categorie: Database["public"]["Enums"]["expense_category"]
          created_at: string
          created_by: string | null
          date: string
          id: string
          lie_a: Database["public"]["Enums"]["expense_link"]
          mode_paiement: Database["public"]["Enums"]["payment_method"]
          montant: number
          numero_facture: string | null
          observations: string | null
          prestataire_id: string | null
          reference_ot_ticket: string | null
          vehicle_id: string
        }
        Insert: {
          categorie: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          lie_a?: Database["public"]["Enums"]["expense_link"]
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant: number
          numero_facture?: string | null
          observations?: string | null
          prestataire_id?: string | null
          reference_ot_ticket?: string | null
          vehicle_id: string
        }
        Update: {
          categorie?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          lie_a?: Database["public"]["Enums"]["expense_link"]
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant?: number
          numero_facture?: string | null
          observations?: string | null
          prestataire_id?: string | null
          reference_ot_ticket?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "prestataires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_entries: {
        Row: {
          consommation: number | null
          cout_km: number | null
          created_at: string
          created_by: string | null
          date: string
          distance: number | null
          id: string
          km_compteur: number
          km_precedent: number
          litres: number
          mode_paiement: Database["public"]["Enums"]["payment_method"]
          montant: number
          observations: string | null
          station_id: string | null
          vehicle_id: string
        }
        Insert: {
          consommation?: number | null
          cout_km?: number | null
          created_at?: string
          created_by?: string | null
          date?: string
          distance?: number | null
          id?: string
          km_compteur: number
          km_precedent?: number
          litres: number
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant: number
          observations?: string | null
          station_id?: string | null
          vehicle_id: string
        }
        Update: {
          consommation?: number | null
          cout_km?: number | null
          created_at?: string
          created_by?: string | null
          date?: string
          distance?: number | null
          id?: string
          km_compteur?: number
          km_precedent?: number
          litres?: number
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant?: number
          observations?: string | null
          station_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_entries_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_entries_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      gestionnaires: {
        Row: {
          actif: boolean
          created_at: string
          date_affectation: string
          id: string
          observations: string | null
          profile_id: string
          site_id: string | null
          structure_id: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          date_affectation?: string
          id?: string
          observations?: string | null
          profile_id: string
          site_id?: string | null
          structure_id?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          date_affectation?: string
          id?: string
          observations?: string | null
          profile_id?: string
          site_id?: string | null
          structure_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gestionnaires_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gestionnaires_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gestionnaires_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["id"]
          },
        ]
      }
      prestataires: {
        Row: {
          actif: boolean
          adresse: string | null
          created_at: string
          email: string | null
          id: string
          nom: string
          specialite: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean
          adresse?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom: string
          specialite?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean
          adresse?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          specialite?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          actif: boolean | null
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nom: string
          prenom: string | null
          telephone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          nom: string
          prenom?: string | null
          telephone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nom?: string
          prenom?: string | null
          telephone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      repair_tickets: {
        Row: {
          chauffeur_id: string | null
          created_at: string
          created_by: string | null
          date_demande: string
          id: string
          km: number | null
          numero: string
          observations: string | null
          prestataire_id: string | null
          priorite: Database["public"]["Enums"]["ticket_priority"]
          statut: Database["public"]["Enums"]["ticket_status"]
          symptome: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          chauffeur_id?: string | null
          created_at?: string
          created_by?: string | null
          date_demande?: string
          id?: string
          km?: number | null
          numero?: string
          observations?: string | null
          prestataire_id?: string | null
          priorite?: Database["public"]["Enums"]["ticket_priority"]
          statut?: Database["public"]["Enums"]["ticket_status"]
          symptome: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          chauffeur_id?: string | null
          created_at?: string
          created_by?: string | null
          date_demande?: string
          id?: string
          km?: number | null
          numero?: string
          observations?: string | null
          prestataire_id?: string | null
          priorite?: Database["public"]["Enums"]["ticket_priority"]
          statut?: Database["public"]["Enums"]["ticket_status"]
          symptome?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_tickets_chauffeur_id_fkey"
            columns: ["chauffeur_id"]
            isOneToOne: false
            referencedRelation: "chauffeurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_tickets_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "prestataires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_tickets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_maintenance: {
        Row: {
          chauffeur_id: string | null
          commentaire: string | null
          created_at: string
          created_by: string | null
          date_rdv: string
          heure: string
          id: string
          prestataire_id: string | null
          statut_rdv: Database["public"]["Enums"]["rdv_status"]
          type_action: Database["public"]["Enums"]["action_type"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          chauffeur_id?: string | null
          commentaire?: string | null
          created_at?: string
          created_by?: string | null
          date_rdv: string
          heure: string
          id?: string
          prestataire_id?: string | null
          statut_rdv?: Database["public"]["Enums"]["rdv_status"]
          type_action: Database["public"]["Enums"]["action_type"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          chauffeur_id?: string | null
          commentaire?: string | null
          created_at?: string
          created_by?: string | null
          date_rdv?: string
          heure?: string
          id?: string
          prestataire_id?: string | null
          statut_rdv?: Database["public"]["Enums"]["rdv_status"]
          type_action?: Database["public"]["Enums"]["action_type"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_maintenance_chauffeur_id_fkey"
            columns: ["chauffeur_id"]
            isOneToOne: false
            referencedRelation: "chauffeurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_maintenance_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "prestataires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          adresse: string | null
          created_at: string
          id: string
          nom: string
          updated_at: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          id?: string
          nom: string
          updated_at?: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string
          id?: string
          nom?: string
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      stations: {
        Row: {
          adresse: string | null
          created_at: string
          id: string
          nom: string
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          id?: string
          nom: string
        }
        Update: {
          adresse?: string | null
          created_at?: string
          id?: string
          nom?: string
        }
        Relationships: []
      }
      structures: {
        Row: {
          created_at: string
          id: string
          nom: string
          site_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nom: string
          site_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
          site_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "structures_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_assignment_history: {
        Row: {
          affectataire: string
          affectataire_type: Database["public"]["Enums"]["affectataire_type"]
          created_at: string
          created_by: string | null
          date_debut: string
          date_fin: string | null
          id: string
          observations: string | null
          vehicle_id: string
        }
        Insert: {
          affectataire: string
          affectataire_type: Database["public"]["Enums"]["affectataire_type"]
          created_at?: string
          created_by?: string | null
          date_debut?: string
          date_fin?: string | null
          id?: string
          observations?: string | null
          vehicle_id: string
        }
        Update: {
          affectataire?: string
          affectataire_type?: Database["public"]["Enums"]["affectataire_type"]
          created_at?: string
          created_by?: string | null
          date_debut?: string
          date_fin?: string | null
          id?: string
          observations?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_assignment_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          affectataire: string | null
          affectataire_email: string | null
          affectataire_type:
            | Database["public"]["Enums"]["affectataire_type"]
            | null
          annee: number | null
          categorie: string | null
          chauffeur_referent_id: string | null
          created_at: string
          date_mise_en_service: string | null
          energie: Database["public"]["Enums"]["fuel_type"]
          fin_assurance: string | null
          fin_ct: string | null
          fin_gpl: string | null
          gestionnaire_id: string | null
          id: string
          image_url: string | null
          immatriculation: string
          marque: string
          modele: string
          observations: string | null
          site_id: string | null
          statut: Database["public"]["Enums"]["vehicle_status"]
          structure_id: string | null
          updated_at: string
          vignette_annee: number | null
          vin: string | null
        }
        Insert: {
          affectataire?: string | null
          affectataire_email?: string | null
          affectataire_type?:
            | Database["public"]["Enums"]["affectataire_type"]
            | null
          annee?: number | null
          categorie?: string | null
          chauffeur_referent_id?: string | null
          created_at?: string
          date_mise_en_service?: string | null
          energie?: Database["public"]["Enums"]["fuel_type"]
          fin_assurance?: string | null
          fin_ct?: string | null
          fin_gpl?: string | null
          gestionnaire_id?: string | null
          id?: string
          image_url?: string | null
          immatriculation: string
          marque: string
          modele: string
          observations?: string | null
          site_id?: string | null
          statut?: Database["public"]["Enums"]["vehicle_status"]
          structure_id?: string | null
          updated_at?: string
          vignette_annee?: number | null
          vin?: string | null
        }
        Update: {
          affectataire?: string | null
          affectataire_email?: string | null
          affectataire_type?:
            | Database["public"]["Enums"]["affectataire_type"]
            | null
          annee?: number | null
          categorie?: string | null
          chauffeur_referent_id?: string | null
          created_at?: string
          date_mise_en_service?: string | null
          energie?: Database["public"]["Enums"]["fuel_type"]
          fin_assurance?: string | null
          fin_ct?: string | null
          fin_gpl?: string | null
          gestionnaire_id?: string | null
          id?: string
          image_url?: string | null
          immatriculation?: string
          marque?: string
          modele?: string
          observations?: string | null
          site_id?: string | null
          statut?: Database["public"]["Enums"]["vehicle_status"]
          structure_id?: string | null
          updated_at?: string
          vignette_annee?: number | null
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_chauffeur_referent_id_fkey"
            columns: ["chauffeur_referent_id"]
            isOneToOne: false
            referencedRelation: "chauffeurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_gestionnaire_id_fkey"
            columns: ["gestionnaire_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          categorie: string | null
          created_at: string
          created_by: string | null
          date_entree: string | null
          date_fin_garantie: string | null
          date_ouverture: string
          date_rdv: string | null
          date_sortie: string | null
          description: string
          garantie: boolean
          id: string
          jours_immobilisation: number | null
          montant_devis: number | null
          montant_facture: number | null
          numero: string
          prestataire_id: string | null
          statut: Database["public"]["Enums"]["work_order_status"]
          ticket_id: string | null
          type: Database["public"]["Enums"]["work_order_type"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          categorie?: string | null
          created_at?: string
          created_by?: string | null
          date_entree?: string | null
          date_fin_garantie?: string | null
          date_ouverture?: string
          date_rdv?: string | null
          date_sortie?: string | null
          description: string
          garantie?: boolean
          id?: string
          jours_immobilisation?: number | null
          montant_devis?: number | null
          montant_facture?: number | null
          numero?: string
          prestataire_id?: string | null
          statut?: Database["public"]["Enums"]["work_order_status"]
          ticket_id?: string | null
          type?: Database["public"]["Enums"]["work_order_type"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          categorie?: string | null
          created_at?: string
          created_by?: string | null
          date_entree?: string | null
          date_fin_garantie?: string | null
          date_ouverture?: string
          date_rdv?: string | null
          date_sortie?: string | null
          description?: string
          garantie?: boolean
          id?: string
          jours_immobilisation?: number | null
          montant_devis?: number | null
          montant_facture?: number | null
          numero?: string
          prestataire_id?: string | null
          statut?: Database["public"]["Enums"]["work_order_status"]
          ticket_id?: string | null
          type?: Database["public"]["Enums"]["work_order_type"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "prestataires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "repair_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_type:
        | "Dépôt"
        | "Récupération"
        | "Diagnostic"
        | "Devis"
        | "Réparation"
      affectataire_type:
        | "Chauffeur"
        | "Cadre"
        | "Parc auto de direction"
        | "Parc auto centrale"
      expense_category:
        | "Pièces"
        | "Main d'œuvre"
        | "Diagnostic"
        | "Remorquage"
        | "Divers"
      expense_link: "OT" | "Ticket" | "Libre"
      fuel_type: "Diesel" | "Essence" | "GPL"
      payment_method: "Cash" | "Carte" | "Bon" | "Virement"
      rdv_status: "Planifié" | "En cours" | "Terminé" | "Annulé"
      ticket_priority: "Urgente" | "Haute" | "Normale"
      ticket_status: "Ouvert" | "En cours" | "Clôturé"
      user_role: "admin" | "gestionnaire" | "utilisateur"
      vehicle_status: "Actif" | "Immobilisé" | "Sorti"
      work_order_status: "Ouvert" | "En cours" | "Clôturé"
      work_order_type: "Préventif" | "Correctif"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_type: [
        "Dépôt",
        "Récupération",
        "Diagnostic",
        "Devis",
        "Réparation",
      ],
      affectataire_type: [
        "Chauffeur",
        "Cadre",
        "Parc auto de direction",
        "Parc auto centrale",
      ],
      expense_category: [
        "Pièces",
        "Main d'œuvre",
        "Diagnostic",
        "Remorquage",
        "Divers",
      ],
      expense_link: ["OT", "Ticket", "Libre"],
      fuel_type: ["Diesel", "Essence", "GPL"],
      payment_method: ["Cash", "Carte", "Bon", "Virement"],
      rdv_status: ["Planifié", "En cours", "Terminé", "Annulé"],
      ticket_priority: ["Urgente", "Haute", "Normale"],
      ticket_status: ["Ouvert", "En cours", "Clôturé"],
      user_role: ["admin", "gestionnaire", "utilisateur"],
      vehicle_status: ["Actif", "Immobilisé", "Sorti"],
      work_order_status: ["Ouvert", "En cours", "Clôturé"],
      work_order_type: ["Préventif", "Correctif"],
    },
  },
} as const
