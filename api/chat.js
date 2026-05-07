export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'API key no configurada' });

  const { message, messages: history } = req.body;

  const SYSTEM_PROMPT = `Eres el asistente virtual de CONRAD Centro de Diagnóstico, ubicado en Chimaltenango, Guatemala.

Servicios que ofrecemos:
- Rayos X (cabeza, tórax, columna, extremidades, estudios especiales)
- Ultrasonidos (abdominal, pélvico, obstétrico, mamario, tiroides, Doppler y más)
- Tomografías (cerebral, tórax, abdomen, columna, senos paranasales y más)
- Laboratorio clínico
- Mamografías
- Electrocardiograma (ECG)
- Papanicolau
- Tarjeta de pulmones

Contacto:
- Teléfono fijo: 7725-2722
- WhatsApp: 5460-5569
- Visitadora médica (médicos referentes): 3113-9147

Responde siempre en español, de forma amable, concisa y profesional. Si te preguntan sobre precios, sugiere llamar directamente. No inventes precios ni información médica no provista. Si no sabes algo, indica que llamen al 7725-2722.`;

  const chatMessages = history || [];
  if (message) chatMessages.push({ role: 'user', content: message });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...chatMessages.slice(-10) // keep last 10 messages for context
        ],
        max_tokens: 400,
        temperature: 0.4,
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
