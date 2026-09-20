import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const defaultDb = {
    agencies: [],
    visits: [],
    opportunities: [],
    costs: [],
    documents: [],
    payment_terms: [],
    verification_items: [],
    follow_ups: []
  };

  const tmpPath = path.join('/tmp', 'db.json');
  const localDataPath = path.join(process.cwd(), 'data', 'db.json');

  if (req.method === 'GET') {
    try {
      if (fs.existsSync(tmpPath)) {
        const content = fs.readFileSync(tmpPath, 'utf-8');
        return res.status(200).json(JSON.parse(content));
      }
      if (fs.existsSync(localDataPath)) {
        const content = fs.readFileSync(localDataPath, 'utf-8');
        return res.status(200).json(JSON.parse(content));
      }
      return res.status(200).json(defaultDb);
    } catch (e) {
      return res.status(200).json(defaultDb);
    }
  }

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      try {
        fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      } catch (err) {
        console.warn('Could not write to /tmp on serverless', err);
      }
      return res.status(200).json({ success: true, count: data?.opportunities?.length || 0 });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
