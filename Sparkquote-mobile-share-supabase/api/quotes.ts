import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
function client() {
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase environment variables are missing');
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}
export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'POST') {
      const quote = req.body?.quote;
      if (!quote || typeof quote !== 'object' || JSON.stringify(quote).length > 100_000) return res.status(400).json({ error: 'Invalid quote' });
      const token = randomBytes(24).toString('base64url');
      const { error } = await client().from('shared_quotes').insert({ share_token: token, quote });
      if (error) throw error;
      return res.status(201).json({ token });
    }
    if (req.method === 'GET') {
      const token = typeof req.query?.token === 'string' ? req.query.token : '';
      if (!token) return res.status(400).json({ error: 'Missing token' });
      const { data, error } = await client().from('shared_quotes').select('quote, expires_at').eq('share_token', token).maybeSingle();
      if (error) throw error;
      if (!data || (data.expires_at && new Date(data.expires_at) < new Date())) return res.status(404).json({ error: 'Quote not found' });
      return res.status(200).json({ quote: data.quote });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Quote API error', error);
    return res.status(500).json({ error: 'Quote service unavailable' });
  }
}
