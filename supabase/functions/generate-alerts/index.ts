import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date();
    const alerts: Array<{
      vehicle_id: string;
      type: string;
      message: string;
      priority: string;
      due_date: string | null;
      status: string;
    }> = [];

    // 1. Scheduled maintenance in next 3 days
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    const { data: upcomingMaint } = await supabase
      .from('scheduled_maintenance')
      .select('id, vehicle_id, date_rdv, type_action, heure')
      .gte('date_rdv', now.toISOString().split('T')[0])
      .lte('date_rdv', in3Days.toISOString().split('T')[0])
      .eq('statut_rdv', 'Planifié');

    for (const m of upcomingMaint || []) {
      alerts.push({
        vehicle_id: m.vehicle_id,
        type: 'maintenance',
        message: `RDV ${m.type_action} prévu le ${m.date_rdv} à ${m.heure}`,
        priority: 'haute',
        due_date: m.date_rdv,
        status: 'active',
      });
    }

    // 2. Admin documents expiring in next 30 days
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);
    const { data: expiringDocs } = await supabase
      .from('admin_documents')
      .select('id, vehicle_id, type, date_expiration')
      .gte('date_expiration', now.toISOString().split('T')[0])
      .lte('date_expiration', in30Days.toISOString().split('T')[0]);

    for (const d of expiringDocs || []) {
      const daysLeft = Math.ceil((new Date(d.date_expiration!).getTime() - now.getTime()) / 86400000);
      alerts.push({
        vehicle_id: d.vehicle_id,
        type: 'document',
        message: `${d.type} expire dans ${daysLeft} jour(s) (${d.date_expiration})`,
        priority: daysLeft <= 7 ? 'urgente' : 'haute',
        due_date: d.date_expiration,
        status: 'active',
      });
    }

    // 3. Vehicle-level date fields (fin_assurance, fin_ct, fin_gpl)
    const { data: vehiclesExpiring } = await supabase
      .from('vehicles')
      .select('id, immatriculation, fin_assurance, fin_ct, fin_gpl')
      .or(`fin_assurance.lte.${in30Days.toISOString().split('T')[0]},fin_ct.lte.${in30Days.toISOString().split('T')[0]},fin_gpl.lte.${in30Days.toISOString().split('T')[0]}`);

    for (const v of vehiclesExpiring || []) {
      const fields = [
        { key: 'fin_assurance', label: 'Assurance' },
        { key: 'fin_ct', label: 'Contrôle technique' },
        { key: 'fin_gpl', label: 'GPL' },
      ];
      for (const f of fields) {
        const val = v[f.key as keyof typeof v] as string | null;
        if (val && val <= in30Days.toISOString().split('T')[0] && val >= now.toISOString().split('T')[0]) {
          const daysLeft = Math.ceil((new Date(val).getTime() - now.getTime()) / 86400000);
          alerts.push({
            vehicle_id: v.id,
            type: 'document',
            message: `${f.label} expire dans ${daysLeft} jour(s) (${val}) - ${v.immatriculation}`,
            priority: daysLeft <= 7 ? 'urgente' : 'haute',
            due_date: val,
            status: 'active',
          });
        }
      }
    }

    // 4. Urgent tickets open > 3 days
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const { data: urgentTickets } = await supabase
      .from('repair_tickets')
      .select('id, vehicle_id, numero, date_demande, symptome')
      .eq('priorite', 'Urgente')
      .in('statut', ['Ouvert', 'En cours'])
      .lte('date_demande', threeDaysAgo.toISOString().split('T')[0]);

    for (const t of urgentTickets || []) {
      const daysOpen = Math.ceil((now.getTime() - new Date(t.date_demande).getTime()) / 86400000);
      alerts.push({
        vehicle_id: t.vehicle_id,
        type: 'ticket',
        message: `Ticket urgent ${t.numero} ouvert depuis ${daysOpen} jours: ${t.symptome}`,
        priority: 'urgente',
        due_date: null,
        status: 'active',
      });
    }

    // Upsert: clear old auto-generated alerts and insert new ones
    // Delete existing active alerts to avoid duplicates
    await supabase
      .from('alerts')
      .delete()
      .eq('status', 'active')
      .in('type', ['maintenance', 'document', 'ticket']);

    if (alerts.length > 0) {
      const { error: insertError } = await supabase
        .from('alerts')
        .insert(alerts);

      if (insertError) {
        console.error('Error inserting alerts:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ success: true, alertsGenerated: alerts.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-alerts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
