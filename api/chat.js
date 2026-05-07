module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'API key no configurada' });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message' });

  const SYSTEM = `Eres el asistente virtual de CONRAD Centro de Diagnóstico en Chimaltenango, Guatemala.
Servicios: Rayos X, Ultrasonidos (5D obstétrico, Doppler), Tomografías CT, Laboratorio, Mamografía, ECG, Papanicolau, Tarjeta de pulmones.
Teléfono: 7725-2722. WhatsApp: 5460-5569. Visitadora médica: 3110-9147.
Responde en español, conciso y amable. Para precios invita a llamar al 7725-2722.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: message }
        ],
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (response.ok && data.choices?.[0]?.message?.content) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    }

    return res.status(502).json({ error: 'Groq error', detail: data });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
