import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// 1. Replace these with your NEW Supabase project's credentials
// You can find these in your Supabase Dashboard under Project Settings -> API
const NEW_SUPABASE_URL = 'https://gpjshlbgztwcdmitgrto.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'sb_publishable_RMvQmvEREGmkwEnIjhxIsQ_X3glXJCQ';

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

async function importData() {
    try {
        console.log('Loading exported data...');
        const rawData = fs.readFileSync('company_payments_export.json', 'utf-8');
        const payments = JSON.parse(rawData);

        console.log(`Found ${payments.length} records. Filtering strict schema columns...`);

        // Strip out the unused fields that exist in the old DB but not in the new one
        const cleanedPayments = payments.map(p => ({
            id: p.id,
            created_at: p.created_at,
            company_name: p.company_name,
            total_amount: p.total_amount || 0,
            pending_amount: p.pending_amount || 0,
            status: p.status,
            priority: p.priority,
            expected_date: p.expected_date,
            contact_number: p.contact_number,
            remarks: p.remarks,
            bank_statement_url: p.bank_statement_url
        }));

        const { data, error } = await supabase
            .from('company_payments')
            .insert(cleanedPayments)

        if (error) {
            console.error('❌ Error importing data:', error.message, error.details);
            return;
        }

        console.log('✅ Import completed successfully!');

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('❌ Could not find company_payments_export.json. Make sure the file is in the same directory as this script.');
        } else {
            console.error('❌ Unexpected Error:', error);
        }
    }
}


importData();
