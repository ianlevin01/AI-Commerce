import { Router } from 'express';
import OpenAI from 'openai';
import RequestService from '../services/request-service.js';
const router = Router();
const svc = new RequestService();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/gpt', async (req, res) => {
  const userMessage = req.body.text;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Necesito que contestes como un bot para whatsapp para una empresa de ecommerce, las personas te van a hacer preguntas sobre los productos, vos tenes que responder de manera clara y consisa deacuerdo con la descripcion de los productos que te voy a dar a continuacion:" + process.env.INSTRUCCIONES
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply }); // 🟢 Respondé al frontend con el texto completo

  } catch (error) {
    console.error('❌ Error al generar respuesta:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
