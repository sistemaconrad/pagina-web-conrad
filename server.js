// server.js — desarrollo local para CONRAD
// Ejecutar: node server.js
// Luego abrir: http://localhost:3000

const http = require('http');
const fs   = require('fs');
const path = require('path');
const https= require('https');

const PORT = 3000;
const GROQ_KEY = process.env.GROQ_API_KEY || ''; // Agrega tu key en .env

const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff',
};

const SYSTEM = `Eres el asistente virtual de CONRAD Centro de Diagnóstico, en Chimaltenango, Guatemala.
Servicios: Rayos X, Ultrasonidos (5D obstétrico, Doppler), Tomografías CT, Laboratorio, Mamografía, ECG, Papanicolau, Tarjeta de pulmones.
Teléfono: 7725-2722. WhatsApp: 5460-5569. Visitadora médica: 3110-9147.
Responde en español, conciso y amable. Para precios, invita a llamar al 7725-2722.`;

function callGroq(message, cb) {
  const body = JSON.stringify({
    model: 'llama3-8b-8192',
    messages: [{ role:'system', content:SYSTEM },{ role:'user', content:message }],
    max_tokens: 350, temperature: 0.4
  });
  const req = https.request({
    hostname:'api.groq.com', path:'/openai/v1/chat/completions',
    method:'POST',
    headers:{ 'Content-Type':'application/json','Authorization':'Bearer '+GROQ_KEY,'Content-Length':Buffer.byteLength(body) }
  }, res => {
    let d=''; res.on('data',c=>d+=c);
    res.on('end',()=>{ try{ cb(null,JSON.parse(d)); }catch(e){ cb(e); } });
  });
  req.on('error',cb);
  req.write(body); req.end();
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if (req.method==='OPTIONS') { res.writeHead(204); return res.end(); }

  // API
  if (req.url==='/api/chat' && req.method==='POST') {
    let body=''; req.on('data',c=>body+=c);
    req.on('end',()=>{
      try {
        const { message } = JSON.parse(body);
        callGroq(message||'hola', (err,data)=>{
          const reply = data?.choices?.[0]?.message?.content || 'Lo siento, intenta de nuevo.';
          res.writeHead(200,{'Content-Type':'application/json'});
          res.end(JSON.stringify({ reply }));
        });
      } catch(e) {
        res.writeHead(400,{'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'Bad request'}));
      }
    });
    return;
  }

  // Static files
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(__dirname, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code==='ENOENT') { res.writeHead(404); return res.end('404 Not Found: '+urlPath); }
      res.writeHead(500); return res.end('Server Error');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext]||'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`\n✅ CONRAD server corriendo en: http://localhost:${PORT}\n`);
  console.log('   Abre ese link en tu navegador (no uses Live Server de VS Code)\n');
});
