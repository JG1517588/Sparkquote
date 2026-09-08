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

// ==========================================
// 🛠️ 电工计算数学公式（保留）
// ==========================================
function calculateElectricalMetrics(input: any) {
  const { 
    labourHours = 0, labourRate = 0, callOutFee = 0, 
    materials = [], markupPercent = 0 
  } = input;

  const totalMaterials = materials.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.price) * parseInt(item.qty));
  }, 0);

  const totalLabour = parseFloat(labourHours) * parseFloat(labourRate);
  const baseCost = totalMaterials + totalLabour + parseFloat(callOutFee);
  const costWithMarkup = baseCost * (1 + (parseFloat(markupPercent) / 100));
  const gst = costWithMarkup * 0.10;
  const total = costWithMarkup + gst;

  return {
    total_materials: totalMaterials.toFixed(2),
    total_labour: totalLabour.toFixed(2),
    total_cost_with_markup: costWithMarkup.toFixed(2),
    gst_amount: gst.toFixed(2),
    total_amount: total.toFixed(2)
  };
}
// ==========================================

export default async function handler(req: any, res: any) {
  console.log('API called:', req.method);
  
  try {
    // POST: 保存报价单
    if (req.method === 'POST') {
      console.log('POST request received');
      
      // 1. 接收前端传来的数据（包括顾客信息）
      const { quote, customerName, customerPhone, customerEmail } = req.body;
      console.log('Quote data received:', !!quote);
      console.log('Customer info:', { customerName, customerPhone, customerEmail });
      
      if (!quote || typeof quote !== 'object' || JSON.stringify(quote).length > 100_000) {
        return res.status(400).json({ error: 'Invalid quote' });
      }
      
      // 2. 简单的校验（顾客信息不能为空）
      if (!customerName || !customerPhone || !customerEmail) {
         return res.status(400).json({ error: 'Please provide customer contact details' });
      }
      
      // 3. 计算总价等数据
      const calculatedMetrics = calculateElectricalMetrics(quote);
      console.log('Calculated Metrics:', calculatedMetrics);

      // 4. 生成唯一 Token
      const token = randomBytes(24).toString('base64url');
      console.log('Generated token:', token);
      
      // 5. 插入数据库
      const { error } = await client()
        .from('shares')
        .insert({ 
          share_id: token,
          job_data: quote,
          customer_name: customerName,      // ✅ 存入顾客名字
          customer_phone: customerPhone,    // ✅ 存入顾客电话
          customer_email: customerEmail,    // ✅ 存入顾客邮箱
          ...calculatedMetrics,             // 把计算出的 总价、GST 等 一并存入！
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
