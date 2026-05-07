export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { message } = req.body;

  const messages = [
    {
      role: 'system',
      content: 'Eres el asistente virtual de CONRAD Centro de Diagnóstico en Chimaltenango, Guatemala. Servicios: Rayos X, Ultrasonidos (5D obstétrico, Doppler), Tomografías CT, Laboratorio, Mamografía, ECG, Papanicolau, Tarjeta de pulmones. Teléfono: 7725-2722. WhatsApp: 5460-5569. Visitadora médica: 3110-9147. Responde en español, conciso y amable. Para precios invita a llamar al 7725-2722.'
    },
    { role: 'user', content: message }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.origin || 'https://conraddiagnostico.com',
        'X-Title': 'CONRAD Diagnostico'
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b-it',
        messages,
        max_tokens: 400,
        temperature: 0.3,
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();

    if (response.ok && data.choices?.[0]?.message?.content) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    }

    return res.status(502).json({ error: 'No reply', detail: data });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
