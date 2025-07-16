import { Router } from 'express';
import OpenAI from 'openai';
import RequestService from '../services/request-service.js';

const router = Router();
const svc = new RequestService();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/:id_user', async (req, res) => {
  svc.EstadoCompra(req.params.id_user,100)

})

router.post('/gpt/:id_user', async (req, res) => {
  const userMessage = req.body.text;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Sos un bot de atención al cliente para WhatsApp que responde sobre productos, pedidos y envíos en una tienda online Tiendanube. Usa las funciones definidas solo y solo si es necesario usarlas, sino no las uses. responde lo mas breve posible`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      functions: [
        {
        name: "ProductosInfo",
        description: "Devuelve información de los productos de la tienda",
        parameters: {
          type: "object",
          properties: {
            id_user: {
              type: "integer",
              description: `el id del usuario es ${req.params.id_user}`
            }
          },
          required: ["id_user"]
        }
      },
        {
          name: "Politicas",
          description: "Devuelve información sobre la politica de envíos, devoluciones, despachos, etc.",
        },
        {
          name: "EstadoCompra",
          description: "Devuelve información sobre una compra en particular",
          parameters: {
            type: "object",
            properties: {
              id_user: {
                type: "integer", // mejor usar "integer" en lugar de "int"
                description: `el id del usuario es ${req.params.id_user}`
              },
              id_order: {
                type: "integer",
                description: "es el numero de la compra, si no te lo dijo, pediselo"
              }
            },
            required: ["id_user", "id_order"] 
          }
        }
      ],
      function_call: "auto"
    });

    const choice = completion.choices[0];

    if (choice.finish_reason === "function_call") {
      const { name, arguments: argsJson } = choice.message.function_call;
      const args = JSON.parse(argsJson);

      // Verificamos si el método existe en el servicio
      if (typeof svc[name] === "function") {
        const result = await svc[name](...Object.values(args));

        const finalCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "Sos un bot de atención al cliente para WhatsApp que responde sobre productos, pedidos y envíos." },
            { role: "user", content: userMessage },
            {
              role: "function",
              name,
              content: JSON.stringify(result)
            }
          ]
        });

        const reply = finalCompletion.choices[0].message.content;
        res.json({ reply });
      } else {
        res.status(400).json({ error: `La función ${name} no existe en el servicio.` });
      }
    } else {
      // GPT respondió directamente sin llamar a funciones
      const reply = choice.message.content;
      res.json({ reply });
    }

  } catch (error) {
    console.error('❌ Error al generar respuesta:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
