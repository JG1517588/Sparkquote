import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function client() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars:', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey });
    throw new Error('Supabase environment variables are missing');
  }
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

export default async function handler(req: any, res: any) {
  console.log('API called:', req.method);
  
  try {
    // POST: 保存报价单
    if (req.method === 'POST') {
      console.log('POST request received');
      
      const { quote } = req.body;
      console.log('Quote data received:', !!quote);
      
      if (!quote || typeof quote !== 'object' || JSON.stringify(quote).length > 100_000) {
        return res.status(400).json({ error: 'Invalid quote' });
      }
      
      const token = randomBytes(24).toString('base64url');
      console.log('Generated token:', token);
      
      const { error } = await client()
        .from('shares')
        .insert({ 
          share_id: token,
          job_data: quote,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Quote saved successfully');
      return res.status(201).json({ token });
    }
    
    // GET: 获取报价单
    if (req.method === 'GET') {
      const token = typeof req.query?.token === 'string' ? req.query.token : '';
      console.log('GET request, token:', token);
      
      if (!token) {
        return res.status(400).json({ error: 'Missing token' });
      }
      
      const { data, error } = await client()
        .from('shares')
        .select('job_data, expires_at')
        .eq('share_id', token)
        .maybeSingle();
      
      if (error) {
        console.error('Supabase select error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('Quote not found for token:', token);
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        console.log('Quote expired for token:', token);
        return res.status(404).json({ error: 'Quote expired' });
      }
      
      console.log('Quote found successfully');
      return res.status(200).json({ quote: data.job_data });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Quote API error:', error);
    return res.status(500).json({ error: 'Quote service unavailable', details: error.message });
  }
}
