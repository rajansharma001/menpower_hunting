import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function fileDbPlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  const dbFilePath = path.join(dataDir, 'db.json');

  const ensureDbFile = () => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(
        dbFilePath,
        JSON.stringify(
          {
            agencies: [],
            visits: [],
            opportunities: [],
            costs: [],
            documents: [],
            payment_terms: [],
            verification_items: [],
            follow_ups: []
          },
          null,
          2
        ),
        'utf-8'
      );
    }
  };

  const handleDbApi = (req: any, res: any, next: any) => {
    const url = req.url || '';
    if (url === '/api/db' || url.startsWith('/api/db?')) {
      ensureDbFile();

      if (req.method === 'GET') {
        try {
          const content = fs.readFileSync(dbFilePath, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(content);
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            // Verify valid JSON
            const parsed = JSON.parse(body);
            fs.writeFileSync(dbFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, path: dbFilePath }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }
    next();
  };

  return {
    name: 'vite-plugin-file-db',
    configureServer(server) {
      server.middlewares.use(handleDbApi);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleDbApi);
    }
  };
}
