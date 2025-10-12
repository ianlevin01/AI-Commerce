import { Router } from 'express';
import OpenAI from 'openai';
import RequestService from '../services/request-service.js';
import axios from 'axios';

const router = Router();
const svc = new RequestService();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/:id_user', async (req, res) => {
  let precargadas = svc.CustomResponses(req.params.id_user)
})
const verifyToken = process.env.VERIFY_TOKEN;
router.get('/gpt/:iduser', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

async function sendWhatsAppMessage(to, message) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.META_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Mensaje enviado a WhatsApp:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar mensaje a WhatsApp:", err.response?.data || err.message);
  }
}

router.post('/gpt/:id_user', async (req, res) => {
  const message = req.body.entry[0].changes[0].value.messages[0];
  console.log(req.body.entry[0].changes[0])
  const clientNumber = message.from;
  const userMessage = message.text.body;
  const clientEmail = req.body.email || null;

  const bot_response = await svc.BotResponse(req.params.id_user, clientNumber, clientEmail); 
  await svc.GuardarConversacion(req.params.id_user, clientNumber, clientEmail, userMessage);
  const queries_available = await svc.QueriesAvailable(req.params.id_user);
  const conversaciones = await svc.Conversaciones(req.params.id_user, clientNumber, clientEmail);
  const customExamples = await svc.UserFaqs(req.params.id_user);

  if (queries_available && bot_response) {
    try {
      // 👉 Convertir historial a formato que entiende GPT
      const historial = conversaciones.map(c => ({
        role: "user",
        content: c.message
      }));
      const ejemplos = (customExamples || []).flatMap(example => ([
        { role: "user", content: example.question },
        { role: "assistant", content: example.answer }
      ]));

      const baseMessages = [
        {
          role: "system",
          content: `Sos un bot de atención al cliente para WhatsApp que responde sobre productos, pedidos y envíos en una tienda online Tiendanube. Debes usar toda la información previa que el cliente haya dicho para responder sus preguntas. Responde siempre basado en el historial de mensajes anteriores que el usuario haya enviado y las conversaciones precargadas. Si detectas que el mensaje se parece a algun mensaje precargado responde de la forma indicada. Sé breve y claro.`
        },
        ...ejemplos,
        ...historial,
        {
          role: "user",
          content: userMessage
        }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: baseMessages,
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
            name: "StorePolicies",
            description: "Devuelve información sobre las politicas de la tienda, envios, despachos, devoluciones, etc.",
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
            name: "ShippingMethods",
            description: "Devuelve información sobre la empresa de envios que usa, si se puede retirar y donde etc.",
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
            name: "EstadoCompra",
            description: "Devuelve información sobre una compra en particular",
            parameters: {
              type: "object",
              properties: {
                id_user: {
                  type: "integer",
                  description: `el id del usuario es ${req.params.id_user}`
                },
                id_order: {
                  type: "integer",
                  description: "es el número de la compra, si no te lo dijo, pedíselo"
                }
              },
              required: ["id_user", "id_order"]
            }
          },
          {
            name: "StoreInfo",
            description: "Devuelve información sobre la página, el mail, el nombre, la URL",
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
            name: "HumanResponse",
            description: "Llama a esta función si es necesaria la intervención de un asesor humano",
            parameters: {
              type: "object",
              properties: {
                id_user: {
                  type: "integer",
                  description: `el id del usuario es ${req.params.id_user}`
                },
                client_number: {
                  type: "integer",
                  description: `el número del cliente es ${clientNumber}`
                },
                client_email: {
                  type: "string",
                  description: `el email del cliente es ${clientEmail}`
                }
              },
              required: ["id_user", "client_number", "client_email"]
            }
          }
        ],
        function_call: "auto"
      });

      const choice = completion.choices[0];

      if (choice.finish_reason === "function_call") {
        const { name, arguments: argsJson } = choice.message.function_call;
        const args = JSON.parse(argsJson);

        if (typeof svc[name] === "function") {
          const result = await svc[name](...Object.values(args));

          const finalCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              ...baseMessages,
              {
                role: "function",
                name,
                content: JSON.stringify(result)
              }
            ]
          });

          const reply = finalCompletion.choices[0].message.content;
          await sendWhatsAppMessage(clientNumber, reply);

          res.sendStatus(200);  
        } else {
          res.status(400).json({ error: `La función ${name} no existe en el servicio.` });
        }
      } else {
        const reply = choice.message.content;
        await sendWhatsAppMessage(clientNumber, reply);

        res.sendStatus(200); 
      }
    } catch (error) {
      console.error('❌ Error al generar respuesta:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  } else {
    res.status(200).send("No puedo contestar en estos momentos. Intente nuevamente más tarde.");
  }
});


export default router;
